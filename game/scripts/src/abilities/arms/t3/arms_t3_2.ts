import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 击杀敌人不再获得灵魂，但每秒获得5点灵魂。
300秒后技能自动升级，不可替换/升级该技能。
 */
@registerAbility()
export class arms_t3_2 extends BaseArmsAbility {

}

@registerModifier()
export class modifier_arms_t3_2 extends BaseArmsModifier {

    timer: number;
    per_soul: number;
    total_sec: number;

    C_OnCreated(params: any): void {
        this.timer = 0;
        this.per_soul = this.ability.GetSpecialValueFor("per_soul");
        this.total_sec = this.ability.GetSpecialValueFor("total_sec");
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        if (this.timer < this.total_sec) {
            this.timer += 1;
            GameRules.ResourceSystem.ModifyResource(this.player_id, {
                "Soul": this.per_soul
            })
        } else {
            this.StartIntervalThink(-1)
        }
    }
}




