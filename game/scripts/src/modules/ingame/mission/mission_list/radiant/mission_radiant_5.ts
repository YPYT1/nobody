import { MissionModule } from "../_mission_module";

/**
 * 追逐小猪	"【天辉的考验】：需要任意一名玩家追逐小猪，触碰到小猪就算完成任务。

小猪移动逻辑：移动速度600，每次移动距离最大不超过500码，每移动一次会停留一秒钟。猪的生成范围：最小（任务点范围）最大(任务点范围+200)。
任务限时：45秒
失败条件：超时、所有玩家阵亡。"

 */
export class Mission_Radiant_5 extends MissionModule {

    limit_time = 45;

    ExecuteLogic(start: Vector): void {
        // 任务点创建小猪
        this.progress_max = 1;
        this.progress_value = 0;
        this.SendMissionProgress();
        this._CreatePig(start)
    }

    _CreatePig(vect: Vector) {
        let vOrigin = vect + RandomVector(RandomInt(0, 200));
        let pig = CreateUnitByName("npc_mission_pig", vect, false, null, null, DotaTeam.GOODGUYS);
        // print("this.the_npc",this.the_npc,this.limit_time)
        pig.AddNewModifier(pig, null, "modifier_mission_radiant_5_ai", {
            duration: this.limit_time
        })

        this.units.push(pig)
    }

    AddProgressValue(value: number): void {
        this.progress_value += 1;
        this.SendMissionProgress();
        GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(true)
    }
}