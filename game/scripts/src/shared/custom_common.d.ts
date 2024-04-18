
declare interface AbilityValuesProps { [key: string]: string | number; }
declare interface KeyValueProps { [key: string]: number }

/**
 * 数据驱动技能类参数
 */
declare interface CGDatadrivenProps {

    unit: CDOTA_BaseNPC;
    target: CDOTA_BaseNPC;
    Target: CDOTA_BaseNPC;
    attacker: CDOTA_BaseNPC;
    ability: CDOTA_Ability_DataDriven;
    event_ability?: CDOTABaseAbility;
    caster: CDOTA_BaseNPC;
    UnitName?: string;
    Damage?: number;
    caster_entindex: EntityIndex;
    target_entities?: CDOTA_BaseNPC[];
    target_points?: Vector[];
    modifier: string;

    // element?: CElementType;
}

/** 自定义造成伤害 */
declare interface ApplyCustomDamageOptions {
    victim: CDOTA_BaseNPC;
    attacker: CDOTA_BaseNPC;
    damage: number;
    damage_type: DAMAGE_TYPES;
    damage_flags?: DOTADamageFlag_t;
    ability?: CDOTABaseAbility;

    /** 伤害来源点 */
    damage_vect?: Vector;
    /** 禁止暴击 */
    disable_critical?: boolean;
    /** 必定暴击 */
    must_crit?: boolean;
    /** 额外伤害`整数` 后续会转为百分比小数  */
    extra_percent?: number;
    /** 元素 */
    element_type?: ElementTypeEnum;
    /** 技能类型 */
    ability_category?: ArmsAbilityCategory;
    /** 是否为固定值,不吃任何加成 */
    fixed?: boolean;
}
