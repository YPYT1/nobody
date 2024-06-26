import { registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 在自身%skv_aoe_radius%码释放具有破坏力的水波攻击。

伤害系数：攻击力100%*冰元素伤害
 */
@registerAbility()
export class arms_2 extends BaseArmsAbility {

    aoe_radius: number;

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_siren/naga_siren_riptide.vpcf", context);
    }

    InitCustomAbilityData(): void {
        this.RegisterEvent(["OnArmsInterval"])
    }

    UpdataCustomKeyValue(): void {
        this.aoe_radius = this.GetSpecialValueFor("skv_aoe_radius");
    }
    
    OnArmsInterval(): void {
        this.ability_damage = this.GetAbilityDamage();
        
        // print("skv_aoe_radius", this.GetAbilityName(), this.aoe_radius)
        // const vOrigin = this.caster.GetOrigin();
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_siren/naga_siren_riptide.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.aoe_radius, this.aoe_radius, this.aoe_radius));
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





