
declare type AttributeMainKey = "AttackDamage"
    | "AttackSpeed"
    | "AttackRange"
    | "AttackRate"
    | "PhyicalArmor"
    | "MaxHealth"
    | "HealthRegen"
    | "MaxMana"
    | "ManaRegen"
    | "MoveSpeed"
    | "AbilityHaste"
    | "CriticalChance"
    | "CriticalDamage"
    | "PickItemRadius"
    | "DamageBonusMul"
    | "FinalDamageMul"
    | "MeleeDmgPct"
    | "RangedDmgPct"
    | "BurningDmg"
    | "BurningDuration"
    | "FireDamageBonus"
    | "IceDamageBonus"
    | "ThunderDamageBonus"
    | "WindDamageBonus"
    | "LightDamageBonus"
    | "DarkDamageBonus"
    | "KillRestoreHp"
    | "KillRestoreMp"
    | "RestoreIncrease"
    | "AllElementDamageBonus"
    | "AllElementPent"
    | "FirePent"
    | "IcePent"
    | "ThunderPent"
    | "WindPent"
    | "AllElementResist"
    | "FireResist"
    | "IceResist"
    | "ThunderResist"
    | "WindResist"
    | "FixedDamage"
    | "FixedDamageReduction"
    ;





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
    | "MulRegion"
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

declare type MulCustomAttributeTableType = {
    [key1 in AttributeMainKey]?: { [key: string]: number }
}

declare type CustomAttributeConversionType = {
    [key1 in AttributeMainKey]?: {
        [key2 in AttributeMainKey]?: {
            [key3 in AttributeSubKey]?: number
        }
    }
}


declare type OverrideSpecialKeyTypes = "skv_missile_count"
    | "skv_aoe_radius"
    | "skv_dot_duration"
    | "skv_dot_interval"
    | "skv_grow_income"
    | "skv_surround_speed"
    | "skv_surround_duration"
    | "skv_surround_count"
    | "skv_ring_width"
    | "skv_ring_interval"
    | "skv_bounce_count"
    | "skv_bounce_increase"
    | "skv_target_count"
    | "skv_resource_percent"
    | "skv_buff_increase"
    | "skv_orb_chance"
    | "skv_orb_count"
    | "skv_summon_duration"
    | "skv_summon_strength"


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
        /** 结果  = (原始 + 基础) * 倍率 * 修正 */
        // result_value: number;
        cache_value?: number;
    }
}

interface MinorAbilityUpgradesProps {
    [ability_name: string]: OverrideSpecialValueProps
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
    ;

interface PlayEffectProps {
    /** 目标 */
    hTarget?: CDOTA_BaseNPC,
    /** 坐标点 */
    vPos?: Vector,
    /** 值 */
    value?: number,
    /** 伤害 */
    damage?: number,
    /** 触发额外效果 */
    trigger?: boolean;
    /** 类型编号 */
    type?: number;
    /** 额外倍率 */
    bonus_pct?: number;
    /** 临时单位组 */
    unit_list?: CDOTA_BaseNPC[]
}