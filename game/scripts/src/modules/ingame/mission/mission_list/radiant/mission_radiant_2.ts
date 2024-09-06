import { MissionModule } from "../_mission_module";

/**
 * 接力赛	
 * 【天辉的考验】：需要任意一名玩家，接连跑到指定区域。到达一个区域进入光圈后，出现下一个目标点及光圈。一共会有5个光圈。
目标区域范围：半径250码，距离接取任务点最小距离1500码，最大距离2000码。两个光圈区域距离最小距离1500码，最大距离2000码。
任务限时：15秒，每到达一个光圈时间重置为15秒。
失败条件：超时、所有玩家阵亡。"
 */
export class Mission_Radiant_2 extends MissionModule {

    count: number;
    relay_count = 5; // 接力次数
    relay_radius = 250; // 接力点范围
    relay_time = 15; // 接力时间
    distance_range = [1500, 2000];

    last_relay_pos: Vector;

    ExecuteLogic(start: Vector): void {
        this.count = 0
        this.last_relay_pos = this.GetToNextPoints(start, RandomInt(1500, 2000))
        this._CreateRelayPoint(this.last_relay_pos)
    }

    /**
     * 创建接力点
     * @param vOrign 
     * @param iIndex 
     */
    _CreateRelayPoint(vOrign: Vector) {
        let mission_point = CreateUnitByName("npc_mission_point", vOrign, false, null, null, DotaTeam.NEUTRALS);
        mission_point.AddNewModifier(mission_point, null, "modifier_mission_mdf_2_points", {
            relay_radius: this.relay_radius,
        })
    }

    AddProgressValue(value: number): void {
        this.count += 1;
        GameRules.CMsg.SendCommonMsgToPlayer(
            -1,
            "{s:mission_name} 任务进度{d:count} / {d:relay_count}",
            {
                mission_name: this.mission_name,
                count: this.count,
                relay_count: this.relay_count,
            }
        )

        if (this.count < this.relay_count) {
            // 下一个点
            this.last_relay_pos = this.GetToNextPoints(this.last_relay_pos, RandomInt(1500, 2000))
            this._CreateRelayPoint(this.last_relay_pos)
        } else {
            // 完成任务
            GameRules.MissionSystem.EndMission(true)
        }
    }
}