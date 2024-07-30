import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// 相位移动
@registerAbility()
export class public_npc_interact extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_npc_interact";
    }

}

@registerModifier()
export class modifier_public_npc_interact extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }
}