import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";


@registerModifier()
export class modifier_mission_dire_3_thinker extends BaseModifier {

    sun_radius: number;
    sun_delay: number;
    sun_interval: number;
    caster: CDOTA_BaseNPC;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetParent();
        this.sun_radius = params.sun_radius
        this.sun_delay = params.sun_delay
        this.sun_interval = params.sun_interval;
        this.StartIntervalThink(this.sun_interval)
    }

    OnIntervalThink(): void {
        for (let hHero of HeroList.GetAllHeroes()) {
            if (hHero.IsAlive()) {
                let sun_vect = hHero.GetAbsOrigin() + Vector(RandomInt(-250, 250), RandomInt(-250, 250), 0) as Vector;
                CreateModifierThinker(
                    this.caster,
                    null,
                    "modifier_mission_dire_3_sun_strike",
                    {
                        duration: this.sun_delay,
                        sun_radius: this.sun_radius,
                    },
                    sun_vect,
                    DotaTeam.BADGUYS,
                    false
                )
            }
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.MissionSystem.DireMissionHandle.MissionOverTime()
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_mission_dire_3_sun_strike extends BaseModifier {

    sun_radius: number;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.sun_radius = params.sun_radius;
        let delay = this.GetDuration()
        let warning_fx = GameRules.WarningMarker.Circular(
            this.sun_radius, delay, this.GetParent().GetAbsOrigin(), false, Vector(255, 0, 0))
        this.AddParticle(warning_fx,false,false,-1,false,false)
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_invoker/invoker_sun_strike_team.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.sun_radius, 0, 0));
        this.AddParticle(effect_fx, false, false, -1, false, false);
        this.GetParent().EmitSound("Hero_Invoker.SunStrike.Charge");
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent()
        let vParent = hParent.GetAbsOrigin()
        hParent.EmitSound("Hero_Invoker.SunStrike.Ignite");
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_invoker/invoker_sun_strike.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        );
        ParticleManager.SetParticleControl(effect_fx, 0, vParent);
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.sun_radius, 0, 0));
        ParticleManager.ReleaseParticleIndex(effect_fx);
        let enemies = FindUnitsInRadius(
            DotaTeam.BADGUYS,
            hParent.GetAbsOrigin(),
            null,
            this.sun_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            let damage = enemy.GetMaxHealth() * 0.4;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: null,
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            })
        }
        UTIL_Remove(hParent)
    }
}