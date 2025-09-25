import { BaseModifier, registerAbility, registerModifier } from '../../../utils/dota_ts_adapter';
import { BaseCreatureAbility } from '../base_creature';

/**
 * @class creature_elite_9
 * @description 极冰之路技能：引导1秒后，向玩家方向铺出一条持续5秒的极冰之路。
 * 对路径上的敌方玩家造成其最大生命值20%的伤害并减速50%。
 * 施法怪物在路径上行走会获得25%的加速效果。
 * 路径长700码，宽200码。施法距离700码。
 */
@registerAbility()
export class creature_elite_9 extends BaseCreatureAbility {
    line_width: number; // 极冰之路的宽度
    line_distance: number; // 极冰之路的长度

    /**
     * 技能施法前阶段开始时调用。
     * 主要作用：
     * 1. 记录施法者的起始位置和目标位置。
     * 2. 从技能数据中获取路径的宽度和长度。
     * 3. 创建一个预警标记，向玩家显示技能即将影响的范围。
     * @returns {boolean} 总是返回 true，表示技能阶段可以继续。
     */
    OnAbilityPhaseStart(): boolean {
        // 获取施法者当前的位置
        this.vOrigin = this.hCaster.GetAbsOrigin();
        // 获取鼠标指针指向的目标位置
        this.vPoint = this.GetCursorPosition();
        // 从技能配置中获取“line_width”的特殊值，即路径宽度
        this.line_width = this.GetSpecialValueFor('line_width');
        // 从技能配置中获取“line_distance”的特殊值，即路径长度
        this.line_distance = this.GetSpecialValueFor('line_distance');
        // 创建一个线性的预警效果，用于在施法前提示技能范围
        this.nPreviewFX = GameRules.WarningMarker.Line(
            this.hCaster, // 施法单位
            this.line_width, // 线的宽度
            this.hCaster.GetAbsOrigin(), // 线的起点
            this.vPoint, // 线的终点方向
            this.line_distance, // 线的长度
            this._cast_point // 预警效果的持续时间，与施法前摇时间一致
        );
        return true;
    }

    /**
     * 技能效果正式生效时调用。
     * 主要作用：
     * 1. 销毁预警标记。
     * 2. 计算技能释放的最终目标点。
     * 3. 创建一个带有路径效果的“思考者”单位（modifier_creature_elite_9_path），它将负责处理路径上的持续效果。
     * 4. 对路径范围内的所有敌人造成一次性伤害。
     */
    OnSpellStart(): void {
        // 技能开始时，销毁之前创建的预警特效
        this.DestroyWarningFx();
        
        // 计算从施法者指向目标点的单位向量（方向）
        const dir = ((this.vPoint - this.hCaster.GetAbsOrigin()) as Vector).Normalized();
        // 根据方向和技能距离，计算出极冰之路的最终目标位置
        const vTarget = (this.hCaster.GetAbsOrigin() + dir * this.line_distance) as Vector;

        // 创建一个“思考者”单位，它承载了路径的modifier，用于实现路径的持续效果
        CreateModifierThinker(
            this.hCaster, // 施法者
            this, // 技能本身
            'modifier_creature_elite_9_path', // 要附加的modifier名称
            {
                duration: 5, // 路径持续时间为5秒
                x: vTarget.x, // 传递目标点的x坐标
                y: vTarget.y, // 传递目标点的y坐标
            },
            this.hCaster.GetAbsOrigin(), // 思考者被创建在施法者的位置
            this.hCaster.GetTeam(), // 思考者的队伍
            false // 是否是妖术（通常为false）
        );

        // 查找路径上的所有敌方单位
        const enemies = FindUnitsInLine(
            this._team, // 施法者的队伍
            this.vOrigin, // 线的起点
            vTarget, // 线的终点
            null, // 区域中心的单位（此处为null）
            this.line_width, // 线的宽度
            UnitTargetTeam.ENEMY, // 目标队伍：敌方
            UnitTargetType.BASIC + UnitTargetType.HERO, // 目标类型：基础单位和英雄
            UnitTargetFlags.NONE // 目标标签：无特殊标签
        );

        // 遍历所有找到的敌方单位，并对他们造成伤害
        for (const enemy of enemies) {
            // 计算伤害值，为目标最大生命值的20%
            const damage = enemy.GetMaxHealth() * 0.2;
            // 应用自定义伤害
            ApplyCustomDamage({
                victim: enemy, // 受害者
                attacker: this.hCaster, // 攻击者
                ability: this, // 伤害来源技能
                damage: damage, // 伤害值
                damage_type: DamageTypes.PHYSICAL, // 伤害类型：物理
                miss_flag: 1, // 未命中标志（此处设为1，具体效果取决于游戏设定）
            });
        }
    }
}

/**
 * @class modifier_creature_elite_9_path
 * @description 这个Modifier代表了实际存在于地面上的极冰之路。
 * 它负责创建视觉特效，并周期性地检测路径上的单位，为友军加速，为敌军减速。
 */
@registerModifier()
export class modifier_creature_elite_9_path extends BaseModifier {
    start: Vector; // 路径的起点坐标
    end: Vector; // 路径的终点坐标
    team: DotaTeam; // 施法者的队伍编号
    line_width: number; // 路径的宽度

