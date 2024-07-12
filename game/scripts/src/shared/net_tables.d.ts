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
        [player_id: string]: MinorAbilityUpgradesProps;
    }
    //天赋信息
    hero_talent : {
        [player_id : string] : CGEDPlayerTalentSkillClientList
    }

}

interface UnitAttributeNT {
    table: CustomAttributeTableType;
    value: CustomAttributeValueType;
    show: CustomAttributeShowType;
}