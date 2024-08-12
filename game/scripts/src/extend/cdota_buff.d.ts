declare interface CDOTA_Buff {

    damage_type: DamageTypes;
    element_type: ElementTypes;
    caster:CDOTA_BaseNPC;
    parent:CDOTA_BaseNPC;
    
    /** 符文击杀事件 */
    Rune_OnKilled(hTarget: CDOTA_BaseNPC):void;
    /** */
    Rune_InputAbilityValues(rune: string, rune_input: AbilityValuesProps):void;
    // AM2_OnDeath(data?: any);

    // /** 吞噬效果 */
    // is_devour:boolean;
}