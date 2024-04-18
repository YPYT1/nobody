import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 灵魂交易	
 * 每%arms_cd%秒损失%losing_soul%灵魂，
 * 替换该技能时获取已损失灵魂的%income_mul%倍收益。
 */
@registerAbility()
export class arms_3 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_3 extends BaseArmsModifier {

    losing_soul: number;
    lost_amount: number;
    income_mul: number;

    IsHidden(): boolean { return false }

    C_OnCreated(params: any): void {
        this.lost_amount = 0;
        this.losing_soul = this.ability.GetSpecialValueFor("losing_soul")
        this.income_mul = this.ability.GetSpecialValueFor("income_mul")
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let res = GameRules.ResourceSystem.ModifyResource(this.player_id, {
            "Soul": -1 * this.losing_soul
        })
        if (res.status) {
            this.lost_amount += this.losing_soul
            this.SetStackCount(this.lost_amount)
        }
    }

    _OnRemovedAfter(): void {
        GameRules.ResourceSystem.ModifyResource(this.player_id, {
            "Soul": this.lost_amount * this.income_mul
        })
    }
}
