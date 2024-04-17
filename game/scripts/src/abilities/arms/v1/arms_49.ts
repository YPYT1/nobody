import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 勇士	"根据自身护甲值提升所造成的伤害。
每10点护甲提高1%的伤害。"

 */
@registerAbility()
export class arms_49 extends BaseArmsAbility {

    
}

@registerModifier()
export class modifier_arms_49 extends BaseArmsModifier { }
