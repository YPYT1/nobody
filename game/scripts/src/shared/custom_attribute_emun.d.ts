
declare type AttributeMainKey = "AttackDamage"
    | "AttackSpeed"
    | "AttackRange"
    | "AttackRate"
    | "PhyicalArmor"
    | "HealthIncome"
    | "StateResistance"
    | "FixedDamageBonus"
    | "FixedDamageReduction"
    | "HealthPoints"
    | "HealthRegen"
    | "ManaPoints"
    | "ManaRegen"
    | "MoveSpeed"
    | "AbilityHaste"
    | "FinalDamageMul"
    | "CritProbAll"
    | "CritDmgAll"
    | "CritProbPhyical"
    | "CritDmgPhyical"
    | "DamageMulPhyical"
    | "Special_BurnDuration"
    | "Special_PalsyDuration"
    | "Special_IceMoveslow"
    | "PickItemRadius"
    | "Fire_DamageMul"
    | "Fire_CritProb"
    | "Fire_CritDmg"
    | "Fire_ResistPenet"
    | "Fire_Haste"
    | "Fire_Armor"
    | "Ice_DamageMul"
    | "Ice_CritProb"
    | "Ice_CritDmg"
    | "Ice_ResistPenet"
    | "Ice_Haste"
    | "Ice_Armor"
    | "Thunder_DamageMul"
    | "Thunder_CritProb"
    | "Thunder_CritDmg"
    | "Thunder_ResistPenet"
    | "Thunder_Haste"
    | "Thunder_Armor"
    | "Wind_DamageMul"
    | "Wind_CritProb"
    | "Wind_CritDmg"
    | "Wind_ResistPenet"
    | "Wind_Haste"
    | "Wind_Armor"
    | "Light_DamageMul"
    | "Light_CritProb"
    | "Light_CritDmg"
    | "Light_ResistPenet"
    | "Light_Haste"
    | "Light_Armor"
    | "Dark_DamageMul"
    | "Dark_CritProb"
    | "Dark_CritDmg"
    | "Dark_ResistPenet"
    | "Dark_Haste"
    | "Dark_Armor"





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
    [key1 in AttributeMainKey]?: number;
}

declare type CustomAttributeShowType = {
    [key1 in AttributeMainKey]?: Record<number, number>;
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


declare type OverrideSpecialKeyTypes = "skv_count"
    | "skv_radius"
    | "skv_duration"
    | "skv_growth"
    | "skv_damage"
    | "skv_financing"
    | "skv_defense"
    | "skv_summoned_duration"
    | "skv_income"
    | "skv_haste"
    | "skv_fire"
    | "skv_thunder"
    | "skv_ice"
    | "skv_wind"
    | "skv_light"
    | "skv_dark"

declare type OverrideSpecialBonusTypes = "Base" | "Percent" | "Multiple" | "Correct";


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
        /** 百分比加成 */
        percent_value: number;
        /** 乘区倍率 */
        mul_value: number;
        /** 修正值. 最终乘区 默认为0即100% 最小[-100%]*/
        correct_value: number;
        /** 结果 (基础*倍率)*修正 */
        // result_value: number;
        cache_value?: number;
    }
}

/** 资源类型 */
type PlayerResourceTyps = "Gold" | "Soul" | "Kills" | "TeamExp" | "SingleExp";

/** 技能类型 */
declare type ArmsTypeCategory = "Aoe" // 范围
    | "Buff" // 强化
    | "Dot" // 持续
    | "Grow" // 成长
    | "Missile" // 弹道
    | "Orb" // 法球
    | "Resource" // 理财
    | "Summon" // 召唤
    | "Surround" // 环绕