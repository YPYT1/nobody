import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

/** 蜘蛛 */
@registerModifier()
export class modifier_mission_dire_1 extends BaseModifier {

    state: boolean;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.state = false;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ON_DEATH,
        ]
    }

    OnDeath(event: ModifierInstanceEvent): void {
        if (IsServer()) {
            if (event.unit == this.GetParent()) {
                this.state = true
            }
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.MissionSystem.DireMissionHandle.EndOfMission(this.state)
        // UTIL_Remove(this.GetParent())
    }
}