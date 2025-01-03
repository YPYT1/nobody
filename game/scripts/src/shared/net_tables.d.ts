declare interface CustomNetTableDeclarations {

    // 游戏配置
    game_setting: {
        game_mode: {
            difficulty: string,
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
    hero_talent: {
        [player_id: string]: CGEDPlayerTalentSkillClientList
    }

    custom_ability_types: {
        [ability_entity: string]: {
            skv_type: {
                [key in CustomHeroAbilityTypes]?: boolean
            },
            element_type: ElementTypes[]
        }
    }
}

interface UnitAttributeNT {
    table: CustomAttributeTableType;
    value: CustomAttributeValueType;
    // show: CustomAttributeShowType;
}