import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_radiant_3_points extends BaseModifier {

    state: boolean;
    origin: Vector;
    radius: number;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.radius = params.radius;
        this.origin = this.GetParent().GetAbsOrigin();
        this.state = true;

        let origin_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/warning_aoe/ui_sphere_reverse.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        // ParticleManager.SetParticleControl(origin_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        ParticleManager.SetParticleControl(origin_fx, 1, Vector(this.GetDuration() + 0.1, 250, 0))
        ParticleManager.SetParticleControl(origin_fx, 2, Vector(0, 255, 175))
        this.AddParticle(origin_fx, false, false, -1, false, false)

        this.StartIntervalThink(0.1)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
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
        if (players.length > 0) {
            // 成功 进度+1
            GameRules.MissionSystem.RadiantMissionHandle.AddProgressValue(1);
        } else {
            // 失败
            print("任务失败")
            GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(false)
        }

        UTIL_Remove(this.GetParent());
    }
}