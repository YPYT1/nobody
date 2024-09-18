import { MissionModule } from "../_mission_module";

/**
 * 接球赛	"【天辉的考验】：需要任意一名玩家，去接球。到达球落地的位置，站在光圈内球会飞起来，并在空中向周围随机方向移动距离最大不超过500码，任意玩家均可接球。球一共会落地5次。

目标区域范围：半径150码，下一个落点距离上一个落点距离不超过500码。
任务限时：45秒。
失败条件：超时或错过一次接球、所有玩家阵亡。"

 */
export class Mission_Radiant_3 extends MissionModule {

    BallUnit: CDOTA_BaseNPC;
    vNextVect: Vector;
    motion_time = 4;
    check_radius = 150;
    max_distance = 500;
    limit_time = 45;
    
    ExecuteLogic(start: Vector): void {
        this.progress_value = 0;
        this.progress_max = 5;
        this.SendMissionProgress();
        this.motion_time = 4;
        this.BallUnit = CreateUnitByName("npc_mission_ball", start, false, null, null, DotaTeam.NEUTRALS);
        this.BallUnit.AddNewModifier(this.BallUnit, null, "modifier_state_mission", {})
        // 发射,
        this.TossBall(start)

        this.units.push(this.BallUnit)
    }

    TossBall(vStart: Vector) {

        //
        let fDistance = RandomInt(300, 500);
        this.vNextVect = this.GetToNextPoints(vStart, fDistance)
        this.BallUnit.AddNewModifier(this.BallUnit, null, "modifier_generic_arc_lua", {
            target_x: this.vNextVect.x,
            target_y: this.vNextVect.y,
            distance: fDistance,
            height: 1000,
            duration: this.motion_time,
            fix_duration: 1,
        })

        let thinker = CreateModifierThinker(
            null,
            null,
            "modifier_mission_radiant_3_points",
            {
                duration: this.motion_time,
                radius: this.check_radius
            },
            this.vNextVect,
            DotaTeam.GOODGUYS,
            false
        )
        this.units.push(thinker)
    }

    AddProgressValue(value: number): void {
        this.progress_value += 1;
        this.SendMissionProgress();
        if (this.progress_value < this.progress_max) {
            // 下一个点
            this.TossBall(this.vNextVect)
        } else {
            // 完成任务
            GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(true)
        }
    }


}