import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 收割死灵	"每击杀一个敌人，有30%概率收割其灵魂。每一个收割的灵魂增加自身1%攻击力。
上限15个死灵。"

 */
@registerAbility()
export class arms_57 extends BaseArmsAbility {

    base_chance: number;

    limit_stack: number;

    _OnUpdateKeyValue(): void {
        this.base_chance = this.GetSpecialValueFor("base_chance");

        this.limit_stack = this.GetSpecialValueFor("limit_stack");
        this.RegisterEvent(["OnKill"])
    }

    OnKill(hTarget: CDOTA_BaseNPC): void {
        if (RollPercentage(this.base_chance)) {
            let stack = this.buff.GetStackCount();
            if (stack < this.limit_stack) {
                this.buff.IncrementStackCount()
            }
        }
    }
}

@registerModifier()
export class modifier_arms_57 extends BaseArmsModifier {

    stack_bonus: number;

    IsHidden(): boolean {
        return false
    }

    C_OnCreatedBefore(params: any): void {
        this.stack_bonus = this.GetAbility().GetSpecialValueFor("stack_bonus");
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE
        ]
    }

    GetModifierBaseDamageOutgoing_Percentage(event: ModifierAttackEvent): number {
        return this.stack_bonus * this.GetStackCount()
    }
}
