import { MissionModule } from "../_mission_module";

/**
 * 接球赛	"【天辉的考验】：需要任意一名玩家，去接球。到达球落地的位置，站在光圈内球会飞起来，并在空中向周围随机方向移动距离最大不超过500码，任意玩家均可接球。球一共会落地5次。

目标区域范围：半径150码，下一个落点距离上一个落点距离不超过500码。
任务限时：45秒。
失败条件：超时或错过一次接球、所有玩家阵亡。"

 */
export class Mission_Radiant_3 extends MissionModule {

    ExecuteLogic(start: Vector): void {
        
        // 发射,创建
        this.TossBall(start)

    }

    TossBall(vStart:Vector){

    }
}