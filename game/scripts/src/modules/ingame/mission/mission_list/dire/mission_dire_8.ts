import { MissionModule } from "../_mission_module";


/**
 * 匆匆忙忙	夜魇的试炼	"【夜魇的试炼】：限制时间内，所有敌军移动速度翻倍。

任务额外说明：玩家速度不变
任务时间：20秒
失败条件：所有玩家阵亡。"

 */
export class Mission_Dire_8 extends MissionModule {

    limit_time: number = 20;

    ExecuteLogic(start: Vector): void {
        this.progress_value = 0;
        this.progress_max = this.limit_time
        this.mdf_thinker = CreateModifierThinker(
            null,
            null,
            "modifier_mission_dire_8_thinker",
            {
                duration: this.limit_time
            },
            this.vMapCenter,
            DotaTeam.BADGUYS,
            false
        )
    }

    MissionOverTime(): void {
        this.EndOfMission(true)
    }
}