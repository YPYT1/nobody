import { MissionModule } from '../_mission_module';

/**
 * 接力赛	
 * 【天辉的考验】：需要任意一名玩家，接连跑到指定区域。到达一个区域进入光圈后，出现下一个目标点及光圈。一共会有5个光圈。
目标区域范围：半径250码，距离接取任务点最小距离1500码，最大距离2000码。两个光圈区域距离最小距离1500码，最大距离2000码。
任务限时：15秒，每到达一个光圈时间重置为15秒。
失败条件：超时、所有玩家阵亡。"
 */
export class Mission_Radiant_2 extends MissionModule {
    relay_radius = 250; // 接力点范围
    limit_time: number = 15;
    distance_range = [1500, 2000];

    last_relay_pos: Vector;

    ExecuteLogic(start: Vector): void {
        this.progress_max = 5;
        this.progress_value = 0;
        this.SendMissionProgress();
        this.last_relay_pos = this.GetToNextPoints(start, RandomInt(1500, 2000));
        this._CreateRelayPoint(this.last_relay_pos);
    }

    /**
     * 创建接力点
     * @param vOrign
     * @param iIndex
     */
    _CreateRelayPoint(vOrign: Vector) {
        this.AddMoveTips(vOrign, this.limit_time, this.mission_type);
        const unis = CreateModifierThinker(
            null,
            null,
            'modifier_mission_radiant_2_points',
            {
                relay_radius: this.relay_radius,
                duration: this.limit_time,
            },
            vOrign,
            DotaTeam.GOODGUYS,
            false
        );
        this.units.push(unis);
    }

    AddProgressValue(value: number): void {
        this.progress_value += 1;
        this.SendMissionProgress();

        if (this.progress_value < this.progress_max) {
            // 下一个点
            this.last_relay_pos = this.GetToNextPoints(this.last_relay_pos, RandomInt(1500, 2000));
            this._CreateRelayPoint(this.last_relay_pos);

            const end_time = GameRules.GetDOTATime(false, false) + this.limit_time;
            GameRules.MissionSystem.UpdateMissionEndTime(this.mission_type, this.mission_name, end_time, this.limit_time);
        } else {
            // 完成任务
            GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(true);
        }
    }
}
