declare interface CDOTA_BaseNPC extends CBaseFlex {
    isSpawned: boolean;
    last_attribute_update: number;
    /** 自定义属性总值 */
    custom_attribute_value: CustomAttributeValueType;
    /** 显示属性的白绿字 */
    custom_attribute_show: CustomAttributeShowType;
    /** 自定义属性表 */
    custom_attribute_table: CustomAttributeTableType;
    /** 乘算属性表 */
    custom_mul_attribute: MulCustomAttributeTableType;
    /** 自定义属性表 乘算 */
    // custom_attribute_table_mul: { [key: string]: MulCustomAttributeTableType };
    /** 自定义属性表 */
    custom_attribute_key_table: { [key: string]: CustomAttributeTableType };
    /** 属性转换 */
    custom_attribute_conversion: CustomAttributeConversionType;
    /** 减伤百分比列表 */
    ReductionPct: { [key: string]: number; };
    /** 减伤百分比列表第二层 */
    ReductionPct2: { [key: string]: number; };
    /** 减伤百分比列表第三层 */
    ReductionPct3: { [key: string]: number; };
    
    /** 减伤最终结果 */
    ReductionResult: number;
    /** 第二层减伤 */
    ReductionResult2: number;
    /** 第三层减伤 */
    ReductionResult3: number;
    
    // AbilityUpgrades: AbilitySpecialValueProps;
    /** 肉鸽专用词条词条 */
    // OverrideSpecial: MinorAbilityUpgradesProps;
    MinorAbilityUpgrades:MinorAbilityUpgradesProps;
    
    is_picking: boolean;
    /** 所有技能的内置冷却相应 */
    CDResp: { [key: string]: number }

    drop_resource_type: PlayerResourceTyps;
    drop_resource_amount: number;

    buff_queue: string[];

    summoned_damage: number;
    //KillOnAnyList: CDOTABaseAbility[];
    KillOnMdfList: CDOTA_Buff[];
    //KillOnAbilityList: CDOTABaseAbility[];

    ArmsExecutedList: CDOTABaseAbility[];

    OnAttackList: CDOTABaseAbility[];
    OnKillList: CDOTABaseAbility[];

    /** 法球状态 */
    OrbStatus:boolean;
    in_process_attack:boolean;
    
    //英雄定时器
    CustomVariables: { [key: string]: number; };

    //天赋分配情况
    hero_talent : { [key : string ] : number };
    //符文被动
    rune_passive_type : { [key : string ] : number };

    rune_level_index: { [key in RuneName]?: number }; //值是技能下标志
}

