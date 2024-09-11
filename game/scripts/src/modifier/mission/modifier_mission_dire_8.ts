import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_dire_8_thinker extends BaseModifier {

    state:boolean;

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 8000; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.FRIENDLY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_mission_dire_8_thinker_aura"; }

    OnCreated(params: object): void {
        if(!IsServer()){ return }
        this.state= false;
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        
    }

    OnDestroy(): void {
        if(!IsServer()){ return }
        GameRules.MissionSystem.DireMissionHandle.MissionOverTime()
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_mission_dire_8_thinker_aura extends BaseModifier {

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return 100
    }
}