import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 毒瘤	每秒获得当前(英雄等级*%hero_level%)的经验值。%total_sec%秒后自动升级该技能。无法更换、无法升级。
 */
@registerAbility()
export class arms_t1_7 extends BaseArmsAbility {

    mdf_name = "modifier_arms_t1_7";

    hero_level: number;
    total_sec: number;
    count: number;
    // lost_amount: number;

    stack_buff: CDOTA_Buff;

    _OnUpdateKeyValue(): void {
        this.hero_level = this.GetSpecialValueFor("hero_level")
        this.total_sec = this.GetSpecialValueFor("total_sec")
        if (this.stack_buff == null) {
            this.count = 0;
            this.stack_buff = this.caster.AddNewModifier(this.caster, this, "modifier_arms_t1_7_stack", {})
        }
        this.ArmsAdd();
    }

    ArmsEffectStart(): void {
        if (this.count < this.total_sec) {
            this.count += 1;
            let bonus_exp = this.caster.GetLevel() * this.hero_level;
            GameRules.ResourceSystem.ModifyResource(this.player_id, {
                "SingleExp": bonus_exp
            })
            this.stack_buff.SetStackCount(this.count)
        }
    }


}

@registerModifier()
export class modifier_arms_t1_7 extends BaseArmsModifier {

}

@registerModifier()
export class modifier_arms_t1_7_stack extends BaseModifier {

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }
}