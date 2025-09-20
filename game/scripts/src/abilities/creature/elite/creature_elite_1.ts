import { modifier_generic_arc_lua } from '../../../modifier/modifier_generic_arc_lua';
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_elite_1	冲刺
 * 锁定一个玩家，原地蓄力3秒后冲刺，对玩家造成伤害（玩家最大生命值20%）并击飞1.5秒。
 * 冲刺700码，宽度100码。施法距离距离700码。
 */
@registerAbility()
export class creature_elite_1 extends BaseCreatureAbility {
    line_width: number;
    line_distance: number;

    OnAbilityPhaseStart(): boolean {
        // let hTarget = this.GetCursorTarget();
        this.line_width = this.GetSpecialValueFor('line_width');
        this.line_distance = this.GetSpecialValueFor('line_distance');
        this.vPoint = this.GetCursorPosition();
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster,
            this.line_width,
            this.hCaster.GetAbsOrigin(),
            this.vPoint,
            this.line_distance,
            this._cast_point
        );
        return true;
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        let direction = (this.vPoint - this.hCaster.GetAbsOrigin()) as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        const vPoint = (this.hCaster.GetAbsOrigin() + direction * this.line_distance) as Vector;

        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_creature_elite_1', {
            target_x: vPoint.x,
            target_y: vPoint.y,
            height: 0,
            speed: 1200,
        });
    }
}

@registerModifier()
export class modifier_creature_elite_1 extends modifier_generic_arc_lua {
    IsHidden(): boolean {
        return true;
    }

    IsAura(): boolean {
        return true;
    }

    GetAuraRadius(): number {
        return 100;
    }

    GetAuraSearchFlags() {
        return UnitTargetFlags.NONE;
    }

    GetAuraSearchTeam() {
        return UnitTargetTeam.ENEMY;
    }

    GetAuraSearchType() {
        return UnitTargetType.HERO + UnitTargetType.BASIC;
    }

    GetModifierAura() {
        return 'modifier_creature_elite_1_aura';
    }

    _OnCreated(kv: any): void {
        const effect_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_spirit_breaker/spirit_breaker_charge.vpcf',
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }
}

@registerModifier()
export class modifier_creature_elite_1_aura extends BaseModifier {
    knockback_duration: number;
    IsHidden(): boolean {
        return true;
    }

    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        // 击飞500码
        this.knockback_duration = this.GetAbility().GetSpecialValueFor('knockback_duration');
        const hParent = this.GetParent();
        const hCaster = this.GetCaster();
        const vCaster = hCaster.GetAbsOrigin();
        const damage = hParent.GetMaxHealth() * 0.2;

        ApplyCustomDamage({
            victim: hParent,
            attacker: hCaster,
            ability: null,
            damage: damage,
            damage_type: DamageTypes.PHYSICAL,
            miss_flag: 1,
        });

        hParent.AddNewModifier(hCaster, null, 'modifier_knockback_lua', {
            center_x: vCaster.x,
            center_y: vCaster.y,
            center_z: 0,
            knockback_height: 600,
            knockback_distance: 0,
            knockback_duration: this.knockback_duration,
            duration: this.knockback_duration,
        });

        this.OnDestroy();
    }
}
