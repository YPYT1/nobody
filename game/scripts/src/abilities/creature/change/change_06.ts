//change_06.ts
/**
 * name:Windranger（风行者的强力击）
 * Description:主动使用:对700码单体单位投掷出飞镖造成800点伤害
 * 风行者射出一支强力的箭矢，这支箭会对穿过的所有敌方单位造成伤害，每伤害一个单位，箭矢的伤害和减速效果都会降低(在基础移动速度和基础伤害的基础上以每命中一个单位就减少15%，并且路径上被命中的这个英雄也要受到15%伤害)
 * hero:风行者
 * base_Powershot_damage 800 (基础伤害) base_Powershot_move 900 （基础移动速度）base_damage_move_coefficient 0.15 （减少百分比）cast_range 3000 （攻击距离）

 * 技能类型：DOTA_ABILITY_BEHAVIOR_POINT
 * 目标类型：DOTA_UNIT_TARGET_HERO | DOTA_UNIT_TARGET_BASIC
 * 队伍：DOTA_UNIT_TARGET_TEAM_ENEMY
 * 放箭的特效:particles/units/heroes/hero_windrunner/windrunner_spell_powershot_destruction.vpcf */
import { registerAbility } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

@registerAbility()
export class change_06 extends BaseCreatureAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf', context);
        PrecacheResource('particle', 'particles/units/heroes/hero_windrunner/windrunner_spell_powershot_destruction.vpcf', context);
    }

    target: CDOTA_BaseNPC;

    private pierceWidth: number = 120;

    private finalDamageToTarget: number = 0;

    private finalSpeedToTarget: number = 0;

    OnAbilityPhaseStart(): boolean {
        this.caster = this.GetCaster();
        const cast_range = this.GetSpecialValueFor('cast_range');
        const origin = this.caster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(cast_range, this._cast_point, origin);
        return true;
    }

    OnAbilityPhaseInterrupted(): void {
        this.DestroyWarningFx();
    }

    OnSpellStart(): void {
        print('--------强力击开始技能');
        this.DestroyWarningFx();
        this.caster = this.GetCaster();
        this.target = this.GetCursorTarget();
        const baseDamage = this.GetSpecialValueFor('base_Powershot_damage');
        const baseMove = this.GetSpecialValueFor('base_Powershot_move');
        const coef = this.GetSpecialValueFor('base_damage_move_coefficient');
        const startPos = this.caster.GetAbsOrigin();
        const cursorPos = this.GetCursorPosition();
        const cast_range = this.GetSpecialValueFor('cast_range');
        const direction = (cursorPos.__sub(startPos) as Vector).Normalized();
        const desiredDistance = (cursorPos.__sub(startPos) as Vector).Length2D();
        const distance = math.min(desiredDistance, cast_range);
        const vVelocity = (direction * baseMove) as Vector;

        const p_info: CreateLinearProjectileOptions = {
            EffectName: 'particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf',
            Ability: this,
            Source: this.caster,
            vSpawnOrigin: startPos,
            vVelocity: vVelocity,
            fDistance: distance,
            fStartRadius: this.pierceWidth,
            fEndRadius: this.pierceWidth,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            bIgnoreSource: true,
            ExtraData: {
                baseDamage: baseDamage,
                coef: coef,
                pathHitCount: 0,
            },
        };
        ProjectileManager.CreateLinearProjectile(p_info);
        const endPos = (startPos + direction * distance) as Vector;
        const enemies = FindUnitsInLine(
            this.caster.GetTeamNumber(),
            startPos,
            endPos,
            null,
            this.pierceWidth,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE
        );

        let pathHitCount = 0;
        let finalTarget: CDOTA_BaseNPC | undefined = undefined;
        let maxDist = -1;
        for (const enemy of enemies) {
            const d = ((enemy.GetAbsOrigin() - startPos) as Vector).Length2D();
            if (d > maxDist) {
                maxDist = d;
                finalTarget = enemy;
            }
        }
        this.target = finalTarget as CDOTA_BaseNPC;
        for (const enemy of enemies) {
            if (enemy !== this.target && enemy.IsAlive()) {
                pathHitCount += 1;
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: baseDamage * coef,
                    damage_type: DamageTypes.PHYSICAL,
                });
                const hit_fx = ParticleManager.CreateParticle(
                    'particles/units/heroes/hero_windrunner/windrunner_spell_powershot_destruction.vpcf',
                    ParticleAttachment.WORLDORIGIN,
                    undefined
                );
                ParticleManager.SetParticleControl(hit_fx, 0, enemy.GetAbsOrigin());
                ParticleManager.ReleaseParticleIndex(hit_fx);
            }
        }
        print('pathHitCount:', pathHitCount);

        const NewFactor = math.max(0, 1 - coef * pathHitCount);
        this.finalDamageToTarget = baseDamage * NewFactor;
        print('finalDamageToTarget:', this.finalDamageToTarget);

        this.finalSpeedToTarget = math.max(150, baseMove * NewFactor);
        print('finalSpeedToTarget:', this.finalSpeedToTarget);
        if (this.target && this.target.IsAlive()) {
            ApplyCustomDamage({
                victim: this.target,
                attacker: this.caster,
                damage: this.finalDamageToTarget,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
            });
            const hit_fx2 = ParticleManager.CreateParticle(
                'particles/units/heroes/hero_windrunner/windrunner_spell_powershot_destruction.vpcf',
                ParticleAttachment.WORLDORIGIN,
                undefined
            );
            ParticleManager.SetParticleControl(hit_fx2, 0, this.target.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(hit_fx2);
        }
        this.caster.EmitSound('sounds/vo/windrunner/wind_ability_powershot_06.vsnd');
        print('--------结束技能');
    }
}
