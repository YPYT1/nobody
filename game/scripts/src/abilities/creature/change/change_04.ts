//change_04.ts
/**
 * name:爆裂毒液
 * Description:主动使用：抛出装满药剂的魔瓶攻击敌人造成20点伤害，会造成1秒眩晕，
 * 并且允许来回弹射10次,冷却10秒,射程400码,弹射距离300码
 * hero:炼金
 * stun_duration 1(眩晕时间)	bounce_count 10	（弹射次数） cast_range 400（射程）	bounce_radius 300（弹射距离）
 * damage 20 （20点伤害） 这5个内容都是写在xlsx中的配置内容
 * DOTA_ABILITY_BEHAVIOR_POINT  这个是我的技能类型
 * particles/econ/items/witch_doctor/wd_monkey/witchdoctor_cask_monkey.vpcf 这个是投掷的特效
 * particles/units/heroes/hero_alchemist/alchemist_unstable_concoction_explosion.vpcf 这个是在目标位置的特效（当碰到敌人时，会播放这个特效）
 * particles/econ/items/alchemist/alchemist_crazy_experiment/alchemist_crazy_experiment_armor_lightning_right.vpcf 眩晕的特效
 * 弹就是先从第一次击中的玩家身上，向其他的敌方弹一个球，使用这个特效（particles/units/heroes/hero_alchemist/alchemist_berserk_potion_flying_bottle.vpcf）
 */

import { reloadable } from '../../../utils/tstl-utils';
import { registerAbility } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

@registerAbility()
@reloadable
export class change_04 extends BaseCreatureAbility {
    target: CDOTA_BaseNPC;
    bounce_left: number;
    bounce_radius: number;
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/econ/items/witch_doctor/wd_monkey/witchdoctor_cask_monkey.vpcf', context);
        PrecacheResource('particle', 'particles/units/heroes/hero_alchemist/alchemist_unstable_concoction_explosion.vpcf', context);
        PrecacheResource(
            'particle',
            'particles/econ/items/alchemist/alchemist_crazy_experiment/alchemist_crazy_experiment_armor_lightning_right.vpcf',
            context
        );
        PrecacheResource('particle', 'particles/units/heroes/hero_alchemist/alchemist_berserk_potion_flying_bottle.vpcf', context);
    }
    OnSpellStart(): void {
        print('开始技能-爆裂毒液');
        this.caster = this.GetCaster();
        this.target = this.GetCursorTarget();
        if (this.target.IsNull() || !this.target.IsAlive()) return;
        print('通过检查');

        this.bounce_left = this.GetSpecialValueFor('bounce_count');
        this.bounce_radius = this.GetSpecialValueFor('bounce_radius');

        const p_info: CreateTrackingProjectileOptions = {
            EffectName: 'particles/econ/items/witch_doctor/wd_monkey/witchdoctor_cask_monkey.vpcf',
            Source: this.caster,
            Target: this.target,
            Ability: this,
            iSourceAttachment: ProjectileAttachment.ATTACK_1,
            iMoveSpeed: 300,
            ExtraData: {},
        };
        ProjectileManager.CreateTrackingProjectile(p_info);
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: object): boolean | void {
        const damage = this.GetSpecialValueFor('damage');
        const stun_duration = this.GetSpecialValueFor('stun_duration');
        const fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_alchemist/alchemist_unstable_concoction_explosion.vpcf',
            ParticleAttachment.WORLDORIGIN,
            undefined
        );
        ParticleManager.SetParticleControl(fx, 0, target.GetAbsOrigin());
        ParticleManager.ReleaseParticleIndex(fx);
        ApplyCustomDamage({
            victim: target,
            attacker: this.caster,
            damage: damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this,
        });
        target.AddNewModifier(this.caster, this, 'modifier_stunned', { duration: stun_duration });

        const p_info: CreateTrackingProjectileOptions = {
            EffectName: 'particles/units/heroes/hero_alchemist/alchemist_berserk_potion_flying_bottle.vpcf',
            Source: target,
            Ability: this,
            iSourceAttachment: ProjectileAttachment.ATTACK_1,
            iMoveSpeed: 700,
            ExtraData: {},
        };
        ProjectileManager.CreateTrackingProjectile(p_info);

        this.bounce_left -= 1;
        if (this.bounce_left <= 0) {
            return;
        }
        const enemies = FindUnitsInRadius(
            this.caster.GetTeamNumber(),
            target.GetAbsOrigin(),
            null,
            this.bounce_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.FARTHEST,
            false
        );
        DeepPrintTable(enemies);
        const next = enemies.find(u => u !== target && u.IsAlive());

        // const heroIndex = enemies.findIndex(u => u === next) + 1;
        // print("现在是第：", heroIndex, "个敌人");
        if (!next) {
            return;
        } else {
            const p_info: CreateTrackingProjectileOptions = {
                EffectName: 'particles/econ/items/witch_doctor/wd_monkey/witchdoctor_cask_monkey.vpcf',
                Source: target,
                Target: next,
                Ability: this,
                iSourceAttachment: ProjectileAttachment.ATTACK_1,
                iMoveSpeed: 300,
                ExtraData: {},
            };
            ProjectileManager.CreateTrackingProjectile(p_info);
        }
    }
}
