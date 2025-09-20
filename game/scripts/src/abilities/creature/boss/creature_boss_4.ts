import { modifier_motion_adsorb } from '../../../modifier/motion/modifier_motion_adsorb';
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_boss_4	万象天引
 * 蓄力3秒，对自身直径1000码范围内敌人强吸引，并每秒造成伤害，距离boss越近受到伤害越高。
 * 持续4秒（每秒伤害玩家最大生命值25%）
 */
@registerAbility()
export class creature_boss_4 extends BaseCreatureAbility {
    Precache(context: CScriptPrecacheContext): void {
        precacheResString('particles/units/heroes/hero_enigma/enigma_black_hole_scepter_pull_debuff.vpcf', context);
        precacheResString('particles/units/heroes/hero_enigma/enigma_black_hole_scepter.vpcf', context);
        precacheResString('particles/custom_diy/enigma/enigma_world_chasm/enigma_blackhole_ti5iy.vpcf', context);
    }

    OnAbilityPhaseStart(): boolean {
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible', {});
        this.vOrigin = this.hCaster.GetAbsOrigin();
        this.nPreviewFX = GameRules.WarningMarker.Circular(this._cast_range, this._cast_point, this.vOrigin);
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning', {
            unitname: this.hCaster.GetUnitName(),
            ability: this.GetAbilityName(),
        });
        return true;
    }

    OnSpellStart(): void {
        this.DestroyWarningFx();
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_state_boss_invincible_channel', {});
        this.hCaster.AddNewModifier(this.hCaster, this, 'modifier_creature_boss_4_channel', {});
        GameRules.CMsg.BossCastWarning(true, 'custom_text_boss_cast_warning_3', {});
    }

    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName('modifier_creature_boss_4_channel');
        this.hCaster.RemoveModifierByName('modifier_state_boss_invincible_channel');
        GameRules.CMsg.BossCastWarning(false);
        this.OnKnockback(300);
    }
}

@registerModifier()
export class modifier_creature_boss_4_channel extends BaseModifier {
    radius: number;
    origin: Vector;
    caster: CDOTA_BaseNPC;
    interval: number;
    dmg_max_hp: number;

    IsAura(): boolean {
        return true;
    }

    GetAuraRadius(): number {
        return this.radius;
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
        return 'modifier_creature_boss_4_aura';
    }

    OnCreated(params: object): void {
        this.radius = this.GetAbility().GetSpecialValueFor('radius');
        if (!IsServer()) {
            return;
        }
        this.caster = this.GetCaster();
        this.origin = this.caster.GetAbsOrigin();
        this.dmg_max_hp = 25;
        const effect_fx = ParticleManager.CreateParticle(
            'particles/custom_diy/enigma/enigma_world_chasm/enigma_blackhole_ti5iy.vpcf',
            ParticleAttachment.ABSORIGIN,
            this.GetParent()
        );
        // ParticleManager.SetParticleControlTransform

        this.AddParticle(effect_fx, false, false, -1, false, false);

        const aoe_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_enigma/enigma_black_hole_scepter.vpcf',
            ParticleAttachment.POINT,
            this.GetParent()
        );
        ParticleManager.SetParticleControl(aoe_fx, 1, Vector(this.radius, 1, 1));
        this.AddParticle(aoe_fx, false, false, -1, false, false);
        // this.OnIntervalThink()
        this.StartIntervalThink(1);
    }

    OnIntervalThink(): void {
        const enemies = FindUnitsInRadius(
            this.caster.GetTeam(),
            this.origin,
            null,
            this.radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        // 黑洞吸附效果
        // 从离boss1000码起，每100码伤害递增5%
        for (const enemy of enemies) {
            const target_vect = enemy.GetAbsOrigin();
            const direction = (target_vect - this.origin) as Vector;
            const distance = direction.Length2D();

            const bonus_dmg_pct = 5 * (math.max(0, 1000 - distance) / 100);
            const damage = enemy.GetMaxHealth() * (this.dmg_max_hp + bonus_dmg_pct) * 0.01;
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.GetCaster(),
                ability: this.GetAbility(),
                damage: damage,
                damage_type: DamageTypes.PHYSICAL,
                miss_flag: 1,
            });
        }
    }

    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        // print("OnDestroy",this.GetName())
    }
}

@registerModifier()
export class modifier_creature_boss_4_aura extends modifier_motion_adsorb {
    _OnCreated(params: any): void {
        this.speed = 275;

        const auraunit = this.GetAuraOwner();
        const effect_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_enigma/enigma_black_hole_scepter_pull_debuff.vpcf',
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        ParticleManager.SetParticleControlEnt(
            effect_fx,
            0,
            this.GetParent(),
            ParticleAttachment.POINT_FOLLOW,
            'attach_hitloc',
            Vector(0, 0, 0),
            true
        );
        ParticleManager.SetParticleControl(effect_fx, 1, auraunit.GetAbsOrigin());
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }
}
