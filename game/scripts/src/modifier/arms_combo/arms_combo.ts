import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";
import * as ArmsComboJson from "./../../json/config/game/arms_combo.json";

type ComboIdType = keyof typeof ArmsComboJson;

export class ArmsComboModifier extends BaseModifier {

    combo_id: number = 1;

    GetTexture(): string {
        return ArmsComboJson[`Combo_${this.combo_id}` as ComboIdType].AbilityTextureName;
    }

    RemoveOnDeath(): boolean {
        return false
    }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.PERMANENT
    }
}