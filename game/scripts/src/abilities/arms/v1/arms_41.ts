import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 刺针扫射	
"将尖刺喷射向敌人，对自身%aoe_radius%范围的敌人造成伤害。
伤害公式：%DamageFormula%
 */
@registerAbility()
export class arms_41 extends BaseArmsAbility {

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    OnArmsInterval(): void {
        const aoe_radius = this.GetSpecialValueFor("aoe_radius");
        const vPoint = this.caster.GetAbsOrigin();
        let ability_damage = this.GetAbilityDamage();
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_bristleback/bristleback_quill_spray.vpcf",
            ParticleAttachment.POINT,
            this.caster
        )
        ParticleManager.ReleaseParticleIndex(cast_fx);
        const enemies = FindUnitsInRadius(
            this.team,
            vPoint,
            null,
            aoe_radius,
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
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: this.element_type,
            })
        }
    }
}

@registerModifier()
export class modifier_arms_41 extends BaseArmsModifier { }




