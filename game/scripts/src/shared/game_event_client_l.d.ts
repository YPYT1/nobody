
declare interface CustomGameEventDeclarations {

    TreasureSystem_GetShopsData: {
        data: PlayerUpgradeSelectRetData;
    };

    RuneSystem_GetRuneSelectData: {
        data: PlayerRuneSelectRetData;
    };
    /**
     * 选择地图初始化数据
     */
    MapChapter_GetDifficultyMax: {
        data: {
            game_select_phase: number, //0处于营地 ----选择地图---> 1 确认了地图难度 ----选择英雄---> 2 确认了英雄 ----开始刷怪---> 3游戏开始了 ----返回营地---> 0处于营地
            select_map: string, //当前选择的章节
            select_difficulty: string, //当前选中的难度
            map_difficulty: UserMapSelectDifficulty[];
            level_difficulty: string[]; //玩家所通关的难度
        };
    };

     /**
     * 主机选择难度后返回
     */
    MapChapter_SelectDifficulty: {
        data: {
            game_select_phase: number, //0处于营地 ----选择地图---> 1 确认了地图难度 ----选择英雄---> 2 确认了英雄 ----开始---> 3游戏开始了 ----结束---> 0处于营地
            select_map: string, //已选地图编号
            select_difficulty: string, //已选地图难度
        };
    };
    /**
     * 玩家选择所有英雄列表
     */
    MapChapter_GetPlayerSelectHeroList : {
        data: {
            game_select_phase: number, //0处于营地 ----选择地图---> 1 确认了地图难度 ----选择英雄---> 2 确认了英雄 ----开始---> 3游戏开始了 ----结束---> 0处于营地
            hero_ids : MapSelectHeroList[],
        };
    }
    /**
     * 玩家可选英雄列表
     */
    MapChapter_GetPlayerHeroList : {
        data: {
            game_select_phase: number, //0处于营地 ----选择地图---> 1 确认了地图难度 ----选择英雄---> 2 确认了英雄 ----开始---> 3游戏开始了 ----结束---> 0处于营地
            hero_id : number[],
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