import { MissionModule } from '../_mission_module';

/**
 * 你被包围了	夜魇的试炼	"【夜魇的试炼】：在接取任务的地点（此时判定圈内玩家），
 * 生成一个巨大的光圈（暗红色），会不停的刷新特定怪物进攻玩家。怪物和普通小怪一样的掉落和击杀计数。

任务额外说明：特定怪物血量是当前波数小怪的200%，每次触碰英雄造成英雄最大生命值10%的伤害。
任务时间：30秒
失败条件：接取任务的玩家跑出光圈范围或所有玩家阵亡。"

 */
export class Mission_Dire_5 extends MissionModule {
    limit_time = 30;
    check_radius = 1000;

    ExecuteLogic(start: Vector): void {
        this.progress_value = 0;
        this.progress_max = this.limit_time;
        this.mdf_thinker = CreateModifierThinker(
            null,
            null,
            'modifier_mission_dire_5_thinker',
            {
                duration: this.limit_time,
                radius: this.check_radius,
            },
            start,
            DotaTeam.BADGUYS,
            false
        );
    }

    MissionOverTime(): void {
        this.EndOfMission(true);
    }
}
