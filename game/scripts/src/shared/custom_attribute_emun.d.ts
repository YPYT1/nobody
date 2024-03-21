
declare type AttributeMainKey = | "AttackDamage" //攻击力
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


declare type AbilitySpecialTypes = "Base" | "Percent";

interface AbilitySpecialObjectProps {
    [ability: string]: {
        [special_key: string]: {
            base_value: number;
            mul_list: number[];
            amount: number;
        }
    }
}

interface AbilitySpecialValueProps {
    [ability: string]: {
        [special_key: string]: {
            /** 额外伤害值 */
            base_value: number;
            /** 伤害倍率 百分比表示 */
            mul_value: number;
            cache_value?: number;
        }
    }
}

// declare interface AbilitySpecialValueProps {
//     [special_name: string]: {
//         /** 加算 */
//         add_value: number;
//         /** 乘算 */
//         mul_value: number;
//         /** 缓存值 */
//         cache_value: number;
//     };
// }
