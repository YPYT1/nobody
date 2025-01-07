import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

/**
 * 怪物整体加速光环
 */
@registerModifier()
export class modifier_creature_acceleration_thinker extends BaseModifier {

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 9999; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.FRIENDLY; }
    GetAuraSearchType() { return UnitTargetType.HEROES_AND_CREEPS; }
    GetModifierAura() { return "modifier_creature_acceleration_aura"; }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.parent.CustomVariables = { ["stack"]: 1 }
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        this.parent.CustomVariables["stack"] += 1;
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_creature_acceleration_aura extends BaseModifier {

    bonus_move_pct: number;
    AuraOwner: CDOTA_BaseNPC;

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.bonus_move_pct = 1;
        this.AuraOwner = this.GetAuraOwner()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        this.bonus_move_pct = this.AuraOwner.CustomVariables["stack"] * 2.5;
        // print("bonus_move_pct", this.bonus_move_pct)
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.bonus_move_pct
    }
}