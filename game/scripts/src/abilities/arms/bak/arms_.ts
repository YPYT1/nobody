import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

@registerAbility()
export class arms_ extends BaseArmsAbility {}

@registerModifier()
export class modifier_arms_ extends BaseArmsModifier { }