    /**
     * Modifier被创建时调用。
     * 主要作用：
     * 1. 仅在服务器端执行初始化逻辑。
     * 2. 设置路径的起点、终点和宽度。
     * 3. 创建并设置极冰之路的粒子特效。
     * 4. 开启一个周期性计时器（IntervalThink）来检测路径上的单位。
     * @param params 从CreateModifierThinker传递过来的参数，包含终点坐标和持续时间。
     */
    OnCreated(params: any): void {
        // 确保以下逻辑只在服务器上运行
        if (!IsServer()) {
            return;
        }
        // 从技能中获取路径宽度
        this.line_width = this.GetAbility().GetSpecialValueFor('line_width');
        // 设置路径起点为父单位（即思考者）的当前位置
        this.start = this.GetParent().GetAbsOrigin();
        // 根据传入的参数设置路径终点
        this.end = Vector(params.x, params.y, this.start.z);
        // 记录施法者的队伍
        this.team = this.GetCaster().GetTeam();

        // 创建路径的粒子特效
        const cast_fx = ParticleManager.CreateParticle(
            'particles/econ/items/jakiro/jakiro_ti7_immortal_head/jakiro_ti7_immortal_head_ice_path_b.vpcf',
            ParticleAttachment.CUSTOMORIGIN,
            null
        );
        // 设置粒子特效的控制点0为路径起点
        ParticleManager.SetParticleControl(cast_fx, 0, this.start);
        // 设置粒子特效的控制点1为路径终点
        ParticleManager.SetParticleControl(cast_fx, 1, this.end);
        // 设置粒子特效的控制点2的x值为modifier的持续时间，用于控制特效的生命周期
        ParticleManager.SetParticleControl(cast_fx, 2, Vector(this.GetDuration(), 0, 0));
        // 将粒子特效添加到modifier上，这样当modifier销毁时，特效也会随之销毁
        this.AddParticle(cast_fx, false, false, -1, false, false);

        // 立即执行一次检测
        this.OnIntervalThink();
        // 开始周期性检测，每0.1秒执行一次OnIntervalThink
        this.StartIntervalThink(0.1);
    }

    /**
     * 周期性调用的函数。
     * 主要作用：
     * 1. 查找当前路径范围内的所有单位（友方和敌方）。
     * 2. 如果单位是友方，则为其添加加速buff。
     * 3. 如果单位是敌方，则为其添加减速debuff。
     */
    OnIntervalThink(): void {
        // 在路径上查找单位
        const line_unit = FindUnitsInLine(
            this.GetParent().GetTeam(), // 队伍
            this.start, // 起点
            this.end, // 终点
            null,
            this.line_width, // 宽度
            UnitTargetTeam.BOTH, // 目标队伍：双方
            UnitTargetType.BASIC + UnitTargetType.HERO, // 目标类型
            UnitTargetFlags.NONE
        );

        // 遍历找到的所有单位
        for (const unit of line_unit) {
            if (unit.GetTeamNumber() == this.team) {
                // 如果是友方单位，添加加速buff，持续0.5秒
                unit.AddNewModifier(this.GetCaster(), this.GetAbility(), 'modifier_creature_elite_9_buff', { duration: 0.5 });
            } else {
                // 如果是敌方单位，添加减速debuff，持续0.5秒
                unit.AddNewModifier(this.GetCaster(), this.GetAbility(), 'modifier_creature_elite_9_debuff', { duration: 0.5 });
            }
        }
    }

    /**
     * Modifier被销毁时调用。
     * 主要作用：
     * 1. 移除承载此modifier的思考者单位。
     */
    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        // 移除父单位（思考者），从而清理战场
        UTIL_Remove(this.GetParent());
    }
}

/**
 * @class modifier_creature_elite_9_buff
 * @description 为友方单位提供的加速效果。
 */
@registerModifier()
export class modifier_creature_elite_9_buff extends BaseModifier {
    /**
     * 声明此modifier会影响移动速度。
     * @returns {modifierfunction[]} 函数数组。
     */
    DeclareFunctions(): modifierfunction[] {
        return [ModifierFunction.MOVESPEED_BONUS_PERCENTAGE];
    }

    /**
     * 获取移动速度加成的百分比。
     * @returns {number} 返回25，即提供25%的移动速度加成。
     */
    GetModifierMoveSpeedBonus_Percentage(): number {
        return 25;
    }
}

/**
 * @class modifier_creature_elite_9_debuff
 * @description 为敌方单位提供的减速效果。
 */
@registerModifier()
export class modifier_creature_elite_9_debuff extends BaseModifier {
    buff_key = 'elite_9_debuff'; // 自定义属性的键名，用于唯一标识此debuff效果

    /**
     * Debuff被创建时调用。
     * 主要作用：
     * 1. 使用自定义属性系统给目标单位施加一个-50%的移动速度惩罚。
     * @param params 附加参数（此处未使用）。
     */
    OnCreated(params: object): void {
        if (!IsServer()) {
            return;
        }
        // 使用自定义属性系统来设置减速效果
        GameRules.CustomAttribute.SetAttributeInKey(this.GetParent(), this.buff_key, {
            MoveSpeed: {
                BasePercent: -50, // 移动速度基础百分比降低50%
            },
        });
    }

    /**
     * 周期性调用的函数（当前为空，未使用）。
     */
    OnIntervalThink(): void {}

    /**
     * Debuff被销毁时调用。
     * 主要作用：
     * 1. 移除之前通过自定义属性系统施加的减速效果。
     */
    OnDestroy(): void {
        if (!IsServer()) {
            return;
        }
        // 删除对应的自定义属性，从而移除减速效果
        GameRules.CustomAttribute.DelAttributeInKey(this.GetParent(), this.buff_key);
    }
}