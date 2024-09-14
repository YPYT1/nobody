import { MissionModule } from "../_mission_module";

/**
 * 怒火野马	夜魇的试炼	"【梦魇的试炼】：生成一只巨大的人马，锁定一名玩家英雄进行追击。
任务额外说明：人马的属性挂钩当前波数boss血量，移动速度为450，靠近目标会使用一次冲撞，造成英雄最大生命值40%伤害并击飞500码。目标死亡切换目标。（距离自身最远的英雄单位作为目标）
任务时间：90秒
失败条件：超时或所有玩家阵亡。"
 */

export class Mission_Dire_2 extends MissionModule {

    limit_time = 90;

    ExecuteLogic(start: Vector): void {
        this.progress_value = 0;
        this.progress_max = this.limit_time
        let unit = GameRules.Spawn.CreepNormalCreate("npc_mission_centaur", start + RandomVector(300) as Vector);
        unit.AddNewModifier(unit, null, "modifier_mission_dire_2", { duration: this.limit_time })
        unit.AddNewModifier(unit, null, "modifier_basic_countdown", { duration: this.limit_time })
        this.CreateCountdownThinker(this.limit_time)
        this.units.push(unit)
    }

    MissionOverTime(): void {
        this.EndOfMission(false)
    }
}