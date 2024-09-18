import { MissionModule } from "../_mission_module";

/**
 * 致命逃亡	夜魇的试炼	"【夜魇的试炼】：从地图四个角落中的随机一个角落开始蔓延剧毒，直到蔓延到整个地图的80%结束。

任务额外说明：玩家在剧毒内每秒受到最大生命值40%的伤害。
任务时间：30秒
失败条件：所有玩家阵亡。"

 */
export class Mission_Dire_4 extends MissionModule {

    limit_time: number = 30;
    angle_list = [45, 135, 225, 315];

    ExecuteLogic(start: Vector): void {
        this.progress_max = this.limit_time
        this.progress_value = 0;
        const vMapCenter = GameRules.MissionSystem.vMapCenter;
        const diag_distance = 6400;
        let place_point = start + (vMapCenter - start as Vector).Normalized() * -200 as Vector
        let dummy = CreateUnitByName("npc_mission_dummy", place_point, false, null, null, DotaTeam.BADGUYS);
        dummy.AddNewModifier(dummy, null, "modifier_mission_dire_4_thinker", {
            duration: this.limit_time,
            max_distance: diag_distance * 0.8
        })
        this.units.push(dummy)
    }

    CreateMission(vPos: Vector, vMapCenter: Vector, is_test: boolean) {
        let angle = this.angle_list[RandomInt(0, 3)]
        let line_pos = vMapCenter + Vector(3200, 0, 0) as Vector;
        vPos = RotatePosition(vMapCenter, QAngle(0, angle, 0), line_pos);
        this.is_test = is_test;
        this.is_stop = false;
        this.units = [];
        this.vMapCenter = vMapCenter;

        this.start_thinker = CreateModifierThinker(
            null,
            null,
            "modifier_mission_thinker",
            {
                mission_name: this.mission_name,
                mission_type: this.mission_type,
            },
            vPos,
            DotaTeam.GOODGUYS,
            false
        )
        if (this.mission_type == 1) {
            this.start_npc = CreateUnitByName("npc_mission_npc_radiant", vPos, false, null, null, DotaTeam.GOODGUYS)
        } else {
            this.start_npc = CreateUnitByName("npc_mission_npc_dire", vPos, false, null, null, DotaTeam.GOODGUYS)
        }
        this.start_npc.AddNewModifier(this.start_npc, null, "modifier_mission_npc", {})
        // const deadline = GameRules.GetDOTATime(false,false);
        GameRules.MissionSystem.SendMissionTips(this.mission_type,this.mission_name)

    }

    MissionOverTime(): void {
        this.EndOfMission(true)
    }

    AddProgressValue(value: number): void {
        this.progress_value += value;
    }
}