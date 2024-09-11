import { MissionModule } from "../_mission_module";

/**
 * 逮捕大鱼人	"【天辉的考验】：出现一只免疫减速的大鱼人，无法攻击且受伤害后会逃跑。

任务额外说明：大鱼人属性挂钩当前波数精英怪血量，移动速度450。
限制时间：60秒
失败条件：超时或所有玩家阵亡。"

 */
export class Mission_Radiant_8 extends MissionModule {

    fish: CDOTA_BaseNPC;

    ExecuteLogic(start: Vector): void {
        this.progress_max = 1;
        this.progress_value = 0;
        this.SendMissionProgress();
        this.limit_time = 25;

        // 创建鱼人
        let fish_hp = 500
        this.fish = GameRules.Spawn.CreepNormalCreate("npc_mission_big_fish", start + RandomVector(200) as Vector)
        this.fish.SetBaseMaxHealth(fish_hp);
        this.fish.SetMaxHealth(fish_hp);
        this.fish.SetHealth(fish_hp);
        this.fish.AddNewModifier(this.fish, null, "modifier_mission_radiant_8_ai", { duration: this.limit_time })
        this.fish.AddNewModifier(this.fish, null, "modifier_basic_countdown", { duration: this.limit_time })
        this.units.push(this.fish)
    }
}