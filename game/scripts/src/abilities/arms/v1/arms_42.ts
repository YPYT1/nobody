import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 献祭 日炎效果
 */
@registerAbility()
export class arms_42 extends BaseArmsAbility {}

@registerModifier()
export class modifier_arms_42 extends BaseArmsModifier { }
