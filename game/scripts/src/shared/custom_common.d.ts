
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

    /** 主技能 作为Arms技能,而非其他类型,符文,特效*/
    is_primary?: boolean;
    /** 特效伤害 为True时部分效果不会触发避免套娃 */
    special_effect?: boolean;
    /** 伤害来源点 */
    damage_vect?: Vector;
    /** 暴击判定 -1必定不暴击 0默认 1必定暴击  */
    critical_flasg?: -1 | 0 | 1;
    /** 额外伤害`整数` 后续会转为百分比小数  */
    extra_percent?: number;
    /** 元素类型 */
    element_type?: ElementTypes;
    /** 技能类型 */
    ability_category?: ArmsAbilityCategory;
    /** 是否为固定值,不吃任何加成 */
    fixed?: boolean;
    /** 额外暴击率 */
    crit_chance?: number;
    /** 额外暴击伤害 */
    crit_bonus_dmg?: number;
}
