import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

@registerModifier()
export class modifier_pickitem_exp extends BaseModifier {

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.UNSELECTABLE]: true,
            // [ModifierState.INVISIBLE]: true,
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent();
        if (hParent && hParent.is_picking == false) {
            UTIL_Remove(this.GetParent())
        }

    }
}