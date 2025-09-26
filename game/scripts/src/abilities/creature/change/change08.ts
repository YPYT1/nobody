//change_08.ts
/**
 * name: Light Strike Array（莉娜光击阵）
 * Description: 莉娜在目标区域召唤一道烈焰柱，在0.5秒延迟后爆炸，对区域内所有敌人造成伤害并眩晕
 * hero: 莉娜 (Lina)
 * 
 * 技能参数:
 * - damage: 800 (伤害值)
 * - radius: 225 (作用范围)
 * - delay: 0.5 (施法延迟时间)
 * - stun_duration: 2.0 (眩晕持续时间)
 * - cast_range: 625 (施法距离)
 * 
 * 技能类型：DOTA_ABILITY_BEHAVIOR_POINT | DOTA_ABILITY_BEHAVIOR_AOE
 * 目标类型：无特定目标，点施法AOE技能
 * 队伍：DOTA_UNIT_TARGET_TEAM_ENEMY
 * 
 * 特效说明:
 * - 预警特效: particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray_team.vpcf
 * - 爆炸特效: particles/units/heroes/hero_lina/lina_spell_light_strike_array.vpcf
 * 
 * 注意：配置文件中的 AbilityBehavior 应该设置为 "DOTA_ABILITY_BEHAVIOR_POINT | DOTA_ABILITY_BEHAVIOR_AOE"
 */

import { BaseAbility, registerAbility } from "../../../utils/dota_ts_adapter";
import { BaseCreatureAbility } from "../base_creature";

