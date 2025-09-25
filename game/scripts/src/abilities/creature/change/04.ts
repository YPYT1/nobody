// change_04.ts
/**
 * name:雷痕标记
 * Description:对目标造成一次魔法伤害（= 基础攻击×A% + 基础移速×B），并造成微型眩晕与减速，
 *              同时在持续时间内使其额外承受雷属性伤害（ThunderDamage）C%。
 * hero:小黑
 * dmg_from_base_attack_pct 120  dmg_from_base_movespeed 0.6  slow_pct 35  mini_stun 0.2
 * duration 2.0  thunder_income_pct 20
 */
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { reloadable } from '../../../utils/tstl-utils';
import { BaseCreatureAbility } from '../base_creature';

@registerAbility()
@reloadable
export class change_04 extends BaseCreatureAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/units/heroes/hero_razor/razor_plasmafield_impact.vpcf', context);
    }

    OnSpellStart(): void {
        const caster = this.GetCaster();
        const target = this.GetCursorTarget();
        if (!target || target.IsNull() || !target.IsAlive()) return;
        if (target.TriggerSpellAbsorb && target.TriggerSpellAbsorb(this)) return;

        const A = this.GetSpecialValueFor('dmg_from_base_attack_pct'); // 例如120
        const B = this.GetSpecialValueFor('dmg_from_base_movespeed'); // 例如0.6
        const slow_pct = this.GetSpecialValueFor('slow_pct');
        const mini_stun = this.GetSpecialValueFor('mini_stun');
        const duration = this.GetSpecialValueFor('duration');
        const thunderIncome = this.GetSpecialValueFor('thunder_income_pct');

        // 基础攻击：取基础最小/最大均值，避免受物品天赋波动
        const baseMin = caster.GetBaseDamageMin ? caster.GetBaseDamageMin() : caster.GetAverageTrueAttackDamage(undefined);
        const baseMax = caster.GetBaseDamageMax ? caster.GetBaseDamageMax() : baseMin;
        const baseAtk = (baseMin + baseMax) * 0.5;

        // 基础移速：优先基础值，缺失则退化为当前移速
        const baseMS = caster.GetBaseMoveSpeed
            ? caster.GetBaseMoveSpeed()
            : caster.GetIdealSpeed
            ? caster.GetIdealSpeed()
            : caster.GetMoveSpeedModifier(0, false);

        const damage = baseAtk * (A / 100) + baseMS * B;

        // 视觉
        const p = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_razor/razor_plasmafield_impact.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            target
        );
        ParticleManager.ReleaseParticleIndex(p);
        target.EmitSound('Hero_Zuus.ArcLightning.Target');

        // 微眩 + 减速debuff
        target.AddNewModifier(caster, this, 'modifier_change_04', { duration, slow_pct, thunderIncome });

        // 可选小眩晕
        target.AddNewModifier(caster, this, 'modifier_stunned', { duration: mini_stun });

        // 伤害
        ApplyCustomDamage({
            victim: target,
            attacker: caster,
            ability: this,
            damage,
            damage_type: DamageTypes.MAGICAL,
            damage_flags: 0,
        });

        // 雷元素额外承伤（与你的系统一致的接口）
        if (GameRules?.EnemyAttribute?.SetAttributeInKey) {
            GameRules.EnemyAttribute.SetAttributeInKey(
                target,
                'change_04_thunder_income',
                { ThunderDamageIncome: { Base: thunderIncome } },
                duration
            );
        }
    }
}

@registerModifier()
export class modifier_change_04 extends BaseModifier {
    private slow_pct!: number;

    IsDebuff() {
        return true;
    }
    IsPurgable() {
        return true;
    }
    IsHidden() {
        return false;
    }

    OnCreated(params: any): void {
        if (!IsServer()) return;
        this.slow_pct = params.slow_pct ?? this.GetAbility().GetSpecialValueFor('slow_pct');
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE];
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return -(this.slow_pct || 0);
    }

    GetEffectName(): string {
        return 'particles/generic_gameplay/generic_slowed_cold.vpcf';
    }
    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }
}
