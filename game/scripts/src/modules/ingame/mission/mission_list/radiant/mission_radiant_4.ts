import { MissionModule } from "../_mission_module";

/**
 * 集结	"【天辉的考验】：需要所有玩家在限定时间内到达指定目标地点的光圈内。

目标区域范围：半径350码，距离接取目标点最小距离3500码，最大距离4000码。
任务限时：60秒
失败条件：任意玩家死亡或者超时、所有玩家阵亡。"

 */
export class Mission_Radiant_4 extends MissionModule {

    check_radius = 350;
    check_time = 60;
    final_vect: Vector;

    ExecuteLogic(start: Vector): void {
        // 该任务的初始点必然在地图中心的四个角落
        let angle_list = [0, 45, 135, 225, 315];
        let angle_value = angle_list[0]
        let aux_points = this.vMapCenter + Vector(2000, 0, 0) as Vector;
        let vStart = RotatePosition(this.vMapCenter, QAngle(0, angle_value, 0), aux_points)
        this.progress_max = 1;
        this.progress_value = 0;
        this.SendMissionProgress();
        this.final_vect = this.GetToNextPoints(vStart, RandomInt(3000, 4000))
        this._CreateRelayPoint(this.final_vect)
    }

    _CreateRelayPoint(vOrign: Vector) {
        let unit = CreateModifierThinker(
            null,
            null,
            "modifier_mission_radiant_4_points",
            {
                relay_radius: this.check_radius,
                duration: this.check_time,
            },
            vOrign,
            DotaTeam.GOODGUYS,
            false
        )
        this.units.push(unit)
    }

    AddProgressValue(value: number): void {
        this.progress_value += 1;
        this.SendMissionProgress();
        GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(true)
    }
}