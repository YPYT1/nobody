import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";


@registerModifier()
export class modifier_mission_dire_4_thinker extends BaseModifier {

    aura_radius: number;
    parent: CDOTA_BaseNPC;
    effect_fx: ParticleID;
    pre_add_value: number;
    viewer: ViewerID;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return this.aura_radius; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_mission_dire_4_thinker_aura"; }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.STUNNED]: true,
        }
    }

    OnCreated(params: any): void {
        this.aura_radius = 100;
        if (!IsServer()) { return }

        this.parent = this.GetParent();
        let max_distance = params.max_distance as number;
        let interval = 0.1
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_razor/razor_plasmafield.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(effect_fx, 0, this.parent.GetAbsOrigin())
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(100, this.aura_radius, 1))
        this.AddParticle(effect_fx, false, false, 1, false, false);
        this.effect_fx = effect_fx
        this.pre_add_value = max_distance * interval / this.GetDuration();
        this.viewer = AddFOWViewer(DotaTeam.GOODGUYS, this.parent.GetAbsOrigin(), 300, this.GetDuration(), false)
        this.StartIntervalThink(interval)
    }

    OnIntervalThink(): void {
        this.aura_radius += this.pre_add_value
        ParticleManager.SetParticleControl(this.effect_fx, 1, Vector(this.pre_add_value * 10, this.aura_radius, 1))
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        // 任务结束
        RemoveFOWViewer(DotaTeam.GOODGUYS, this.viewer)
        GameRules.MissionSystem.DireMissionHandle.MissionOverTime();
        UTIL_Remove(this.GetParent());
    }
}

@registerModifier()
export class modifier_mission_dire_4_thinker_aura extends BaseModifier {


    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.caster = this.GetCaster();
        this.OnIntervalThink()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let damage = this.parent.GetMaxHealth() * 0.4;
        print("Hit", damage)
        ApplyCustomDamage({
            victim: this.parent,
            attacker: this.caster,
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })

    }
}