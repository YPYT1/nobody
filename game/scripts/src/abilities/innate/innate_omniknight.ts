import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

@registerAbility()
export class innate_omniknight extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_innate_omniknight"
    }
}

@registerModifier()
export class modifier_innate_omniknight extends BaseModifier {
    
}