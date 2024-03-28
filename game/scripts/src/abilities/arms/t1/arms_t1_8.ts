import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

@registerAbility()
export class arms_t1_8 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t1_8"
    }
}

@registerModifier()
export class modifier_arms_t1_8 extends BaseModifier {

}