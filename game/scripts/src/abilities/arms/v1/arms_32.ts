import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 负重训练	移动速度降低50%，但替换技能之后，根据训练的时间每一秒获得5经验值2灵魂。（至多不超过200秒）
 */
@registerAbility()
export class arms_32 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_32 extends BaseArmsModifier {

    pre_exp: number;
    per_soul: number;
    timer: number;
    limit_timer: number;
    total_exp: number;
    total_soul: number;

    IsHidden(): boolean {
        return false
    }

    C_OnCreated(params: any): void {
        this.pre_exp = this.ability.GetSpecialValueFor("pre_exp");
        this.per_soul = this.ability.GetSpecialValueFor("per_soul");
        this.limit_timer = this.ability.GetSpecialValueFor("limit_timer")
        this.total_exp = 0;
        this.total_soul = 0
        this.timer = 0;
        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            MoveSpeed: {
                "TotalPercent": this.ability.GetSpecialValueFor("slowmove_pct")
            }
        })

        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        this.timer += 1;
        this.SetStackCount(this.timer)
        if (this.timer >= this.limit_timer) {
            this.StartIntervalThink(-1)
        }
    }

    C_OnRemoved(): void {
        GameRules.CustomAttribute.DelAttributeInKey(this.caster, this.buff_key);
        GameRules.ResourceSystem.ModifyResource(this.player_id, {
            "SingleExp": this.pre_exp * this.timer,
            "Soul": this.per_soul * this.timer,
        })
    }
}
