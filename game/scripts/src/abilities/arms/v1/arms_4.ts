import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 引燃	"对500码内的%extra_count%个敌人投射燃烧弹，导致其被火焰吞噬,每秒造成火元素,持续%debuff_duration%秒
伤害公式：%DamageFormula%"
 */
@registerAbility()
export class arms_4 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        let count = 0;
        // this.debuff_duration = this.GetSpecialValueFor("debuff_duration");
        this.ability_damage = this.GetAbilityDamage();
        const projectile_speed = this.GetSpecialValueFor("projectile_speed");
        const extra_count = this.GetSpecialValueFor("extra_count");
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
            if (count < extra_count) {
                count += 1;
                ProjectileManager.CreateTrackingProjectile({
                    Target: enemy,
                    Source: this.caster,
                    Ability: this,
                    EffectName: "particles/units/heroes/hero_ogre_magi/ogre_magi_ignite.vpcf",
                    iMoveSpeed: projectile_speed,
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
            
            // target.AddNewModifier(this.caster, this, "modifier_arms_4_dot", {
            //     dot_damage: this.ability_damage,
            //     dot_interval: 1,
            //     dot_element: ElementTypeEnum.fire,
            //     duration: this.debuff_duration,
            // })
            return true
        }
    }
}

@registerModifier()
export class modifier_arms_4 extends BaseArmsModifier {

}