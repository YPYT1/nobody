import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 自爆	"英雄阵亡时，造成爆炸伤害。

伤害系数：攻击力500%·火元素伤害
作用范围：自身为中心直径500码"

 */
@registerAbility()
export class arms_40 extends BaseArmsAbility {

    OnDeath(): void {
        const ability_damage = this.GetAbilityDamage();
        const aoe_radius = this.GetSpecialValueFor("aoe_radius")
        let enemies = FindUnitsInRadius(
            this.team,
            this.caster.GetAbsOrigin(),
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
                element_type: ElementTypeEnum.fire
            });
        }
        // particles/units/heroes/hero_techies/techies_remote_cart_explode.vpcf
        let nFXIndex = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_techies/techies_blast_off.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(nFXIndex, 0, this.caster.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(nFXIndex);


    }
}

@registerModifier()
export class modifier_arms_40 extends BaseArmsModifier { }
