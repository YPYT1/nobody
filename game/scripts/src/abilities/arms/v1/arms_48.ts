import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 铠甲	"每受到伤害一次永久增加1点护甲。至多增加500点护甲。"

 */
@registerAbility()
export class arms_48 extends BaseArmsAbility {

    bonus_armor: number;
    limit_armor: number;

    _OnUpdateKeyValue(): void {
        this.bonus_armor = this.GetSpecialValueFor("bonus_armor")
        this.limit_armor = this.GetSpecialValueFor("limit_armor")
        this.AffectedAdd()
    }

    ArmsEffectStart(): void {
        
    }
}

@registerModifier()
export class modifier_arms_48 extends BaseArmsModifier { }
