import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

@registerAbility()
export class arms_t1_11 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t1_11"
    }
}

@registerModifier()
export class modifier_arms_t1_11 extends BaseModifier {

}