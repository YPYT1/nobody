import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * creature_elite_19 火刺（简化版）
 * 对指定区域内的友方单位进行治疗并给予魔法免疫
 */
@registerAbility()
export class creature_elite_19 extends BaseCreatureAbility {
    OnSpellStart(): void {
        const caster = this.GetCaster();
        const targetPoint = this.GetCursorPosition();
        const radius = this.GetSpecialValueFor('radius');
        const healPct = this.GetSpecialValueFor('heal_max_hp') / 100;
        const immuneDuration = this.GetSpecialValueFor('knockback_duration');

        // 查找范围内的友方单位
        const allies = FindUnitsInRadius(
            caster.GetTeamNumber(),
            targetPoint,
            undefined,
            radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO + UnitTargetType.CREEP + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        //延迟 莉拉（参考这个人物的技能，先进性播放特效在进行回血处理）

        for (const ally of allies) {
            const healAmount = ally.GetMaxHealth() * healPct;
            ally.Heal(healAmount, this);
            ally.AddNewModifier(caster, this, 'modifier_creature_elite_19_immune', {
                duration: immuneDuration,
            });
        }
    }

    GetAOERadius(): number {
        return this.GetSpecialValueFor('radius');
    }
}

/**
 * 魔法免疫修饰器
 */
@registerModifier()
export class modifier_creature_elite_19_immune extends BaseModifier {
    //检查
    IsHidden(): boolean {
        return false;
    }

    IsPurgable(): boolean {
        return false;
    }

    IsDebuff(): boolean {
        return false;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.MAGIC_IMMUNE]: true,
        };
    }

    GetEffectName(): string {
        return 'maps/cavern_assets/particles/lamp_cavern_tintable_f.vpcf';
    }
}
