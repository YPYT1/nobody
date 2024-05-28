import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

@registerAbility()
export class innate_abaddon extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_innate_abaddon"
    }
}

@registerModifier()
export class modifier_innate_abaddon extends BaseModifier {

}