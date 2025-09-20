import { BaseModifier, registerModifier } from '../utils/dota_ts_adapter';

@registerModifier()
export class modifier_summoned_lifetime extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        UTIL_RemoveImmediate(this.GetParent());
    }
}
