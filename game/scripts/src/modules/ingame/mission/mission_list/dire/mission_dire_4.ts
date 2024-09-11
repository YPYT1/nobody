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
        // let diagonal = start + (start - this.vMapCenter as Vector).Normalized() * 3500 as Vector;
        // let diag_distance = (diagonal - start as Vector).Length2D();
        const diag_distance = 6400;
        // print("dia_distance", diag_distance, diag_distance * 0.8);
        let place_point = start + (this.vMapCenter - start as Vector).Normalized() * -200 as Vector
        let dummy = CreateUnitByName("npc_mission_dummy", place_point, false, null, null, DotaTeam.BADGUYS);
        dummy.AddNewModifier(dummy, null, "modifier_mission_dire_4_thinker", {
            duration: this.limit_time,
            max_distance: diag_distance * 0.8
        })
        this.units.push(dummy)
    }

    CreateMission(vPos: Vector) {
        let angle = this.angle_list[RandomInt(0, 3)]
        let line_pos = this.vMapCenter + Vector(3200, 0, 0) as Vector;
        let target_vect = RotatePosition(this.vMapCenter, QAngle(0, angle, 0), line_pos);

        let hHero = PlayerResource.GetSelectedHeroEntity(0);
        hHero.RemoveModifierByName("modifier_state_movetips")

        // this.pick_points = target_vect;
        hHero.AddNewModifier(hHero, null, "modifier_state_movetips", {
            duration: 15,
            x: target_vect.x,
            y: target_vect.y,
            z: target_vect.z,
        })

        CreateModifierThinker(
            null,
            null,
            "modifier_mission_thinker",
            {
                mission_name: this.mission_name,
            },
            target_vect,
            DotaTeam.GOODGUYS,
            false
        )
    }

    MissionOverTime(): void {
        this.EndOfMission(true)
    }

    AddProgressValue(value: number): void {
        this.progress_value += value;
    }
}