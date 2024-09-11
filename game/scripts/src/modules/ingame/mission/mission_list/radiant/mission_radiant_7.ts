import { MissionModule } from "../_mission_module";

/**
 * 求生	"【天辉的考验】：强制将所有玩家牵引到一个半径1000码范围内，玩家需要生存相应时间。

任务额外说明：不可出圈
限制区域：以接取任务点为中心半径1000码
任务限时：20秒
失败条件：所有玩家阵亡。"

 */
export class Mission_Radiant_7 extends MissionModule {

    check_radius: number;


    ExecuteLogic(start: Vector): void {
        this.progress_max = 20;
        this.progress_value = 0;
        this.SendMissionProgress();
        this.limit_time = 20;
        this.check_radius = 1000;
        this.mission_state = -1;

        // 所有英雄强制移动
        for (let hHero of HeroList.GetAllHeroes()) {
            // let distance = (hHero.GetAbsOrigin() - start as Vector).Length2D();
            hHero.AddNewModifier(hHero, null, "modifier_generic_arc_lua", {
                target_x: start.x,
                target_y: start.y,
                height: 100,
                speed: 600,
                // duration: this.motion_time,
                // fix_duration: 1,
            })
        }

        // 创建限制范围
        let thinker = CreateModifierThinker(
            null,
            null,
            "modifier_mission_radiant_7_zone",
            {
                duration: this.limit_time,
                radius: this.check_radius,
            },
            start,
            DotaTeam.GOODGUYS,
            false
        )
        this.units.push(thinker)
    }
}