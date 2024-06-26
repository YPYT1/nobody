import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 毒瘤	"每1秒获得当前英雄等级的经验值。
300秒后自动升级该技能。无法更换、无法升级。"

 */
@registerAbility()
export class arms_9 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_9 extends BaseArmsModifier {

    timer: number;
    limit_timer: number;

    C_OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.timer = 0;
        this.limit_timer = this.GetAbility().GetSpecialValueFor("limit_timer");
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let level = this.caster.GetLevel();
        let skv_resource_income = this.GetAbility().GetSpecialValueFor("skv_resource_income");
        let add_exp = math.floor(level * skv_resource_income * 0.01);

        GameRules.ResourceSystem.ModifyResource(this.player_id, {
            "SingleExp": add_exp
        })

        this.timer += 1;
        if (this.timer >= this.limit_timer) {
            this.StartIntervalThink(-1);
            // 升级该技能
        }
    }
}




