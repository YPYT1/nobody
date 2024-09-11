import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

/** 怒火野马 */
@registerModifier()
export class modifier_mission_dire_2 extends BaseModifier {

    state: boolean;
    target: CDOTA_BaseNPC;
    parent: CDOTA_BaseNPC;

    IsHidden(): boolean { return true }

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 200; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_mission_dire_1_aura"; }

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.state = false;
        this.OnIntervalThink();
        this.StartIntervalThink(1);
    }

    OnIntervalThink(): void {
        if (this.target == null) {
            let enemies = FindUnitsInRadius(
                DotaTeam.BADGUYS,
                this.parent.GetAbsOrigin(),
                null,
                9999,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.FARTHEST,
                false
            )
            if (enemies.length > 0) {
                this.target = enemies[0]
            }
        } else {
            if (!this.target.IsNull() && this.target.IsAlive() == false) {
                this.target = null
            } else {
                this.parent.MoveToNPC(this.target)
            }
        }
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
        UTIL_Remove(this.GetParent())
    }

}

@registerModifier()
export class modifier_mission_dire_1_aura extends BaseModifier {

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        // 击飞500码
        let hParent = this.GetParent();
        let hCaster = this.GetCaster();
        let vCaster = hCaster.GetAbsOrigin()
        let damage = hParent.GetMaxHealth() * 0.4;

        ApplyCustomDamage({
            victim: hParent,
            attacker: hCaster,
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        })

        hCaster.AddNewModifier(hCaster, null, "modifier_mission_dire_1_root", { duration: 1 })
        hParent.AddNewModifier(hCaster, null, "modifier_knockback_lua", {
            center_x: vCaster.x,
            center_y: vCaster.y,
            center_z: 0,
            knockback_height: 200,
            knockback_distance: 500,
            knockback_duration: 0.75,
            duration: 0.75,
        })
        ExecuteOrderFromTable({
            UnitIndex: hParent.GetEntityIndex(),
            OrderType: UnitOrder.STOP,
            Queue: false,
        })
        this.OnDestroy();
    }
}

@registerModifier()
export class modifier_mission_dire_1_root extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.ROOTED]: true
        }
    }
}