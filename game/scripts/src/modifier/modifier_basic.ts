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

    IsHidden(): boolean { return true; }
    RemoveOnDeath(): boolean { return false }

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.state_chaos = false;
        this.parent.move_state = false
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
            this.move_up = false;
            this.move_down = false;
            this.move_left = false;
            this.move_right = false;
            this.OnMoveStateChange(false)
            this.StartIntervalThink(-1)
            return
        }
        if (params.UP) { this.move_up = params.UP == 1; }
        if (params.DOWN) { this.move_down = params.DOWN == 1; }
        if (params.LEFT) { this.move_left = params.LEFT == 1; }
        if (params.RIGHT) { this.move_right = params.RIGHT == 1; }
        if (params.SPACE == 1) {
            const ability = this.parent.FindAbilityByName("public_blink");
            if (ability && ability.IsCooldownReady()) {
                ExecuteOrderFromTable({
                    UnitIndex: this.unit_index,
                    AbilityIndex: ability.entindex(),
                    OrderType: UnitOrder.CAST_NO_TARGET,
                    Queue: false

                })
            }
            return
        }

        this.parent.FadeGesture(GameActivity.DOTA_ATTACK);
        // print(this.move_up, this.move_left, this.move_down, this.move_right);
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
        if (this.parent.HasModifier("modifier_debuff_uncontroll")) { return }
        if (this.parent.IsAlive() == false) {
            this.move_up = false;
            this.move_down = false;
            this.move_left = false;
            this.move_right = false;
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

        // 如果有克隆体
        if (this.parent.clone_unit != null && this.parent.clone_unit.HasModifier("modifier_skywrath_5_clone_show")) {
            let clone_origin = this.parent.clone_unit.GetOrigin();
            if (this.move_up) { clone_origin.y += this.move_distance }
            if (this.move_down) { clone_origin.y -= this.move_distance }
            if (this.move_left) { clone_origin.x -= this.move_distance }
            if (this.move_right) { clone_origin.x += this.move_distance }
            ExecuteOrderFromTable({
                UnitIndex: this.parent.clone_unit.entindex(),
                OrderType: UnitOrder.MOVE_TO_POSITION,
                Position: clone_origin,
                Queue: false,
            })
        }
    }

    OnMoveStateChange(state: boolean) {
        this.parent.move_state = state;
        if (state == false) {
            this.parent.FadeGesture(GameActivity.DOTA_CAST_ABILITY_1);
            ExecuteOrderFromTable({
                UnitIndex: this.unit_index,
                OrderType: UnitOrder.STOP,
                // Position: origin,
                Queue: false,
            })


        } else {
            this.parent.RemoveModifierByName("modifier_skywrath_1c_lx_channel")
            this.parent.RemoveModifierByName("modifier_modifier_skywrath_3a_channel")
        }
        // if (state == false) {
        //     this.move_up = false;
        //     this.move_down = false;
        //     this.move_left = false;
        //     this.move_right = false;
        // }
        // print("OnMoveStateChange", state)
        // prop_30	【极速护符】	原地不动时，技能急速加成提高15%,冷却上限提高15%
        if (this.parent.prop_count['prop_30']) {
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

/** 倒计时 */
@registerModifier()
export class modifier_basic_countdown extends BaseModifier {

    timer: number;
    timer_fx: ParticleID;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.timer = this.GetDuration()
        this.timer_fx = ParticleManager.CreateParticle(
            "particles/test_particle/xulie/overhead_timer.vpcf",
            ParticleAttachment.OVERHEAD_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(this.timer_fx, 1, Vector(0, 0, 0));
        ParticleManager.SetParticleControl(this.timer_fx, 2, Vector(3, 0, 0));
        ParticleManager.SetParticleControl(this.timer_fx, 3, Vector(255, 0, 0));
        this.AddParticle(this.timer_fx, false, false, -1, true, true);

        this.OnIntervalThink();
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let countdown = math.floor(this.timer);
        let cp1_x = math.floor(countdown / 10);
        let cp1_y = math.floor(countdown % 10);
        ParticleManager.SetParticleControl(this.timer_fx, 1, Vector(cp1_x, cp1_y, 0));
        this.timer -= 1;
    }

}

@registerModifier()
export class modifier_basic_hits extends BaseModifier {

    bar_Pips: number;

    IsHidden(): boolean { return true; }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.HEALTHBAR_PIPS,
        ];
    }


    OnCreated(params: object): void {
        this.OnRefresh(params);
    }

    OnRefresh(params: object): void {
        this.bar_Pips = math.min(25, this.GetParent().GetMaxHealth());
    }

    GetModifierHealthBarPips() {
        return this.bar_Pips;
    }





}