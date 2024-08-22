import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

@registerModifier()
export class modifier_basic_move extends BaseModifier {

    player_control: CDOTAPlayerController;
    owner_player: PlayerID;
    parent: CDOTA_BaseNPC;
    unit_index: EntityIndex;

    state_chaos: boolean;
    move_up: boolean;
    move_down: boolean;
    move_left: boolean;
    move_right: boolean;

    move_distance: number;
    state_moving: boolean;
    IsHidden(): boolean { return true; }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.state_chaos = false;
        this.state_moving = false;
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
        if (this.parent.IsAlive() == false) {
            this.OnMoveStateChange(false)
            this.StartIntervalThink(-1)
            return
        }
        if (params.UP) { this.move_up = params.UP == 1; }
        if (params.DOWN) { this.move_down = params.DOWN == 1; }
        if (params.LEFT) { this.move_left = params.LEFT == 1; }
        if (params.RIGHT) { this.move_right = params.RIGHT == 1; }
        this.move_distance = math.max(this.parent.GetMoveSpeedModifier(this.parent.GetBaseMoveSpeed(), true) * 0.07, 48);
        if (this.parent.HasModifier("modifier_debuff_chaos")) { this.move_distance *= -1; }

        if (!this.move_up && !this.move_down && !this.move_left && !this.move_right) {
            this.OnMoveStateChange(false)
            this.StartIntervalThink(-1)
            return
        }

        let old_vect = this.parent.GetAbsOrigin();
        let origin = this.parent.GetAbsOrigin();
        if (this.move_up) { origin.y += this.move_distance }
        if (this.move_down) { origin.y -= this.move_distance }
        if (this.move_left) { origin.x -= this.move_distance }
        if (this.move_right) { origin.x += this.move_distance }
        if (old_vect == origin) {
            this.OnMoveStateChange(false)
            this.StartIntervalThink(-1)
            return
        }

        this.OnMoveStateChange(true)
        this.OnIntervalThink()
        this.StartIntervalThink(0.07)
    }

    OnIntervalThink(): void {
        if (this.parent.IsAlive() == false) {
            this.OnMoveStateChange(false)
            this.StartIntervalThink(-1)
            return;
        }
        let origin = this.parent.GetAbsOrigin();
        if (this.move_up) { origin.y += this.move_distance }
        if (this.move_down) { origin.y -= this.move_distance }
        if (this.move_left) { origin.x -= this.move_distance }
        if (this.move_right) { origin.x += this.move_distance }
        ExecuteOrderFromTable({
            UnitIndex: this.unit_index,
            OrderType: UnitOrder.MOVE_TO_POSITION,
            Position: origin,
            Queue: false,
        })
    }

    OnMoveStateChange(state: boolean) {
        if (state == false) {
            this.move_up = false;
            this.move_down = false;
            this.move_left = false;
            this.move_right = false;
        }
        // print("OnMoveStateChange", state)
        // prop_30	【极速护符】	原地不动时，技能急速加成提高15%,冷却上限提高15%
        if (this.parent.prop_level_index['prop_30']) {
            if (state) {
                // 移动
                GameRules.CustomAttribute.SetAttributeInKey(this.parent, "prop_30", {
                    'AbilityCooldown': {
                        'Limit': 0
                    },
                    "AbilityHaste": {
                        'BasePercent': 0
                    }
                })
            } else {
                // 停止移动
                let ability_cd_pct = GameRules.MysticalShopSystem.GetKvOfUnit(this.parent, 'prop_30', 'ability_haste_pct')
                let cooldown_limit = GameRules.MysticalShopSystem.GetKvOfUnit(this.parent, 'prop_30', 'cooldown_limit')
                GameRules.CustomAttribute.SetAttributeInKey(this.parent, "prop_30", {
                    'AbilityCooldown': {
                        'Limit': cooldown_limit
                    },
                    "AbilityHaste": {
                        'BasePercent': ability_cd_pct
                    }
                })
            }
        }

    }
}

@registerModifier()
export class modifier_basic_debug extends BaseModifier {

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            // [ModifierState.ALLOW_PATHING_THROUGH_CLIFFS]:true,
            // [ModifierState.NO_UNIT_COLLISION]: true,
            // [ModifierState.FLYING_FOR_PATHING_PURPOSES_ONLY]: true,
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
export class modifier_basic_tracking_thinker extends BaseModifier {

    OnDestroy(): void {
        if (!IsServer()) {
            UTIL_Remove(this.GetParent())
        }
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

@registerModifier()
export class modifier_basic_attack extends BaseModifier {

}
