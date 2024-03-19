import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

@registerModifier()
export class modifier_pickitem_exp extends BaseModifier {

    ScaleModel: boolean;

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

    // DeclareFunctions(): ModifierFunction[] {
    //     return [
    //         ModifierFunction.INVISIBILITY_LEVEL
    //     ]
    // }

    // GetModifierInvisibilityLevel(): number {
    //     return 90
    // }

}