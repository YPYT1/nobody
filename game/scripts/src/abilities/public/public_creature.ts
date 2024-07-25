import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// 属性
@registerAbility()
export class public_creature extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_creature"
    }
}

@registerModifier()
export class modifier_public_creature extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
        }
    }
}