declare interface CustomNetTableDeclarations {

    // 游戏配置
    game_setting: {
        game_mode: {
            difficulty: number,
            mode: number,
        },
    }

    /** 单位属性 */
    unit_attribute: {
        [entity: string]: UnitAttributeNT;
    }

    unit_special_value: {
        [player_id: string]: OverrideSpecialValueProps;
    }

}

interface UnitAttributeNT {
    table: CustomAttributeTableType;
    value: CustomAttributeValueType;
    show: CustomAttributeShowType;
}