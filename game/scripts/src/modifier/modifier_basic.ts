import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

@registerModifier()
export class modifier_basic_move extends BaseModifier {

    player_control: CDOTAPlayerController;
    owner_player: PlayerID;
    parent: CDOTA_BaseNPC;
    unit_index: EntityIndex;

    move_up: boolean;
    move_down: boolean;
    move_left: boolean;
    move_right: boolean;

    IsHidden(): boolean { return true; }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.unit_index = this.parent.GetEntityIndex();
        this.owner_player = this.parent.GetPlayerOwnerID();
        this.player_control = this.parent.GetPlayerOwner();
        this.move_up = false;
        this.move_down = false;
        this.move_left = false;
        this.move_right = false;
        this.OnRefresh(params);
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        if (params.UP) { this.move_up = params.UP == 1; }
        if (params.DOWN) { this.move_down = params.DOWN == 1; }
        if (params.LEFT) { this.move_left = params.LEFT == 1; }
        if (params.RIGHT) { this.move_right = params.RIGHT == 1; }

        this.StartIntervalThink(0.01)
    }

    OnIntervalThink(): void {
        if (!this.move_up && !this.move_down && !this.move_left && !this.move_right) {
            this.StartIntervalThink(-1)
            return
        }

        if (this.parent.IsAlive() == false) {
            this.move_up = false;
            this.move_down = false;
            this.move_left = false;
            this.move_right = false;
            this.StartIntervalThink(-1)
            return;
        }

        let origin = this.parent.GetAbsOrigin();

        if (this.move_up) { origin.y += 50 }
        if (this.move_down) { origin.y -= 50 }
        if (this.move_left) { origin.x -= 50 }
        if (this.move_right) { origin.x += 50 }

        ExecuteOrderFromTable({
            UnitIndex: this.unit_index,
            OrderType: UnitOrder.MOVE_TO_POSITION,
            Position: origin,
            Queue: false,
        })
    }
}

@registerModifier()
export class modifier_basic_debug extends BaseModifier {

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            // [ModifierState.ALLOW_PATHING_THROUGH_CLIFFS]:true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true,
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.IGNORE_MOVESPEED_LIMIT
        ]
    }

    GetModifierIgnoreMovespeedLimit(): 0 | 1 {
        return 1
    }
}

@registerModifier()
export class modifier_common_mul_health extends BaseModifier {

    IsHidden(): boolean { return true; }
    IsDebuff(): boolean { return false; }
    RemoveOnDeath(): boolean { return false; }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.PERMANENT;
    }

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        let iMulte = params.iMulte;
        this.SetStackCount(iMulte);
    }
}
