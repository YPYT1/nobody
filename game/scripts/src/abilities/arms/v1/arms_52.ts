import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 圣盾护体	"周期性提高自身护甲。持续10秒。
cd：5秒
护甲提升系数：50%"

 */
@registerAbility()
export class arms_ extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {

    }
    
}

@registerModifier()
export class modifier_arms_ extends BaseArmsModifier { }
