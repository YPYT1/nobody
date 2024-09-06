import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_thinker extends BaseModifier {

    mission_name: string;
    is_timeout: boolean;
    origin: Vector;
    residence_time: number;

    radius: number;
    cast_fx: ParticleID;
    origin_fx: ParticleID;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.radius = 400;
        this.residence_time = 0;
        this.origin = this.GetParent().GetAbsOrigin()
        this.is_timeout = true;
        this.mission_name = params.mission_name;

        this.origin_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/event_ring_anim/event_ring_anim_origin.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(this.origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        // ParticleManager.SetParticleControl(this.origin_fx, 1, Vector(-1, 0, 0))
        ParticleManager.SetParticleControl(this.origin_fx, 2, Vector(this.radius - 32, 0, 0))
        ParticleManager.SetParticleControl(this.origin_fx, 3, Vector(0, 255, 255))
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
        if (players.length > 0) {
            this.residence_time += 0.1
            if (this.residence_time == 0.1) {
                this.cast_fx = ParticleManager.CreateParticle(
                    "particles/diy_particles/event_ring_anim/event_ring_anim.vpcf",
                    ParticleAttachment.POINT,
                    this.GetParent()
                )
                ParticleManager.SetParticleControl(this.cast_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
                ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(5, 0, 0))
                ParticleManager.SetParticleControl(this.cast_fx, 2, Vector(this.radius - 32, 0, 0))
                ParticleManager.SetParticleControl(this.cast_fx, 3, Vector(122, 255, 0))
                // ParticleManager.ReleaseParticleIndex
                // ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(5, 0, 0))
            }
            if (this.residence_time >= 5) {
                this.residence_time = 0;
                // 执行任务
                GameRules.MissionSystem.StartMission(this.origin);
                if (this.cast_fx) {
                    ParticleManager.DestroyParticle(this.cast_fx, true)
                }
                this.is_timeout = false
                this.StartIntervalThink(-1);
                this.Destroy()
            }
        } else {
            this.residence_time = 0;
            if (this.cast_fx) {
                ParticleManager.DestroyParticle(this.cast_fx, true)
            }
            // ParticleManager.SetParticleControl(this.cast_fx, 1, Vector(999, 0, 0))
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        ParticleManager.DestroyParticle(this.origin_fx, true);

        if (this.is_timeout) {
            // 任务失败
            GameRules.MissionSystem.EndMission(false)
        }
        UTIL_Remove(this.GetParent())
    }
}