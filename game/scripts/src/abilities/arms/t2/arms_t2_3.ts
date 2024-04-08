import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

@registerAbility()
export class arms_t2_3 extends BaseArmsAbility {

    mdf_name = "modifier_arms_t2_3";

}

@registerModifier()
export class modifier_arms_t2_3 extends BaseArmsModifier {


}