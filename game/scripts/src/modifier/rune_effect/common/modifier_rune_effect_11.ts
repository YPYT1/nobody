import { registerModifier } from "../../../utils/dota_ts_adapter";
import { StackModifier } from "../../extends/modifier_stack";

@registerModifier()
export class modifier_rune_effect_11 extends StackModifier {

    buff_key = "rune_effect_11";

    OnStackCountChanged(stackCount: number): void {
        if (!IsServer()) { return }
        let stack = this.GetStackCount();
        GameRules.CustomAttribute.SetAttributeInKey(this.parent, this.buff_key, {
            'DamageBonusMul': {
                "Base": stack * this.value
            }
        })
    }

    UpdateValue(params: any): void {
        this.value = params.value;
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.parent, this.buff_key)
    }
}