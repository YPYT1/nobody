import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_radiant_7_zone extends BaseModifier {

    radius: number;
    cast_fx: ParticleID;
    success: boolean;
    origin: Vector;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.success = true;
        this.origin = this.GetParent().GetAbsOrigin()
        this.radius = params.radius as number;

        this.cast_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/event_ring_anim/event_ring_anim.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(this.cast_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(this.GetDuration(), 0, 0))
        ParticleManager.SetParticleControl(this.cast_fx, 2, Vector(this.radius - 32, 0, 0))
        ParticleManager.SetParticleControl(this.cast_fx, 3, Vector(122, 255, 0))
        ParticleManager.SetParticleControl(this.cast_fx, 3, Vector(0, 255, 255))
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let players = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        // print("players.length", players.length)
        if (players.length <= 0) {
            this.success = false;
            this.StartIntervalThink(-1)
            this.Destroy()
        }

    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(this.success)
        ParticleManager.DestroyParticle(this.cast_fx, true)
        UTIL_Remove(this.GetParent())
    }
}