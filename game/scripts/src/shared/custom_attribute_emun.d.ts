
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
    | "AbilityCooldown"
    | "AbilityCooldown2"
    | "CriticalChance"
    | "CriticalDamage"
    | "PickItemRadius"
    | "DamageBonusMul"
    | "DamageServerMul"
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
    | "DmgReductionFixed"
    | "DmgReductionPct"
    | "SingleExpeIncrease"
    | "TeamExpeIncrease"
    | "SacredEquipSkillDmg"
    | "ManaCostRate"
    | "AbilityImproved"
    | "EvasionProb"
    | "BasicAbilityDmg"
    | "CreatureDmgLeader"
    | "CreatureDmgNormal"
    | "VisionRange"

    ;
declare type EnemyAttributeKey = "AllElementResist"
    | "FireResist"
    | "IceResist"
    | "ThunderResist"
    | "WindResist"
    | "FixedDamage"
    | "DmgReductionFixed"
    | "CriticalChanceResist"
    | "CriticalDamageReduction"
    | "DmgReductionPct"
    | "AbilityHaste"
    | "DamageBonusMul"
    | "RestoreIncrease"
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
    | "Limit"
    | "Last" // 是否为最低值
    ;

/** 敌人属性 */
declare type EnemyAttributeValueType = {
    [key1 in EnemyAttributeKey]?: {
        [key2 in AttributeSubKey]?: number
    };
}

declare type EnemyAttributeTableType = {
    [key1 in EnemyAttributeKey]?: {
        [key2 in AttributeSubKey]?: number
    }
}


/** 英雄属性 */
declare type CustomAttributeValueType = {
    [key1 in AttributeMainKey | EnemyAttributeKey]?: number;
}

declare type CustomAttributeShowType = {
    [key1 in AttributeMainKey]?: Record<number, number>;
}

/** 通用属性表 */
declare type CustomAttributeTableType = {
    [key1 in AttributeMainKey | EnemyAttributeKey]?: {
        [key2 in AttributeSubKey]?: number
    }
}

declare type MulCustomAttributeTableType = {
    [key1 in AttributeMainKey | EnemyAttributeKey]?: { [key: string]: number }
}



declare type CustomAttributeConversionType = {
    [key1 in AttributeMainKey]?: {
        [key2 in AttributeMainKey]?: {
            [key3 in AttributeSubKey]?: number
        }
    }
}

declare type CustomHeroAbilityTypes = "Null"
    | "Summon"
    | "Ring"
    | "Surround"
    | "Aoe"
    | "Bounce"
    | "Missile"
    | "Targeting"
    | "Dot"
    | "Orb"
    | "Resource"
    | "Growth"
    | "Buff"
    | "All"

declare type OverrideSpecialKeyTypes = "skv_missile_count"
    | "skv_missile_speed"
    | "skv_missile_distance"
    | "skv_missile_dmg"
    | "skv_aoe_radius"
    | "skv_aoe_chance"
    | "skv_aoe_correct"
    | "skv_aoe_dmg"
    | "skv_dot_duration"
    | "skv_dot_interval"
    | "skv_dot_dmg"
    | "skv_grow_value"
    | "skv_surround_speed"
    | "skv_surround_dmg"
    | "skv_surround_count"
    | "skv_surround_distance"
    | "skv_surround_dmg"
    | "skv_ring_width"
    | "skv_ring_interval"
    | "skv_ring_range"
    | "skv_ring_width"
    | "skv_ring_dmg"
    | "skv_bounce_count"
    | "skv_bounce_increase"
    | "skv_bounce_reduction"
    | "skv_bounce_dmg"
    | "skv_targeting_count"
    | "skv_targeting_dmg"
    | "skv_targeting_multiple1"
    | "skv_targeting_multiple2"
    | "skv_targeting_multiple3"
    | "skv_resource_income"
    | "skv_orb_chance"
    | "skv_orb_required"
    | "skv_orb_dmg"
    | "skv_summon_duration"
    | "skv_summon_strength"
    | "skv_summon_haste"
    | "skv_summon_dmg"
    | "skv_growth_bonus"
    | "skv_buff_increase"
    | "skv_all_haste"
    | "skv_all_dmg"
    | "skv_all_manacost"

    ;


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


/**
 * 技能类型修正类型,对应支持的修改值类型 `基础` `百分比加成` `独立乘算` `修正值`
 */
interface SpecialvalueOfTableProps {

    Missile: {
        skv_missile_count: { Base, Percent, Multiple, Correct };
        skv_missile_speed: number;
        skv_missile_distance: number;
        skv_missile_dmg: number;
    };
    Aoe: {
        skv_aoe_radius: number;
        skv_aoe_chance: number; // 多重概率
        skv_aoe_dmg: number;
        skv_aoe_correct: number; // AOE伤害独立乘区
    };
    Targeting: {
        skv_targeting_count: number;
        skv_targeting_dmg: number;
        skv_targeting_multiple1: number;
        skv_targeting_multiple2: number;
        skv_targeting_multiple3: number;
    };
    Dot: {
        skv_dot_duration: number;
        skv_dot_interval: number;
        skv_dot_dmg: number;

    };
    Growth: {
        skv_growth_bonus: number;
    };
    Surround: {
        skv_surround_speed: number;
        skv_surround_dmg: number;
        skv_surround_count: number;
        skv_surround_distance: number;
    };
    Buff: {
        skv_buff_increase: number;
    };
    Resource: {
        skv_resource_income: number;
    };
    Summon: {
        skv_summon_duration: number;
        skv_summon_strength: number;
        skv_summon_haste: number;
        skv_summon_dmg: number;
    };
    Orb: {
        skv_orb_chance: number;
        skv_orb_required: number;
        skv_orb_dmg: number;
    };
    Ring: {
        skv_ring_interval: number;
        skv_ring_range: number;
        skv_ring_width: number;
        skv_ring_dmg: number;
    };
    Bounce: {
        skv_bounce_count: number;
        skv_bounce_increase: number;
        skv_bounce_reduction: number;
        skv_bounce_dmg: number;
    };
}


interface SpecialvalueOfTableSpecialProps {

    Aoe: {
        skv_targeting_multiple: {
            skv_targeting_multiple1: number;
            skv_targeting_multiple2: number;
            skv_targeting_multiple3: number;
        }
    }
}

declare type PopupsType = "Damage" | "Miss" | "Heal"

declare type PlayerAttributeTypes = "drop_double_exp"
    | "drop_double_soul"
    | "kill_bonus_soul"