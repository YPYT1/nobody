import { BaseAbility, BaseItem, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';
/**
 * 怪物技能基础模版
 * 这个类为 Dota2 中的怪物技能提供基础功能，例如技能的预警、伤害计算、击飞效果等。
 */
export class BaseCreatureAbility extends BaseAbility {
    // 粒子效果的存储变量
    nPreviewFX: ParticleID; // 单个预警粒子效果
    nPreviewFX_List: ParticleID[] = []; // 粒子效果列表
    nPreviewFX_2: ParticleID; // 第二个预警粒子效果
    nExclamationFx: ParticleID; // "感叹号"粒子效果

    // 技能相关的常见变量
    _cast_point: number; // 技能施法时间
    vOrigin: Vector; // 施法者位置
    vPoint: Vector; // 目标位置
    vTarget: Vector; // 目标点
    hTarget: CDOTA_BaseNPC; // 目标单位
    hCaster: CDOTA_BaseNPC; // 施法者单位
    caster: CDOTA_BaseNPC; // 施法者（与 `hCaster` 相同）
    particle_idx: ParticleID; // 粒子效果的索引
    channel_timer: number; // 持续施法的计时器
    _distance: number; // 施法距离
    _damage_factor: number; // 伤害因子
    _count: number; // 使用计数
    _interval: number; // 间隔时间
    _radius: number; // 技能范围
    _damage: number; // 技能伤害
    _duration: number; // 技能持续时间
    _project_speed: number; // 投射物速度
    _team: DotaTeam; // 施法者的队伍
    _cast_range: number; // 施法范围
    dmg_max_hp: number; // 伤害最大生命百分比
    dmg_cur_hp: number; // 伤害当前生命百分比

    /**
     * 初始化技能的引导阶段
     * @returns boolean - 表示是否允许开始技能施放
     */
    OnAbilityPhaseStart(): boolean {
        return true;
    }

    /**
     * 当施法阶段被中断时调用
     */
    OnAbilityPhaseInterrupted() {
        this.DestroyWarningFx(); // 清除所有的预警粒子效果
    }

    /**
     * 销毁技能的所有预警效果
     */
    DestroyWarningFx() {
        this.hCaster.RemoveModifierByName('modifier_state_boss_invincible'); // 移除“无敌”状态

        // 销毁所有预警粒子效果
        if (this.nPreviewFX) {
            ParticleManager.DestroyParticle(this.nPreviewFX, true);
            this.nPreviewFX = null;
        }
        if (this.nPreviewFX_2) {
            ParticleManager.DestroyParticle(this.nPreviewFX_2, true);
            this.nPreviewFX_2 = null;
        }
        if (this.nExclamationFx) {
            ParticleManager.DestroyParticle(this.nExclamationFx, true);
            this.nExclamationFx = null;
        }
        for (const preview of this.nPreviewFX_List) {
            ParticleManager.DestroyParticle(preview, true); // 销毁粒子效果列表中的粒子
        }
        this.nPreviewFX_List = []; // 清空粒子列表

        GameRules.CMsg.BossCastWarning(false); // 关闭 Boss 施法警告
    }

    /**
     * 预加载技能所需的资源
     * @param context - 预加载上下文
     */
    Precache(context: CScriptPrecacheContext): void {
        // 预加载技能粒子资源
        precacheResString('particles/units/heroes/hero_treant/treant_overgrowth_cast.vpcf', context);
    }

    /**
     * 技能升级时调用，初始化技能的各种参数
     */
    OnUpgrade(): void {
        this.hCaster = this.GetCaster(); // 获取施法者
        this.caster = this.GetCaster(); // 获取施法者（与 hCaster 相同）
        this._radius = this.GetSpecialValueFor('radius'); // 技能范围
        this._damage_factor = this.GetSpecialValueFor('damage_factor'); // 伤害因子
        this._duration = this.GetSpecialValueFor('duration'); // 技能持续时间
        this._interval = this.GetSpecialValueFor('interval'); // 施法间隔
        this._cast_range = this.GetCastRange(this.GetCaster().GetOrigin(), this.GetCaster()); // 施法范围
        this._cast_point = this.GetCastPoint(); // 获取施法时间
        this._team = this.hCaster.GetTeam(); // 获取施法者队伍
        this.channel_timer = this.GetChannelTime(); // 获取施法持续时间
        this.dmg_max_hp = this.GetSpecialValueFor('dmg_max_hp') * 0.01; // 最大生命伤害百分比
        this.dmg_cur_hp = this.GetSpecialValueFor('dmg_cur_hp') * 0.01; // 当前生命伤害百分比
    }

    /**
     * 当施法通道结束时调用
     * @param interrupted - 是否被中断
     */
    OnChannelFinish(interrupted: boolean): void {
        this.hCaster.RemoveModifierByName('modifier_state_boss_invincible_channel'); // 移除通道中的“无敌”状态
        GameRules.CMsg.BossCastWarning(false); // 关闭 Boss 施法警告
    }

    /**
     * 退后处理方法：对范围内的敌人施加伤害和击飞效果
     * @param radius - 退后效果的范围
     */
    OnKnockback(radius: number) {
        const vOrigin = this.hCaster.GetOrigin(); // 获取施法者的位置
        const effect_px = ParticleManager.CreateParticle(
            'particles/units/heroes/hero_phoenix/phoenix_supernova_reborn.vpcf', // 创建击退的粒子效果
            ParticleAttachment.ABSORIGIN,
            this.hCaster
        );
        ParticleManager.SetParticleControl(effect_px, 1, Vector(radius, radius, radius)); // 设置粒子的范围
        ParticleManager.ReleaseParticleIndex(effect_px); // 释放粒子效果

        // 查找范围内的敌人
        const enemies = FindUnitsInRadius(
            this._team, // 查找目标的队伍
            vOrigin, // 起始位置为施法者位置
            null, // 不指定缓存单位
            radius, // 查找范围
            UnitTargetTeam.ENEMY, // 目标为敌方
            UnitTargetType.BASIC + UnitTargetType.HERO, // 目标为英雄或基础单位
            UnitTargetFlags.NONE, // 不过滤标志
            FindOrder.ANY, // 任意顺序
            false // 是否隐藏
        );

        // 对范围内的每个敌人造成伤害并应用击飞效果
        for (const enemy of enemies) {
            const damage = enemy.GetMaxHealth() * 0.25; // 计算伤害为敌人最大生命的25%
            ApplyCustomDamage({
                victim: enemy, // 受害者是敌人
                attacker: this.hCaster, // 攻击者是施法者
                ability: this, // 技能
                damage: damage, // 伤害值
                damage_type: DamageTypes.PHYSICAL, // 伤害类型为物理伤害
                miss_flag: 1, // 忽略闪避
            });

            // 为敌人添加击飞效果
            enemy.AddNewModifier(this.hCaster, this, 'modifier_knockback_lua', {
                center_x: vOrigin.x,
                center_y: vOrigin.y,
                center_z: 0,
                knockback_height: 100, // 设置击飞高度
                knockback_distance: 450, // 设置击飞距离
                knockback_duration: 1, // 设置击飞持续时间
                duration: 1, // 设置击飞效果持续时间
            });
        }
    }

    /**
     * 阶段转换时清除技能当前的效果（可以扩展）
     */
    ClearCurrentPhase() {
        // 可以在此清除技能在当前阶段的效果，例如清除任何状态，粒子等
    }
}
