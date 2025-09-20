import { MissionModule } from '../_mission_module';

/**
 * 慌慌张张	夜魇的试炼	"【夜魇的试炼】：全体玩家移动方向强制相反。

任务额外说明：玩家反方向移动
任务时间：30秒
失败条件：所有玩家阵亡。"

 */
export class Mission_Dire_7 extends MissionModule {
    limit_time: number = 10;

    ExecuteLogic(start: Vector): void {
        this.progress_value = 0;
        this.progress_max = this.limit_time;
        for (const hHero of HeroList.GetAllHeroes()) {
            GameRules.BuffManager.AddGeneralDebuff(hHero, hHero, DebuffTypes.chaos, this.limit_time);
        }
        this.CreateCountdownThinker(this.limit_time);
    }

    MissionOverTime(): void {
        this.EndOfMission(true);
    }
}
