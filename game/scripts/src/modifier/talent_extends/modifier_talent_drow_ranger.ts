import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_talent_drow_ranger extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.IGNORE_INVULNERABLE + ModifierAttribute.PERMANENT
    }

    RemoveOnDeath(): boolean {
        return false
    }


    OnCreated(params: object): void {

    }

    OnRefresh(params: object): void {

    }
}