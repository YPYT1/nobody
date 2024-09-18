import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_radiant_2_points extends BaseModifier {

    is_timeout: boolean;
    // relay_index: number;
    relay_radius: number;
    origin: Vector;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.origin = this.GetParent().GetAbsOrigin();
        // this.relay_index = params.relay_index;
        this.relay_radius = params.relay_radius;
        this.is_timeout = true;

        let origin_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        ParticleManager.SetParticleControl(origin_fx, 1, Vector(15, 0, 0))
        ParticleManager.SetParticleControl(origin_fx, 2, Vector(this.relay_radius - 16, 0, 0))
        ParticleManager.SetParticleControl(origin_fx, 3, Vector(0, 255, 0))
        this.AddParticle(origin_fx, false, false, -1, false, false)

        let glow_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/move_glow.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(glow_fx, 6, Vector(0, 255, 0))
        this.AddParticle(glow_fx, false, false, -1, false, false)
        this.StartIntervalThink(0.1)
    }


    OnIntervalThink(): void {
        let players = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.origin,
            null,
            this.relay_radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        // print("players.length", players.length)
        if (players.length > 0) {
            this.is_timeout = false;
            GameRules.MissionSystem.RadiantMissionHandle.AddProgressValue(1);
            this.Destroy();
        }
    }
    
    OnDestroy(): void {
        if (!IsServer()) { return }
        if (this.is_timeout) {
            // 任务失败
            GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(false);
        }
        UTIL_Remove(this.GetParent())
    }

    // CheckState(): Partial<Record<modifierstate, boolean>> {
    //     return {
    //         [ModifierState.NO_HEALTH_BAR]: true,
    //         [ModifierState.NO_UNIT_COLLISION]: true,
    //         [ModifierState.UNSLOWABLE]: true,
    //         [ModifierState.INVULNERABLE]: true,
    //     }
    // }
}