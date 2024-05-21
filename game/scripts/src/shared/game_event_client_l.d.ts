
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

     /**
     * 获取神秘商店信息
     */
     MysticalShopSystem_GetShopData: {
        data: {
            shop_field_list: ShopFieldList[], //玩家商店信息
            player_refresh_data: PlayerRefreshData; //玩家刷新信息
        };
    };

    /**
     * 获取神秘商店准备状态等
     */
    MysticalShopSystem_GetShopState: {
        data: {
            shop_state_data: ShopStateData[], //每个玩家的准备状态
            start_buy_state: number ; //是否显示商店
            countdown_timer : number ; //倒计时时间
        };
    };
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

declare interface ShopFieldList {
    key : string, //物品key
    soul : number, // 需要灵魂
    is_discount: number, //折扣 1为折扣 0为没打折
    discount_rate: number, // 80%  20% 10 % 1% ----不低于1%
    rarity: number, // 稀有度 1 2 3 4 5
    is_buy: number, // 0 未购买 1 已购买
    is_lock : number , //是否锁定
}
//商店刷新信息
declare interface PlayerRefreshData {
    refresh_count: number, //刷新次数
    soul: number, //刷新灵魂
}
//商店状态信息
declare interface ShopStateData {
    is_ready : number, // 是否准备好了 0 未准备好 1准备好了
}
