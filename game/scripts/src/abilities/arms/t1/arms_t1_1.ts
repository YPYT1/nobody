import { modifier_motion_surround } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

@registerAbility()
export class arms_t1_1 extends BaseArmsAbility {

    mdf_name = "modifier_arms_t1_1";

    _OnUpdateKeyValue(): void {
        this.ArmsAdd()
    }
    
    ArmsEffectStart(): void {
        let count = 3;
        let surround_qangle = 360 / count;
        let summoned_duration = this.GetSpecialValueFor("summoned_duration");
        for (let i = 0; i < count; i++) {
            let summoned = CreateSummonedDummy(this.caster.GetAbsOrigin(), this.caster);
            summoned.AddNewModifier(this.caster, this, "modifier_arms_t1_1_summoned", {
                duration: summoned_duration,
                surround_distance: 300,
                surround_qangle: surround_qangle * i,
                surround_speed: 600,
                surround_entity: this.caster.entindex(),
            });
        }
    }
}

@registerModifier()
export class modifier_arms_t1_1 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_t1_1_summoned extends modifier_motion_surround {

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 72; }
    IsAuraActiveOnDeath() { return false; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_arms_t1_1_summoned_collision"; }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
        };
    }

    C_OnCreated(params: any): void {
        let Vpcf1 = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_wisp/wisp_guardian_.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(Vpcf1, false, false, 1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent());
    }
}

@registerModifier()
export class modifier_arms_t1_1_summoned_collision extends BaseModifier {

    IsHidden(): boolean { return true; }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE;
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let ability_damage = this.GetAbility().GetAbilityDamage();
        ApplyCustomDamage({
            victim: this.GetParent(),
            attacker: this.GetCaster(),
            damage: ability_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypeEnum.thunder,
        })

        let hAuraUnit = this.GetAuraOwner()
        let pfx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_wisp/wisp_guardian_explosion.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        );
        ParticleManager.SetParticleControl(pfx, 0, hAuraUnit.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(pfx);

        UTIL_Remove(hAuraUnit)

    }
}