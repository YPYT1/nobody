
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

/**
 * creature_elite_11	极速光环	
 * 提高周围500码内友军移动速度25%
*/
@registerAbility()
export class creature_elite_11 extends BaseCreatureAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_creature_elite_11"
    }

}

@registerModifier()
export class modifier_creature_elite_11 extends BaseModifier {

    aura_radius: number;
    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 500; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.FRIENDLY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_creature_elite_11_aura"; }

    OnCreated(params: object): void {
        this.aura_radius = 500
    }

}

@registerModifier()
export class modifier_creature_elite_11_aura extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return 25
    }
}