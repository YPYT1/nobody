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

}