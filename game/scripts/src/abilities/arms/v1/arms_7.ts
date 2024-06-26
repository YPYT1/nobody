import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsMdf_Dot, BaseArmsModifier } from "../base_arms_ability";

/**
 * 引燃	"对500码内的%extra_count%个敌人投射燃烧弹，导致其被火焰吞噬,每秒造成火元素,持续%debuff_duration%秒
伤害公式：%DamageFormula%"
 */
@registerAbility()
export class arms_7 extends BaseArmsAbility {

    skv_dot_interval: number;
    skv_dot_duration: number;
    skv_missile_count: number;

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    UpdataCustomKeyValue(): void {
        this.skv_dot_duration = this.GetSpecialValueFor("skv_dot_duration");
        this.skv_dot_interval = this.GetSpecialValueFor("skv_dot_interval")
        this.skv_missile_count = this.GetSpecialValueFor("skv_missile_count")
    }
    
    OnArmsInterval(): void {
        let count = 0;
        this.ability_damage = this.GetAbilityDamage();
        const missile_speed = this.GetSpecialValueFor("skv_missile_speed");
        const missile_count = this.GetSpecialValueFor("skv_missile_count");
        const vPoint = this.caster.GetOrigin();
        let enemies = FindUnitsInRadius(
            this.caster.GetTeam(),
            vPoint,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let enemy of enemies) {
            if (count < missile_count) {
                count += 1;
                ProjectileManager.CreateTrackingProjectile({
                    Target: enemy,
                    Source: this.caster,
                    Ability: this,
                    EffectName: "particles/units/heroes/hero_ogre_magi/ogre_magi_ignite.vpcf",
                    iMoveSpeed: missile_speed,
                    vSourceLoc: vPoint,
                    bDodgeable: false,
                    bProvidesVision: false,
                });
            }
        }
    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
        if (target) {
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: this.element_type
            });

            target.AddNewModifier(this.caster, this, "modifier_arms_7_dot", {
                dot_damage: this.ability_damage,
                dot_interval: this.skv_dot_interval,
                duration: this.skv_dot_duration,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_arms_7 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_7_dot extends BaseArmsMdf_Dot {

    GetEffectName(): string {
        return "particles/units/heroes/hero_ogre_magi/ogre_magi_ignite_debuff.vpcf"
    }
}