// change_passive_coldbrand.ts
/**
 * name:寒痕
 * Description:被动。普攻有概率在目标身上留下“寒痕”，减速并在短时间内使其额外承受冰属性伤害。
 * hero:小黑
 * chance_pct 25  debuff_duration 1.6  slow_pct 20  ice_income_pct 15  icd 0.5
 */
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

@registerAbility()
export class change_passive_coldbrand extends BaseCreatureAbility {
    // 这个方法定义了技能的内置修饰器名称
    // 当英雄学习这个被动技能时，会自动获得名为 'modifier_change_passive_coldbrand' 的修饰器
    // 这个修饰器会一直存在，用于监听攻击事件并触发寒痕效果
    GetIntrinsicModifierName(): string {
        return 'modifier_change_passive_coldbrand';
    }

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/units/heroes/hero_ancient_apparition/ancient_apparition_chilling_touch_debuff.vpcf', context);
        PrecacheResource('soundfile', 'soundevents/game_sounds_heroes/game_sounds_ancient_apparition.vsndevts', context);
    }
}

@registerModifier()
export class modifier_change_passive_coldbrand extends BaseModifier {
    private chance!: number;
    private debuff_duration!: number;
    private slow_pct!: number;
    private ice_income_pct!: number;
    private icd!: number;
    private lastProcTime: Record<EntityIndex, number> = {};
    IsHidden() {
        return true;
    }
    IsPurgable() {
        return false;
    }

    OnCreated(): void {
        const ability = this.GetAbility();
        this.chance = ability.GetSpecialValueFor('chance_pct');
        this.debuff_duration = ability.GetSpecialValueFor('debuff_duration');
        this.slow_pct = ability.GetSpecialValueFor('slow_pct');
        this.ice_income_pct = ability.GetSpecialValueFor('ice_income_pct');
        this.icd = ability.GetSpecialValueFor('icd');
    }

    DeclareFunctions(): ModifierFunction[] {
        return [ModifierFunction.ON_ATTACK_LANDED];
    }

    OnAttackLanded(event: ModifierAttackEvent): void {
        if (!IsServer()) return;
        const parent = this.GetParent();
        if (event.attacker !== parent) return;
        const target = event.target as CDOTA_BaseNPC;
        if (!target || target.IsNull() || !target.IsAlive()) return;

        const roll = typeof RollPercentage === 'function' ? RollPercentage(this.chance) : Math.random() * 100 <= this.chance;

        const now = GameRules.GetGameTime();
        const key = target.entindex();
        const canProc = this.lastProcTime[key] === undefined || now - this.lastProcTime[key] >= this.icd;

        if (roll && canProc) {
            this.lastProcTime[key] = now;
            target.AddNewModifier(parent, this.GetAbility(), 'modifier_change_passive_coldbrand_debuff', {
                duration: this.debuff_duration,
                slow_pct: this.slow_pct,
                ice_income_pct: this.ice_income_pct,
            });

            if (GameRules?.EnemyAttribute?.SetAttributeInKey) {
                GameRules.EnemyAttribute.SetAttributeInKey(
                    target,
                    'change_passive_coldbrand_ice_income',
                    { IceDamageIncome: { Base: this.ice_income_pct } },
                    this.debuff_duration
                );
            }

            // 视觉&音效
            const p = ParticleManager.CreateParticle(
                'particles/units/heroes/hero_ancient_apparition/ancient_apparition_chilling_touch_debuff.vpcf',
                ParticleAttachment.ABSORIGIN_FOLLOW,
                target
            );
            ParticleManager.ReleaseParticleIndex(p);
            target.EmitSound('Hero_Ancient_Apparition.ChillingTouch.Target');
        }
    }
}

@registerModifier()
export class modifier_change_passive_coldbrand_debuff extends BaseModifier {
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
