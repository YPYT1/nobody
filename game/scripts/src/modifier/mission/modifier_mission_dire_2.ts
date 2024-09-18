import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

/** 怒火野马 */
@registerModifier()
export class modifier_mission_dire_2 extends BaseModifier {

    state: boolean;
    target: CDOTA_BaseNPC;
    parent: CDOTA_BaseNPC;

    target_fx: ParticleID;

    IsHidden(): boolean { return true }

    IsAura(): boolean { return true; }
    GetAuraRadius(): number { return 200; }
    GetAuraSearchFlags() { return UnitTargetFlags.NONE; }
    GetAuraSearchTeam() { return UnitTargetTeam.ENEMY; }
    GetAuraSearchType() { return UnitTargetType.HERO + UnitTargetType.BASIC; }
    GetModifierAura() { return "modifier_mission_dire_2_aura"; }

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.state = false;
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
                this.target = enemies[0];
                this.parent.AddNewModifier(this.parent, null, "modifier_mission_dire_2_target", {
                    target: this.target.entindex(),
                })
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
export class modifier_mission_dire_2_aura extends BaseModifier {

    IsHidden(): boolean { return true }

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

        hCaster.AddNewModifier(hCaster, null, "modifier_mission_dire_2_root", { duration: 1 })
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
export class modifier_mission_dire_2_root extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.ROOTED]: true
        }
    }
}

@registerModifier()
export class modifier_mission_dire_2_target extends BaseModifier {

    effect_fx: ParticleID;

    OnCreated(params: object): void {
        this.OnRefresh(params)
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        if (this.effect_fx) { ParticleManager.DestroyParticle(this.effect_fx, true) }
        this.effect_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/move.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        let target = params.target as EntityIndex;
        let hTarget = EntIndexToHScript(target);
        ParticleManager.SetParticleControlEnt(
            this.effect_fx,
            1,
            hTarget, ParticleAttachment.POINT_FOLLOW,
            "attach_loc",
            Vector(0, 0, 0),
            false
        )
        ParticleManager.SetParticleControl(this.effect_fx, 6, Vector(255, 0, 0))
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        if (this.effect_fx) { ParticleManager.DestroyParticle(this.effect_fx, true) }
    }
}