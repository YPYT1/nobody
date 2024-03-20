import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

@registerAbility()
export class arms_2 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_2"
    }
}

@registerModifier()
export class modifier_arms_2 extends BaseModifier {

    duration: number;
    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility;

    OnCreated(params: object): void {
        this.OnRefresh(params)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.ability = this.GetAbility();
        this.caster = this.GetCaster();
        this.duration = this.ability.GetSpecialValueFor("duration");
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let hCaster = this.GetCaster();
        if (hCaster.IsAlive() == false || this.ability == null) {
            this.StartIntervalThink(-1)
            return
        }


        if (this.GetAbility().IsCooldownReady()) {
            this.GetAbility().UseResources(false, false, false, true);
            this.GetAbility().SetFrozenCooldown(true);
            this.caster.AddNewModifier(this.caster, this.ability, "modifier_arms_2_ring", {
                duration: this.duration,
            })
        }
    }

}

@registerModifier()
export class modifier_arms_2_ring extends BaseModifier {

    ability_range: number;
    ability_damage: number;
    parent: CDOTA_BaseNPC;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.ability_range = this.GetAbility().GetSpecialValueFor("radius");
        this.parent = this.GetParent();
        this.ability_damage = this.parent.GetAverageTrueAttackDamage(null);

        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_razor/razor_plasmafield.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(9000, 300, 1))
        this.AddParticle(effect_fx, false, false, -1, false, false)
        this.OnIntervalThink()
        this.StartIntervalThink(0.5)
    }

    OnIntervalThink(): void {
        let hParent = this.GetParent()
        let enemies = FindUnitsInRing(
            DotaTeam.GOODGUYS,
            this.parent.GetAbsOrigin(),
            300, 24,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE
        )

        for (let hUnit of enemies) {
            ApplyCustomDamage({
                victim: hUnit,
                attacker: this.parent,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: "thunder",
            })
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        this.GetAbility().SetFrozenCooldown(false)
    }
}