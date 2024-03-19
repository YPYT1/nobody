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
    damage_flags?: DamageFlag;
    /** 禁止暴击 */
    disable_critical?: boolean;
    /** 必定暴击 */
    must_crit?: boolean;
    ability?: CDOTABaseAbility;
    overhead_alert?: DOTA_OVERHEAD_ALERT;
    /** 额外伤害`整数` 后续会转为百分比小数  */
    bonus_pct?: number;
    /** 元素 */
    element_type?: CElementType;
    /** 是否为固定值,不吃任何加成 */
    fixed?: boolean;
}
