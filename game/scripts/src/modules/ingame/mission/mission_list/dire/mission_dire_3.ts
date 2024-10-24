import { MissionModule } from "../_mission_module";


/**
 * 躲避流星	夜魇的试炼	"【夜魇的试炼】：短暂延迟5秒之后，开始从天降流星轰击每一名玩家。

任务额外说明：流星轰击范围半径200码，反应速度2秒（出现提示光圈到流星落地时间），流星间隔1秒。流星伤害为英雄最大生命值的40%。
任务时间：30秒
失败条件：所有玩家阵亡。"

 */
export class Mission_Dire_3 extends MissionModule {

    limit_time: number = 30;

    sun_radius = 200;
    sun_delay = 2;
    sun_interval = 1;

    ExecuteLogic(start: Vector): void {
        this.mission_state = -1;
        this.progress_value = 0;
        this.progress_max = this.limit_time
        
        const the_npc = CreateModifierThinker(
            null,
            null,
            "modifier_mission_dire_3_thinker",
            {
                duration: this.limit_time,
                sun_radius: this.sun_radius,
                sun_delay: this.sun_delay,
                sun_interval: this.sun_interval,
            },
            start,
            DotaTeam.BADGUYS,
            false
        )
        this.units.push(the_npc)
    }


    MissionOverTime(): void {
        this.EndOfMission(true)
    }

    
}