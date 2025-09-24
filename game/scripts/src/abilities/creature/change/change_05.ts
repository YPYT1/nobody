//change_05.ts
/**
 * name:屠戮钩链
 * Description:主动使用:向一个地点投掷血腥的肉钩，肉钩将把所接触到的第一个单位钩回屠夫身边。
 * 如果这是一个敌方单位，会造成100点伤害。射程700码,冷却20秒
 * hero:屠夫
 * damage 100 （100点伤害） cast_range 700（射程）
 * 这个技能就完全模仿帕吉的肉钩 这个技能
 * 钩子伸出去的特效：
 */
import { reloadable } from '../../../utils/tstl-utils';
import { registerAbility } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

@registerAbility()
@reloadable
export class change_05 extends BaseCreatureAbility {
    Precache(context: CScriptPrecacheContext): void {
        // 钩链飞行与命中特效（可按需替换）
        PrecacheResource('particle', 'particles/units/heroes/hero_pudge/pudge_meathook.vpcf', context);
        PrecacheResource('particle', 'particles/units/heroes/hero_pudge/pudge_meathook_impact.vpcf', context);
    }

    OnSpellStart(): void {
        if (!IsServer()) return;

        const caster = this.GetCaster();
        const targetPoint = this.GetCursorPosition();
        const origin = caster.GetAbsOrigin();

        const cast_range = this.GetSpecialValueFor('cast_range');
        const speed = 1400; // 线性弹道速度

        const direction = ((targetPoint - origin) as Vector).Normalized();
        direction.z = 0;
        const vVelocity = (direction * speed) as Vector;

        ProjectileManager.CreateLinearProjectile({
            EffectName: 'particles/units/heroes/hero_pudge/pudge_meathook.vpcf',
            Ability: this,
            vSpawnOrigin: origin,
            vVelocity: vVelocity,
            fDistance: cast_range,
            fStartRadius: 64,
            fEndRadius: 64,
            Source: caster,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            bHasFrontalCone: false,
            bProvidesVision: false,
            ExtraData: {
                cx: origin.x,
                cy: origin.y,
            },
        });
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (!target) {
            return;
        }

        const caster = this.GetCaster();
        if (!target.IsAlive()) {
            return;
        }

        const damage = this.GetSpecialValueFor('damage');

        const fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_pudge/pudge_meathook_impact.vpcf',
            ParticleAttachment.WORLDORIGIN,
            undefined
        );
        ParticleManager.SetParticleControl(fx, 0, target.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(fx);

        // 造成伤害
        ApplyCustomDamage({
            victim: target,
            attacker: caster,
            damage: damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this,
        });

        // 将命中的单位拉回施法者位置
        const cx = extraData?.cx ?? caster.GetAbsOrigin().x;
        const cy = extraData?.cy ?? caster.GetAbsOrigin().y;
        target.AddNewModifier(caster, this, 'modifier_generic_arc_lua', {
            target_x: cx,
            target_y: cy,
            speed: 1600,
            height: 0,
            isStun: 1, 
            isRestricted: 1,
            fix_duration: 1,
        });
    }
}

