declare interface CDOTA_BaseNPC extends CBaseFlex {
    isSpawned: boolean;
    last_attribute_update: number;
    /** 自定义属性总值 */
    custom_attribute_value: CustomAttributeValueType;
    /** 自定义属性表 */
    custom_attribute_table: CustomAttributeTableType;
    /** 自定义属性表 */
    custom_attribute_key_table: { [key: string]: CustomAttributeTableType };
    /** 属性转换 */
    custom_attribute_conversion: CustomAttributeConversionType;

    // AbilityUpgrades: AbilitySpecialValueProps;
    /** 肉鸽专用词条词条 */
    OverrideSpecial: OverrideSpecialValueProps;

    /** 所有技能的内置冷却相应 */
    CDResp: { [key: string]: number }

    drop_resource_type: PlayerResourceTyps;
    drop_resource_amount: number;

    buff_queue: string[];

    summoned_damage:number;
    //KillOnAnyList: CDOTABaseAbility[];
    KillOnMdfList: CDOTA_Buff[];
    //KillOnAbilityList: CDOTABaseAbility[];

    ArmsExecutedList: CDOTABaseAbility[];

    OnAttackList: CDOTABaseAbility[];
    OnKillList: CDOTABaseAbility[];
}