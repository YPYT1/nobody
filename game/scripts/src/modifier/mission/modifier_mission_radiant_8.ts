import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_radiant_8_ai extends BaseModifier {

    state: boolean;

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        this.state = false;
        this.OnIntervalThink();
        this.StartIntervalThink(2);
    }

    OnIntervalThink(): void {
        let next_point = GetRandomMoveVect(this.GetParent().GetOrigin(), RandomInt(400, 700));
        ExecuteOrderFromTable({
            UnitIndex: this.GetParent().entindex(),
            OrderType: UnitOrder.MOVE_TO_POSITION,
            Position: next_point,
        });
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_ABSOLUTE_MIN,
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,

        ]
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]:true
        }
    }
    
    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        if (!event.target.HasModifier("modifier_mission_radiant_8_speed")) {
            event.target.AddNewModifier(event.target, null, "modifier_mission_radiant_8_speed", {
                duration: 0.75
            });
        }
        if (event.damage >= event.target.GetHealth()) {
            this.state = true
        }
        return 0
    }

    GetModifierMoveSpeed_AbsoluteMin(): number {
        return 450
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(this.state);
        UTIL_Remove(this.GetParent())
    }
}

@registerModifier()
export class modifier_mission_radiant_8_speed extends BaseModifier {

    IsHidden(): boolean { return true; }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_CONSTANT
        ];
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        let next_point = GetRandomMoveVect(this.GetParent().GetOrigin(), RandomInt(300, 500));
        ExecuteOrderFromTable({
            UnitIndex: this.GetParent().entindex(),
            OrderType: UnitOrder.MOVE_TO_POSITION,
            Position: next_point,
        });
    }

    GetModifierMoveSpeedBonus_Constant() {
        return 100;
    }
}