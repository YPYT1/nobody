import { modifier_motion_surround } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

@registerAbility()
export class arms_1 extends BaseArmsAbility {

    spirit_list: CDOTA_BaseNPC[];
    spirit_limit: number;

    _OnUpdateKeyValue(): void {
        this.spirit_limit = this.GetSpecialValueFor("spirit_limit");
        if (this.spirit_list == null) { this.spirit_list = [] }
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        if (this.spirit_list.length < this.spirit_limit) {
            let summoned_duration = this.GetSpecialValueFor("summoned_duration");
            let hSpirit = GameRules.SummonedSystem.CreatedUnit(
                "npc_summoned_dummy",
                this.caster.GetAbsOrigin() + Vector(0, 300, 0) as Vector,
                this.caster,
                summoned_duration,
                true
            )
            hSpirit.AddNewModifier(this.caster, this, "modifier_arms_1_summoned", {
                duration: summoned_duration,
                surround_distance: 300,
                surround_qangle: 0,
                surround_speed: 900,
                surround_entity: this.caster.entindex(),
            });
            this.spirit_list.push(hSpirit)
        }
    }

    _RemoveSelf(): void {
        for (let hSpirit of this.spirit_list) {
            if (hSpirit.IsNull() == false) {
                hSpirit.RemoveModifierByName("modifier_arms_1_summoned");
            }
        }
    }
}

@registerModifier()
export class modifier_arms_1 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_1_summoned extends modifier_motion_surround {

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 80; }
    IsAuraActiveOnDeath() { return false; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_arms_1_summoned_collision"; }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
            [ModifierState.UNSELECTABLE]: true,
        };
    }

    C_OnCreated(params: any): void {
        let hParent = this.GetParent();
        hParent.summoned_damage = this.GetAbility().GetAbilityDamage();
        let Vpcf1 = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_wisp/wisp_guardian_.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(Vpcf1, false, false, 1, false, false);
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent();
        let hAbility = this.GetAbility() as arms_1;
        if (hAbility) {
            let index = hAbility.spirit_list.indexOf(hParent);
            if (index != -1) { hAbility.spirit_list.splice(index, 1) }
        }
        UTIL_Remove(hParent);
    }
}

@registerModifier()
export class modifier_arms_1_summoned_collision extends BaseModifier {

    IsHidden(): boolean { return true; }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE;
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hAuraUnit = this.GetAuraOwner()
        let vPoint = hAuraUnit.GetAbsOrigin();

        let pfx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_wisp/wisp_guardian_explosion.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        );
        ParticleManager.SetParticleControl(pfx, 0, hAuraUnit.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(pfx);

        let ability_damage = hAuraUnit.summoned_damage;
        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            vPoint,
            null,
            300,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypeEnum.thunder,
            })
        }

        hAuraUnit.RemoveModifierByName("modifier_arms_1_summoned")
    }
}