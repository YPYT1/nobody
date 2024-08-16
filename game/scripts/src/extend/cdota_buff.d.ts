declare interface CDOTA_Buff {

    damage_type: DamageTypes;
    element_type: ElementTypes;
    caster: CDOTA_BaseNPC;
    parent: CDOTA_BaseNPC;

    /** `该技能加成` */
    SelfAbilityMul: number;
    /** `伤害加成` 后续会转为百分比小数  */
    DamageBonusMul: number;
    /** `最终伤害` */
    FinalDamageMul: number;
    /**  技能增强*/
    AbilityImproved: number;
    /** 对应元素伤害百分比*/
    ElementDmgMul: number;
    /** 近战 */
    MeleeDmgPct: number;
    /** 远程增伤 / */
    RangedDmgPct: number;

    // /** 符文击杀事件 */
    // Rune_OnKilled(hTarget: CDOTA_BaseNPC): void;
    // /** */
    // Rune_InputAbilityValues(rune: string, rune_input: AbilityValuesProps): void;
    // AM2_OnDeath(data?: any);

    // /** 吞噬效果 */
    // is_devour:boolean;
}