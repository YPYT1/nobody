import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 钢毛皮甲	"在受到伤害时触发，将尖刺喷射向敌人，对附近的敌人造成伤害。
特效：钢背刺针扫射
内置cd：1秒
伤害系数：攻击力150%·风元素伤害
作用范围：自身范围500码"
 */
@registerAbility()
export class arms_t2_2 extends BaseArmsAbility {

    mdf_name = "modifier_arms_t2_2";

    _OnUpdateKeyValue(): void {
        this.AffectedAdd()
    }

    AffectedEffectStart(event: ModifierAttackEvent): void {
        print("arms_t2_2", this.ArmsActTime, this.arms_cd)
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
export class modifier_arms_t2_2 extends BaseArmsModifier { }




