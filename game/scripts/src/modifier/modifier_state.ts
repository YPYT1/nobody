import { BaseAbility, registerAbility, BaseModifier, registerModifier } from "../utils/dota_ts_adapter";


@registerModifier()
export class modifier_state_invincible extends BaseModifier {

    IsHidden(): boolean { return false; }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }

}

@registerModifier()
export class modifier_state_bloodmage extends BaseModifier {

    RemoveOnDeath(): boolean { return false }
    IsHidden(): boolean { return true; }
    IsPermanent(): boolean { return true }
}
