import { BaseAbility, registerAbility, BaseModifier, registerModifier } from '../utils/dota_ts_adapter';

@registerModifier()
export class modifier_state_invincible extends BaseModifier {
    IsHidden(): boolean {
        return false;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        };
    }
}

@registerModifier()
export class modifier_state_damage_immunity extends BaseModifier {
    IsHidden(): boolean {
        return false;
    }
}

@registerModifier()
export class modifier_state_bloodmage extends BaseModifier {
    RemoveOnDeath(): boolean {
        return false;
    }

    IsHidden(): boolean {
        return true;
    }

    IsPermanent(): boolean {
        return true;
    }
}

@registerModifier()
export class modifier_state_movetips extends BaseModifier {
    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        const vect = Vector(params.x, params.y, params.z);

        const line_pfx = ParticleManager.CreateParticle('particles/diy_particles/move.vpcf', ParticleAttachment.POINT_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControl(line_pfx, 1, vect);
        ParticleManager.SetParticleControl(line_pfx, 6, Vector(255, 255, 255));
        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}

// 天辉任务路径  绿色，光柱绿色；
@registerModifier()
export class modifier_state_mission_path_radiant extends BaseModifier {
    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        const vect = Vector(params.x, params.y, params.z);

        const line_pfx = ParticleManager.CreateParticle('particles/diy_particles/move.vpcf', ParticleAttachment.POINT_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControl(line_pfx, 1, vect);
        ParticleManager.SetParticleControl(line_pfx, 6, Vector(50, 255, 50));

        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}

@registerModifier()
export class modifier_state_mission_path_dire extends BaseModifier {
    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        const vect = Vector(params.x, params.y, params.z);

        const line_pfx = ParticleManager.CreateParticle('particles/diy_particles/move.vpcf', ParticleAttachment.POINT_FOLLOW, this.GetParent());
        ParticleManager.SetParticleControl(line_pfx, 1, vect);
        ParticleManager.SetParticleControl(line_pfx, 6, Vector(255, 0, 50));
        this.AddParticle(line_pfx, false, false, -1, false, false);
    }
}

/** 任务单位 */
@registerModifier()
export class modifier_state_mission extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSLOWABLE]: true,
            // [ModifierState.NOT_ON_MINIMAP]:true,
        };
    }
}

/** 任务单位 */
@registerModifier()
export class modifier_state_noheathbar extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
        };
    }
}

/** Boss无敌，不会失去生命值 */
@registerModifier()
export class modifier_state_boss_invincible extends BaseModifier {
    viewer_id: ViewerID;
    IsHidden(): boolean {
        return true;
    }

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        this.viewer_id = AddFOWViewer(DotaTeam.GOODGUYS, this.GetParent().GetAbsOrigin(), 1000, 10, false);
        const effect_fx = ParticleManager.CreateParticle(
            'particles/items_fx/black_king_bar_avatar.vpcf',
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
        // this.caster.SetSequence("cast2");
        // this.caster.ClearActivityModifiers();
        this.StartIntervalThink(0.1);
    }

    OnIntervalThink(): void {
        if (this.caster.custom_animation != null && this.caster.custom_animation['cast']) {
            const cast = this.caster.custom_animation['cast'];
            this.caster.RemoveGesture(cast.act);
            this.caster.AddActivityModifier(cast.seq);
            this.caster.StartGesture(cast.act);
            this.SetStackCount(cast.act);
        }
        // print("modifier_state_boss_invincible");
        // this.caster.StartGestureFadeWithSequenceSettings(GameActivity.DOTA_TAUNT)
        // this.caster.StartGesture(GameActivity.DOTA_TAUNT)
        this.StartIntervalThink(-1);
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        RemoveFOWViewer(DotaTeam.GOODGUYS, this.viewer_id);
    }

    GetStatusEffectName(): string {
        return 'particles/status_fx/status_effect_avatar.vpcf';
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.INCOMING_DAMAGE_PERCENTAGE, ModifierFunction.OVERRIDE_ANIMATION, ModifierFunction.OVERRIDE_ANIMATION_RATE];
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        return -999;
    }

    GetOverrideAnimation(): GameActivity_t {
        return this.GetStackCount();
    }

    GetOverrideAnimationRate(): number {
        return 10;
    }
}
@registerModifier()
export class modifier_state_boss_invincible_channel extends modifier_state_boss_invincible {}

@registerModifier()
export class modifier_state_boss_growup extends BaseModifier {
    value: number;

    // IsHidden(): boolean {
    //     return true
    // }

    OnCreated(params: object): void {
        this.value = 0;
        if (!IsServer()) {
            return;
        }
        this.StartIntervalThink(5);
    }

    OnIntervalThink(): void {
        this.value += 1;
        this.IncrementStackCount();
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE];
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.value;
    }
}

@registerModifier()
export class modifier_state_boss_phase_hp extends BaseModifier {
    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.MULTIPLE;
    }

    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.MIN_HEALTH];
    }

    GetMinHealth(): number {
        return this.GetParent().GetMaxHealth() * this.GetStackCount() * 0.01;
    }
}

@registerModifier()
export class modifier_state_lifetime extends BaseModifier {
    IsHidden(): boolean {
        return true;
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        UTIL_RemoveImmediate(this.GetParent());
    }
}

/** 多重施法 范围型 */
@registerModifier()
export class modifier_state_multi_cast_of_aoe extends BaseModifier {
    cast_point: Vector;
    ability: CDOTABaseAbility;
    _damage: number;
    IsHidden(): boolean {
        return true;
    }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE;
    }

    ShouldUseOverheadOffset(): boolean {
        return true;
    }

    OnCreated(params: any): void {
        if (!IsServer()) {
            return;
        }
        this.ability = this.GetAbility();
        this._damage = params._damage;
        this._multi_count = params._multi_count;
        this._count = 0;

        this.cast_point = Vector(params.pos_x, params.pos_y, params.pos_z);

        this.StartIntervalThink(0.25);
    }

    OnIntervalThink(): void {
        const hCaster = this.GetCaster();
        this._count += 1;
        this.ability.TriggerActive({
            vPos: this.cast_point,
            damage: this._damage,
        });
        this.PlayEffects(this._count + 1);
        this._multi_count -= 1;
        if (this._multi_count <= 0) {
            this.StartIntervalThink(-1);
            this.Destroy();
        }
    }

    PlayEffects(value: number) {
        const sound = math.min(value - 1, 3);
        const sound_cast = 'Hero_OgreMagi.Fireblast.x' + sound;
        EmitSoundOn(sound_cast, this.GetCaster());

        const effect_cast = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_ogre_magi/ogre_magi_multicast.vpcf',
            ParticleAttachment.OVERHEAD_FOLLOW,
            this.GetCaster()
        );
        ParticleManager.SetParticleControl(effect_cast, 1, Vector(value, 2, 0));
        ParticleManager.ReleaseParticleIndex(effect_cast);
    }

    effect_cast: ParticleID;
    _vect_x: number;
    _vect_y: number;
    _vect_z: number;
    _multi_limit: number;
    _multi_chance: number;
    _multi_count: number;
    _count: number;
    _target: CDOTA_BaseNPC;
    _behavior: AbilityBehavior;
    _cast_range: number;
}

/** 致命 必定暴击 */
@registerModifier()
export class modifier_state_fatal extends BaseModifier {}
