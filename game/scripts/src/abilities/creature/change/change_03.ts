//change_03.ts
/**
 * name:霜噬
 * Description:对目标造成魔法伤害并附加寒冰效果，减速30%，持续1.5秒，期间受到额外40%魔法伤害
 * hero:小黑
 * slow_pct 30  duration 1.5  damage_amp_pct 40
 */
//需要获取他的基础移动速度，基础伤害，然后进行计算
import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { reloadable } from '../../../utils/tstl-utils';
import { BaseCreatureAbility } from '../base_creature';

@registerAbility()
@reloadable
export class change_03 extends BaseCreatureAbility {
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/units/heroes/hero_drow/drow_ranger_glacier_projectile_proj.vpcf', context);
    }

    OnSpellStart(): void {
        print('--------开始技能');
        const caster = this.GetCaster();
        const target = this.GetCursorTarget();
        if (!target || target.IsNull() || !target.IsAlive()) {
            return;
        }

        const duration = this.GetSpecialValueFor('duration');
        const projectile = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_drow/drow_ranger_glacier_projectile_proj.vpcf',
            ParticleAttachment.ABSORIGIN_FOLLOW,
            caster
        );
        print('--------开始设置粒子');
        ParticleManager.SetParticleControlEnt(projectile, 0, caster, ParticleAttachment.POINT_FOLLOW, 'attach_attack1', caster.GetAbsOrigin(), true);
        ParticleManager.SetParticleControlEnt(projectile, 1, target, ParticleAttachment.POINT_FOLLOW, 'attach_hitloc', target.GetAbsOrigin(), true);
        ParticleManager.ReleaseParticleIndex(projectile);
        print('--------开始伤害');
        target.AddNewModifier(caster, this, 'modifier_change_03', { duration: duration });
        print('开始应用伤害');
        ApplyCustomDamage({
            victim: target,
            attacker: caster,
            ability: this,
            damage: 50,
            damage_type: DamageTypes.MAGICAL,
            damage_flags: 0,
        });
        print('--------放大魔法元素技能');
        const damage_amp_pct = this.GetSpecialValueFor('damage_amp_pct');
        GameRules.EnemyAttribute.SetAttributeInKey(
            target,
            'change_03_magic_income',
            {
                FireDamageIncome: { Base: damage_amp_pct },
                IceDamageIncome: { Base: damage_amp_pct },
                ThunderDamageIncome: { Base: damage_amp_pct },
                WindDamageIncome: { Base: damage_amp_pct },
            },
            duration
        );
    }
}

@registerModifier()
export class modifier_change_03 extends BaseModifier {
    private slow_pct: number;
    private damage_amp_pct: number;

    IsHidden(): boolean {
        return false;
    }

    OnCreated(params: any): void {
        const ability = this.GetAbility();
        this.slow_pct = ability.GetSpecialValueFor('slow_pct');
        this.damage_amp_pct = ability.GetSpecialValueFor('damage_amp_pct');
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
            // ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ];
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return -this.slow_pct;
    }
    // GetModifierIncomingDamage_Percentage(): number {
    //     return this.damage_amp_pct;
    // }
}
