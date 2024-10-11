import { BaseAbility, registerAbility, BaseModifier, registerModifier } from "../utils/dota_ts_adapter";


@registerModifier()
export class modifier_state_invincible extends BaseModifier {

    IsHidden(): boolean { return false; }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        }
    }

}

@registerModifier()
export class modifier_state_damage_immunity extends BaseModifier {

    IsHidden(): boolean { return false; }

}


@registerModifier()
export class modifier_state_bloodmage extends BaseModifier {

    RemoveOnDeath(): boolean { return false }
    IsHidden(): boolean { return true; }
    IsPermanent(): boolean { return true }
}

@registerModifier()
export class modifier_state_movetips extends BaseModifier {

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let vect = Vector(params.x, params.y, params.z);

        let line_pfx = ParticleManager.CreateParticle(
            "particles/diy_particles/move.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent(),
        );
        ParticleManager.SetParticleControl(line_pfx, 1, vect);
        ParticleManager.SetParticleControl(line_pfx, 6, Vector(255, 255, 255));
        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}

// 天辉任务路径  绿色，光柱绿色；
@registerModifier()
export class modifier_state_mission_path_radiant extends BaseModifier {

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let vect = Vector(params.x, params.y, params.z);

        let line_pfx = ParticleManager.CreateParticle(
            "particles/diy_particles/move.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent(),
        );
        ParticleManager.SetParticleControl(line_pfx, 1, vect);
        ParticleManager.SetParticleControl(line_pfx, 6, Vector(50, 255, 50))

        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}

@registerModifier()
export class modifier_state_mission_path_dire extends BaseModifier {

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let vect = Vector(params.x, params.y, params.z);

        let line_pfx = ParticleManager.CreateParticle(
            "particles/diy_particles/move.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent(),
        );
        ParticleManager.SetParticleControl(line_pfx, 1, vect);
        ParticleManager.SetParticleControl(line_pfx, 6, Vector(255, 0, 50))
        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}

/** 任务单位 */
@registerModifier()
export class modifier_state_mission extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSLOWABLE]: true,
            // [ModifierState.NOT_ON_MINIMAP]:true,
        }
    }
}

/** 任务单位 */
@registerModifier()
export class modifier_state_noheathbar extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
        }
    }
}

/** Boss无敌，不会失去生命值 */
@registerModifier()
export class modifier_state_boss_invincible extends BaseModifier {

    viewer_id: ViewerID;
    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.viewer_id = AddFOWViewer(DotaTeam.GOODGUYS, this.GetParent().GetAbsOrigin(), 1000, 10, false)
        let effect_fx = ParticleManager.CreateParticle(
            "particles/items_fx/black_king_bar_avatar.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        RemoveFOWViewer(DotaTeam.GOODGUYS, this.viewer_id)
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_avatar.vpcf"
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        return -999
    }
}
@registerModifier()
export class modifier_state_boss_invincible_channel extends modifier_state_boss_invincible { }

@registerModifier()
export class modifier_state_boss_growup extends BaseModifier {

    value: number;

    // IsHidden(): boolean {
    //     return true
    // }

    OnCreated(params: object): void {
        this.value = 0;
        if (!IsServer()) { return }
        this.StartIntervalThink(5)
    }

    OnIntervalThink(): void {
        this.value += 1
        this.IncrementStackCount()
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.value;
    }
}

@registerModifier()
export class modifier_state_boss_phase_hp extends BaseModifier {

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MIN_HEALTH
        ]
    }

    GetMinHealth(): number {
        return this.GetParent().GetMaxHealth() * this.GetStackCount() * 0.01
    }
}

@registerModifier()
export class modifier_state_lifetime extends BaseModifier {
    
    IsHidden(): boolean {
        return true
    }
    
    OnDestroy(): void {
        if (!IsServer()) { return }
        UTIL_RemoveImmediate(this.GetParent())
    }
}