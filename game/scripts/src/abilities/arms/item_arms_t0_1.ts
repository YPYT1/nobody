import { registerAbility, registerModifier } from "../../utils/dota_ts_adapter";
import { BaseArmsItem, BaseArmsModifier } from "./base_arms";

@registerAbility()
export class item_arms_t0_1 extends BaseArmsItem {

    mdf_name = "modifier_item_arms_t0_1";
    
}

@registerModifier()
export class modifier_item_arms_t0_1 extends BaseArmsModifier {

}