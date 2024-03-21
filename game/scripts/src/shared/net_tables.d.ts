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
        [entity: string]: {
            table: CustomAttributeTableType;
            value: CustomAttributeValueType;

        };
    }

    unit_special_value: {
        [player_id: string]: AbilitySpecialValueProps;
    }

}
