import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

@registerModifier()
export class modifier_mission_radiant_5_ai extends BaseModifier {

    idle_timer: number;
    last_vect: Vector;
    is_timeout: boolean;

    delay = 3;
    
    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.idle_timer = 0;
        this.is_timeout = true;
        // 先随机移动一个点
        this.parent = this.GetParent();
        this.last_vect = this.parent.GetAbsOrigin();
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {

        if (this.delay <= 0) {
            let players = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                this.parent.GetAbsOrigin(),
                null,
                125,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            )
            // print("players.length", players.length)
            if (players.length > 0) {
                this.is_timeout = false;
                GameRules.MissionSystem.RadiantMissionHandle.AddProgressValue(1);
                this.StartIntervalThink(-1)
                this.Destroy();
                return
            }
        } else {
            if (this.delay > 2.9) {
                this.MovePig()
            }
            this.delay -= 0.1;

        }


        if (this.last_vect == this.parent.GetAbsOrigin()) {
            this.idle_timer += 0.1;
            if (this.idle_timer >= 1) {
                this.idle_timer = 0;
                this.MovePig()
            }
        } else {
            this.idle_timer = 0;
            this.last_vect = this.parent.GetAbsOrigin();
        }
    }

    MovePig() {
        let move_points = this.last_vect + RandomVector(RandomInt(300, 600)) as Vector;
        this.parent.MoveToPosition(move_points)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        if (this.is_timeout) {
            GameRules.MissionSystem.RadiantMissionHandle.EndOfMission(false)
        }
        UTIL_Remove(this.GetParent())
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BASE_OVERRIDE,
            ModifierFunction.IGNORE_MOVESPEED_LIMIT,
        ]
    }

    GetModifierIgnoreMovespeedLimit(): 0 | 1 {
        return 1
    }

    GetModifierMoveSpeedOverride(): number {
        return 600
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.UNSLOWABLE]: true,
            [ModifierState.INVULNERABLE]: true,
        }
    }
}