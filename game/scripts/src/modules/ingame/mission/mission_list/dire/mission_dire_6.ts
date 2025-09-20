import { MissionModule } from '../_mission_module';

/**
 * 黑暗降临	夜魇的试炼	"【夜魇的试炼】：全体玩家视野变为极小。

任务额外说明：全体玩家视野变为半径200码。
任务时间：30秒
失败条件：所有玩家阵亡。"

 */
export class Mission_Dire_6 extends MissionModule {
    limit_time: number = 30;

    ExecuteLogic(start: Vector): void {
        this.progress_value = 0;
        this.progress_max = this.limit_time;
        for (const hHero of HeroList.GetAllHeroes()) {
            hHero.AddNewModifier(hHero, null, 'modifier_mission_dire_6_vision', { duration: this.limit_time });
        }
        this.CreateCountdownThinker(this.limit_time);
    }

    MissionOverTime(): void {
        this.EndOfMission(true);
    }
}
