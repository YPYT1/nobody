import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 龙蛋	什么哔作用都没有。但是孵化300秒之后会随机变为一条龙

 */
@registerAbility()
export class arms_27 extends BaseArmsAbility {


}

@registerModifier()
export class modifier_arms_27 extends BaseArmsModifier {

    timer: number;
    timer_total: number;

    IsHidden(): boolean {
        return false
    }

    C_OnCreated(params: any): void {
        this.timer = 0;
        this.timer_total = this.GetAbility().GetSpecialValueFor("timer_total");
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        this.timer += 1;
        this.SetStackCount(this.timer)
        if (this.timer >= this.timer_total) {

            this.StartIntervalThink(-1)
        }
    }
}