import { MissionModule } from "../_mission_module";

/**
 * 重炮蜘蛛	"【夜魇的试炼】：生成一只巨大蜘蛛女王，每过3秒会向周围6个方向发射暗影球造成伤害。
任务额外说明：蜘蛛女王属性挂钩当前波数boss血量。移动速度为350。暗影球伤害为英雄最大生命值40%。
任务时间：90秒
失败条件：超时或所有玩家阵亡。
"

 */
export class Mission_Dire_1 extends MissionModule {

    limit_time = 90;

    ExecuteLogic(start: Vector): void {
        this.progress_value = 0;
        this.progress_max = this.limit_time
        let spider = GameRules.Spawn.CreepNormalCreate("npc_mission_spider", start + RandomVector(300) as Vector);
        spider.AddNewModifier(spider, null, "modifier_mission_dire_1", { duration: this.limit_time })
        spider.AddNewModifier(spider, null, "modifier_basic_countdown", { duration: this.limit_time })
        this.CreateCountdownThinker(this.limit_time)

        this.units.push(spider)
    }

}