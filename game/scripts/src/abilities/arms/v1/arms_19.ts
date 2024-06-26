import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 加农炮
 */
@registerAbility()
export class arms_19 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_19 extends BaseArmsModifier {}