
declare type AttributeMainKey = "AttackDamage" //攻击力
    | "AttackSpeed" //攻击速度
    | "AttackRange" //攻击范围
    | "AttackRate" //攻击间隔
    | "ArmorCommon" //护甲值
    | "ArmorElementFire" //火元素护甲
    | "ArmorElementWater" //水元素护甲
    | "ArmorElementEarth" //土元素护甲
    | "ArmorElementWind" //风元素护甲
    | "ArmorElementLight" //光元素护甲
    | "ArmorElementDark" //暗元素护甲
    | "StateResistance" //状态抗性
    | "FixedDamageBonus" //固定增伤
    | "FixedDamageReduction" //固定减伤
    | "HealthPoints" //生命值
    | "HealthRegen" //生命恢复
    | "ManaPoints" //魔法值
    | "ManaRegen" //魔法恢复
    | "MoveSpeed" //移动速度
    | "AbilityHaste" //技能急速
    | "FinalDamageMul" //%最终伤害
    | "DamageMulPhyical" //%物理伤害
    | "DamageMulFire" //%火元素伤害
    | "DamageMulWater" //%水元素伤害
    | "DamageMulEarth" //%土元素伤害
    | "DamageMulWind" //%风元素伤害
    | "DamageMulLight" //%光元素伤害
    | "DamageMulDark" //%暗元素伤害
    | "CritProbAll" //%全爆击
    | "CritDmgAll" //%全爆伤
    | "CritProbPhyical" //物理爆击
    | "CritDmgPhyical" //物理爆伤
    | "CritProbFire" //火元素爆击
    | "CritDmgFire" //火元素爆伤
    | "CritProbWater" //水元素爆击
    | "CritDmgWater" //水元素爆伤
    | "CritProbEarth" //土元素爆击
    | "CritDmgEarth" //土元素爆伤
    | "CritProbWind" //风元素爆击
    | "CritDmgWind" //风元素爆伤
    | "CritProbLight" //光元素爆击
    | "CritDmgLight" //光元素爆伤
    | "CritProbDark" //暗元素爆击
    | "CritDmgDark" //暗元素爆伤
    | "PickItemRadius" //拾取范围




/** 自定义属性子类 */
declare type AttributeSubKey = "Base"
    | "Bonus"
    | "Fixed"
    | "BasePercent"
    | "BonusPercent"
    | "TotalPercent"
    | "PreLvBase"
    | "PreLvBonus"
    | "PreLvFixed"
    ;

declare type CustomAttributeValueType = {
    [key1 in AttributeMainKey]?: number
}

declare type CustomAttributeTableType = {
    [key1 in AttributeMainKey]?: {
        [key2 in AttributeSubKey]?: number
    }
}

declare type CustomAttributeConversionType = {
    [key1 in AttributeMainKey]?: {
        [key2 in AttributeMainKey]?: {
            [key3 in AttributeSubKey]?: number
        }
    }
}


declare type OverrideSpecialKeyTypes = "projectile_speed"
    | "bounce_count"
    | "projectile_count"
    | "aoe_radius"
    | "damage_interval_cut"
    | "cooldown_cut"
    | "summoned_duration"
    | "summoned_damage"
    | "buff_duration"
    | "debuff_duration"
    | "shield_amplify"
    | "health_amplify"
    | "extra_count"

declare type OverrideSpecialBonusTypes = "Base" | "Percent" | "Correct";


interface OverrideSpecialObjectProps {
    [special_key: string]: {
        // base_value: number;
        mul_list: number[];
    }
}

interface OverrideSpecialValueProps {
    [special_key: string]: {
        /** 基础值 */
        base_value: number;
        /** 倍率 */
        mul_value: number;
        /** 修正值.默认为0即100% 最小[-100%]*/
        correct_value: number;
        /** 结果 (基础*倍率)*修正 */
        // result_value: number;
        cache_value?: number;
    }
}

/** 资源类型 */
type PlayerResourceTyps = "Gold" | "Soul" | "Kills" | "TeamExp" | "SingleExp";

/** 物品类型 */
type ArmsItemCategory = "book" // 书籍
    | "strengthen" // 强化
    | "zhaohuan"// 召唤
    | "resource"// 理财
    | "scavenger" // 拾荒
    | "spell"// 咒术
    | "projectile"//投射
    | "growth"//成长
    | "consume"//消耗
    | "aoe"//范围
    | "health"//治疗
    | "orb"//法球
    | "bounce"//弹射