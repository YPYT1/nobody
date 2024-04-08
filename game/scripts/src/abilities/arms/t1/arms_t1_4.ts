import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsModifier } from "../base_arms_ability";

/**
 * 引燃	对500码内的x个敌人投射燃烧弹，导致其被火焰吞噬。

 */
@registerAbility()
export class arms_t1_4 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t1_4"
    }
}

@registerModifier()
export class modifier_arms_t1_4 extends BaseArmsModifier {

}