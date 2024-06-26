import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * "对附近%skv_aoe_radius%范围内的敌人放出尖利的刀刃，击中时造成目标伤害并削减最大生命值一定的百分比

伤害系数：%DamageFormula%
削减最大生命值：2%"

 */
@registerAbility()
export class arms_3 extends BaseArmsAbility {

    aoe_radius: number;

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    UpdataCustomKeyValue(): void {
        this.aoe_radius = this.GetSpecialValueFor("skv_aoe_radius");
    }

    OnArmsInterval(): void {
        this.ability_damage = this.GetAbilityDamage();
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_phantom_assassin/phantom_assassin_shard_fan_of_knives.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        ParticleManager.ReleaseParticleIndex(effect_fx);

        const vOrigin = this.caster.GetOrigin();
        let enemies = FindUnitsInRadius(
            this.caster.GetTeam(),
            vOrigin,
            null,
            this.aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: this.element_type
            });
        }
    }

}
@registerModifier()
export class modifier_arms_3 extends BaseArmsModifier {}