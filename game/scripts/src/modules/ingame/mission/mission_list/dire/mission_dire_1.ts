import { MissionModule } from "../_mission_module";

/**
 * 重炮蜘蛛	"【夜魇的试炼】：生成一只巨大蜘蛛女王，每过3秒会向周围6个方向发射暗影球造成伤害。
任务额外说明：蜘蛛女王属性挂钩当前波数boss血量。移动速度为350。暗影球伤害为英雄最大生命值40%。
任务时间：90秒
失败条件：超时或所有玩家阵亡。
"

 */
export class Mission_Dire_1 extends MissionModule {

    mission_name: string = "dire_1"


    ExecuteLogic(vect: Vector): void {
        
    }
}