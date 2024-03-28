import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";

@registerAbility()
export class arms_t1_6 extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_arms_t1_6"
    }
}

@registerModifier()
export class modifier_arms_t1_6 extends BaseModifier {

}