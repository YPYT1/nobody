import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

@registerAbility()
export class arms_t1_18 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t1_18"
    }
}

@registerModifier()
export class modifier_arms_t1_18 extends BaseModifier {

}