import { MissionModule } from "../_mission_module";

/**
 * 破坏箱子	"【天辉的考验】：需要任意玩家去地图内寻找并破坏箱子。

任务额外说明：一共生成10个箱子，遍布周围。箱子距离接取目标点最大不超过3000码。一共生成15个箱子，对箱子造成任意伤害均可破坏箱子。
任务限时：45秒。
失败条件：超时、所有玩家阵亡。"

 */
export class Mission_Radiant_6 extends MissionModule {

    box_list: CDOTA_BaseNPC[] = [];
    limit_time: number = 15;

    ExecuteLogic(start: Vector): void {
        this.progress_max = 10;
        this.progress_value = 0;
        this.mission_state = -1;
        this.SendMissionProgress();
        this.CreateBox(start, 15);

        // 创建定时器
        this.CreateCountdownThinker(this.limit_time)
    }



    CreateBox(vect: Vector, amount: number) {
        for (let i = 0; i < amount; i++) {
            let box_pos = this.GetToNextPoints(vect, RandomInt(300, 3000))
            let box = CreateUnitByName("npc_mission_box", box_pos, false, null, null, DotaTeam.BADGUYS);
            box.AddNewModifier(box, null, "modifier_mission_radiant_6_box", { duration: this.limit_time })
            box.AddNewModifier(box, null, "modifier_basic_countdown", { duration: this.limit_time })
            box.AddNewModifier(box, null, "modifier_basic_hits", {})
            this.units.push(box)
        }
    }

    AddProgressValue(value: number): void {
        this.progress_value += 1;
        this.SendMissionProgress();
        if (this.progress_value >= this.progress_max) {
            // 完成任务
            this.mission_state = 1
            GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(true);
            // 移除定时器
            UTIL_Remove(this.countdown_thinker)
        }
    }

    MissionOverTime(): void {
        if (this.mission_state != 1) {
            GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(false);
        }
    }

}