import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 灵魂交易	
 * 每%arms_cd%秒损失%losing_soul%灵魂，
 * 替换该技能时获取已损失灵魂的%income_mul%倍收益。
 */
@registerAbility()
export class arms_t1_3 extends BaseArmsAbility {

    mdf_name = "modifier_arms_t1_3";

    losing_soul: number;
    income_mul: number;
    lost_amount: number;

    stack_buff: CDOTA_Buff;

    _OnUpdateKeyValue(): void {
        this.losing_soul = this.GetSpecialValueFor("losing_soul")
        this.income_mul = this.GetSpecialValueFor("income_mul")
        if (this.lost_amount == null) { this.lost_amount = 0 }
        if (this.stack_buff == null) {
            this.stack_buff = this.caster.AddNewModifier(this.caster, this, "modifier_arms_t1_3_stack", {})
        }

    }

    ArmsEffectStart(): void {
        let res = GameRules.ResourceSystem.ModifyResource(this.player_id, {
            "Soul": -1 * this.losing_soul
        })
        if (res.status) {
            this.lost_amount += this.losing_soul
            this.stack_buff.SetStackCount(this.lost_amount)
        }

    }

    _RemoveSelf(): void {
        this.stack_buff.Destroy();
        GameRules.ResourceSystem.ModifyResource(this.player_id, {
            "Soul": this.lost_amount * 2
        })
    }
}

@registerModifier()
export class modifier_arms_t1_3 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_t1_3_stack extends BaseModifier {

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }
}