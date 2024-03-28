import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

@registerAbility()
export class arms_t2_17 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t2_17"
    }
}

@registerModifier()
export class modifier_arms_t2_17 extends BaseModifier {

}