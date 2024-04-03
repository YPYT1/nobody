import { registerAbility, registerModifier } from "../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "./base_arms_ability";

@registerAbility()
export class item_arms_t0_1 extends BaseArmsAbility {

    mdf_name = "modifier_item_arms_t0_1";
    
}

@registerModifier()
export class modifier_item_arms_t0_1 extends BaseArmsModifier {

}