@registerAbility()
export class change_08 extends BaseCreatureAbility {

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource('particle', 'particles/units/heroes/hero_lina/lina_spell_light_strike_array.vpcf', context);
        PrecacheResource('particle', 'particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray_team.vpcf', context);
        PrecacheResource('particle', 'particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray.vpcf', context);
        PrecacheResource('soundfile', 'soundevents/game_sounds_heroes/game_sounds_lina.vsndevts', context);
    }

    private warningParticles: ParticleID[] = [];

    OnAbilityPhaseStart(): boolean {
        this.caster = this.GetCaster();
        const radius = this.GetSpecialValueFor('radius');
        const targetPos = this.GetCursorPosition();
        this.nPreviewFX = GameRules.WarningMarker.Circular(radius, this._cast_point, targetPos);
        this.caster.EmitSound('Hero_Lina.LightStrikeArray');
        
        return true;
    }
    
    OnSpellStart(): void {
        print('--------光击阵开始施法--------');
        this.DestroyWarningFx();
        
        this.caster = this.GetCaster();
        
        const damage = this.GetSpecialValueFor('damage');
        const radius = this.GetSpecialValueFor('radius');
        const delay = this.GetSpecialValueFor('delay');
        const stun_duration = this.GetSpecialValueFor('stun_duration');
        const targetPos = this.GetCursorPosition();
        
        const warningFx = ParticleManager.CreateParticleForTeam(
            'particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray_team.vpcf',
            ParticleAttachment.WORLDORIGIN,
            this.caster,
            this.caster.GetTeamNumber()
        );
        ParticleManager.SetParticleControl(warningFx, 0, targetPos);
        ParticleManager.SetParticleControl(warningFx, 1, Vector(radius, 0, 0));
        this.warningParticles.push(warningFx);

        EmitSoundOnLocationWithCaster(targetPos, 'Ability.PreLightStrikeArray', this.caster);
        

        const projectileSpeed = 1 / delay; 
        
        ProjectileManager.CreateLinearProjectile({
            EffectName: '',
            Ability: this,
            Source: this.caster,
            vSpawnOrigin: (targetPos + Vector(0, 0, 1000)) as Vector, // 从高空发射
            vVelocity: Vector(0, 0, -projectileSpeed), // 垂直向下
            fDistance: 1, // 极短的距离
            fStartRadius: radius,
            fEndRadius: radius,
            iUnitTargetTeam: UnitTargetTeam.NONE, // 不自动瞄准
            iUnitTargetType: UnitTargetType.NONE,
            bProvidesVision: false,
            bHasFrontalCone: false,
            ExtraData: {
                damage: damage,
                radius: radius,
                stun_duration: stun_duration,
                targetX: targetPos.x,
                targetY: targetPos.y,
                targetZ: targetPos.z,
                warningFx: warningFx,
                delay: delay,
            },
        });
        
        // 设置延迟后触发爆炸（作为投射物的备用方案）
        Timers.CreateTimer(delay, () => {
            // 这个Timer作为备用，实际爆炸逻辑在OnProjectileHit_ExtraData中处理
            return;
        });
        
        print('--------光击阵施法完成，等待爆炸--------');
    }
    
    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        print('--------光击阵爆炸触发（通过投射物系统）--------');
        
        if (!IsServer()) return;
        const damage = extraData.damage;
        const radius = extraData.radius;
        const stun_duration = extraData.stun_duration;
        const targetX = extraData.targetX;
        const targetY = extraData.targetY;
        const targetZ = extraData.targetZ;
        const warningFx = extraData.warningFx;
        
        const targetPos = Vector(targetX, targetY, targetZ);
        
        if (warningFx) {
            ParticleManager.DestroyParticle(warningFx, false);
            ParticleManager.ReleaseParticleIndex(warningFx);
        }
        
        // 清理所有预警特效
        for (const fx of this.warningParticles) {
            ParticleManager.DestroyParticle(fx, false);
            ParticleManager.ReleaseParticleIndex(fx);
        }
        this.warningParticles = [];
        
        // 创建爆炸特效
        const explosion_fx = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_lina/lina_spell_light_strike_array.vpcf',
            ParticleAttachment.WORLDORIGIN,
            undefined
        );
        ParticleManager.SetParticleControl(explosion_fx, 0, targetPos);
        ParticleManager.SetParticleControl(explosion_fx, 1, Vector(radius, 0, 0));
        ParticleManager.ReleaseParticleIndex(explosion_fx);
        
        // 播放爆炸声音
        EmitSoundOnLocationWithCaster(targetPos, 'Ability.LightStrikeArray', this.caster);
        
        // 查找当前在范围内的敌人（延迟期间离开范围的敌人不会受到伤害）
        const enemies = FindUnitsInRadius(
            this.caster.GetTeamNumber(),
            targetPos,
            null,
            radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        
        print(`找到 ${enemies.length} 个敌人在光击阵爆炸范围内`);
        
        // 对每个在范围内的敌人造成伤害和眩晕
        for (const enemy of enemies) {
            if (enemy && enemy.IsAlive()) {
                // 造成魔法伤害
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                });
                
                // 应用眩晕效果
                enemy.AddNewModifier(
                    this.caster,
                    this,
                    'modifier_stunned',
                    { duration: stun_duration }
                );
                
                // 创建眩晕特效
                const stun_fx = ParticleManager.CreateParticle(
                    'particles/generic_gameplay/generic_stunned.vpcf',
                    ParticleAttachment.OVERHEAD_FOLLOW,
                    enemy
                );
                ParticleManager.SetParticleControl(stun_fx, 0, enemy.GetAbsOrigin());
                
                // 延迟销毁眩晕特效
                Timers.CreateTimer(stun_duration, () => {
                    ParticleManager.DestroyParticle(stun_fx, false);
                    ParticleManager.ReleaseParticleIndex(stun_fx);
                });
                
                print(`对 ${enemy.GetUnitName()} 造成 ${damage} 点魔法伤害并眩晕 ${stun_duration} 秒`);
            }
        }
        
        print('--------光击阵结束--------');
        
        // 返回true表示投射物命中，停止继续飞行
        return true;
    }
    
    // 获取AOE范围（用于显示技能范围指示器）
    GetAOERadius(): number {
        return this.GetSpecialValueFor('radius');
    }
}