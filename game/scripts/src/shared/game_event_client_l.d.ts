
declare interface CustomGameEventDeclarations {

    TreasureSystem_GetShopsData: {
        data: PlayerUpgradeSelectRetData;
    };
    //技能选择功能
    NewArmsEvolution_GetArmssSelectData : {
        data: PlayerUpgradeSelectRetData;
    }
    //获取技能点
    NewArmsEvolution_GetEvolutionPoint : {
        data : {
            EvolutionPoint : number //技能点
        }
    }
    NewArmsEvolution_GetArmssElementBondDateList : {
        data : ElementBondDateList
    }
    //选择符文数据
    RuneSystem_GetRuneSelectData: {
        data: PlayerRuneSelectRetData;
    };
    //符文数据
    RuneSystem_GetRuneData : {
        data :  PlayerRuneDataProps 
    }
    //获得随机符文的信息 (用于播放动画) 
    RuneSystem_GetRuneRandomData : {
        data : string 
    }
    /**
     * 选择地图初始化数据
     */
    MapChapter_GetDifficultyMax: {
        data: {
            map_difficulty: UserMapSelectDifficulty[];
            level_difficulty: string[]; //玩家所通关的难度
        };
    };

     /**
     * 主机选择难度后返回
     */
    MapChapter_SelectDifficulty: {
        data: {
            select_map: string, //已选地图编号
            select_difficulty: string, //已选地图难度
        };
    };
    /**
     * 玩家选择所有英雄列表
     */
    MapChapter_GetPlayerSelectHeroList : {
        data: {
            hero_ids : MapSelectHeroList[],
        };
    }
    /**
     * 玩家可选英雄列表
     */
    MapChapter_GetPlayerHeroList : {
        data: {
            hero_id : number[],
        };
    }

    MapChapter_GetGameSelectPhase : {
        data: {
            game_select_phase: number, //0处于营地 ----选择地图---> 1 确认了地图难度 ----选择英雄---> 2 确认了英雄 ----开始---> 3游戏开始了 ----结束---> 0处于营地
        };
    }
}


declare interface MapSelectHeroList {
    hero_id : number,
    state : number, //是否确认 0 未确认 1 确认
}


declare interface UserMapSelectDifficulty { //地图详细信息
    is_unlock: number, // 是否锁定
    user_difficulty: number, // 玩家最高可选难度
    difficulty_max: number, // 地图最高难度
    chapter_key: string, //地图编号 m1 m2 
}



declare interface ElementBondDate { //羁绊信息
    count : number,//羁绊数量
    type : number , //羁绊类型
}
declare interface ElementBondDateList { //羁绊信息
    Element: { //元素数据
        [key in ElementTypeEnum]: number
    };
}

