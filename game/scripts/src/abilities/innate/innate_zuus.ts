import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

@registerAbility()
export class innate_zuus extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_innate_zuus"
    }
}

@registerModifier()
export class modifier_innate_zuus extends BaseModifier {
    
}