import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
 * 穿透
 * 攻击可以穿透敌人，伤害提高30%。技能赋予风元素效果，伤害变为风元素伤害。
 */
@registerAbility()
export class drow_1b extends drow_1 {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1b"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a as number;;
            ApplyCustomDamage({
                victim: target,
                attacker: this.GetCaster(),
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.wind
            })
        }
    }
}

@registerModifier()
export class modifier_drow_1b extends modifier_drow_1 {

    projectiles_speed: number;
    wave_width: number;

    UpdateSpecialValue(): void {
        this.wave_width = 128;
        this.projectiles_speed = 1600;
        this.fakeAttack = true;
        this.useProjectile = false;
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_ATTACK_START,
        ]
    }

    // OnIntervalThink(): void {
    //     if (this.caster.AttackReady()) {
    //         let attackrange = this.caster.Script_GetAttackRange() + 64;
    //         let enemies = FindUnitsInRadius(
    //             this.team,
    //             this.caster.GetAbsOrigin(),
    //             null,
    //             attackrange,
    //             UnitTargetTeam.ENEMY,
    //             UnitTargetType.HERO + UnitTargetType.BASIC,
    //             UnitTargetFlags.NONE,
    //             FindOrder.CLOSEST,
    //             false
    //         )
    //         if (enemies.length <= 0) { return }
    //         let hTarget = enemies[0];
    //         this.caster.in_process_attack = true;
    //         this.caster.PerformAttack(
    //             hTarget,
    //             true, // useCastAttackOrb
    //             true, // processProcs
    //             false, // skipCooldown
    //             false, // ignoreInvis
    //             false, // useProjectile
    //             true, // fakeAttack
    //             false // neverMiss
    //         );
    //         this.caster.in_process_attack = false;
    //         // 投射物
    //         this.PlayEffect({ hTarget: hTarget })
    //     }
    // }

   

    OnAttackStart(event: ModifierAttackEvent): void {
        if (event.attacker != this.GetParent()) { return }
        // print("OnAttackStart")
        this.caster.PerformAttack(
            event.target,
            true, // useCastAttackOrb
            true, // processProcs
            false, // skipCooldown
            false, // ignoreInvis
            false, // useProjectile
            true, // fakeAttack
            false // neverMiss
        );
        this.PlayAttackStart({ hTarget: event.target })
    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        let attackrange = this.caster.Script_GetAttackRange() + 64;
        let vCaster = this.caster.GetAbsOrigin();
        let vTarget = hTarget.GetAbsOrigin()
        let vDirection = (vTarget - vCaster as Vector).Normalized();
        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * (1 + 0.3);
        vDirection.z = 0;
        let vVelocity = vDirection * this.projectiles_speed as Vector;

        // this.caster.in_process_attack = false;
        this.LaunchArrows(vCaster, vVelocity, attackrange * 1.3, ability_damage);
        if (RollPercentage(50)) {
            this.caster.SetContextThink(DoUniqueString("shot"), () => {
                this.LaunchArrows(vCaster, vVelocity, attackrange, ability_damage);
                return null
            }, 0.1)

        }
    }
    
    LaunchArrows(vCaster: Vector, vVelocity: Vector, fDistance: number, ability_damage: number) {
        ProjectileManager.CreateLinearProjectile({
            EffectName: "particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf",
            Ability: this.GetAbility(),
            vSpawnOrigin: vCaster,
            vVelocity: vVelocity,
            fDistance: fDistance,
            fStartRadius: this.wave_width,
            fEndRadius: this.wave_width,
            Source: this.caster,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            ExtraData: {
                a: ability_damage,
            }
        })
        this.caster.GiveMana(5);
    }
}
