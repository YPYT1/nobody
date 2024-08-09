import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

@registerAbility()
export class innate_omniknight extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_innate_omniknight"
    }
}

@registerModifier()
export class modifier_innate_omniknight extends BaseModifier {

    caster: CDOTA_BaseNPC;
    ability: CDOTABaseAbility;
    aoe_radius: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.ability = this.GetAbility();
        this.caster = this.GetCaster();
        this.OnRefresh(params)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.aoe_radius = this.ability.GetSpecialValueFor("aoe_radius")
        this.StartIntervalThink(0.3)
    }

    OnIntervalThink(): void {
        if (!this.caster.IsAlive()) {
            this.StartIntervalThink(-1)
            return
        }
        if (!this.ability.IsCooldownReady()) { return }
        this.ability.StartCooldown(4)
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_omniknight/omniknight_purification.vpcf",
            ParticleAttachment.ABSORIGIN,
            this.caster
        )
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(this.aoe_radius, 0, 0))
        ParticleManager.ReleaseParticleIndex(cast_fx)
    }
}