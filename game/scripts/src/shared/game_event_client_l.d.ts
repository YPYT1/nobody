
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
        data : ElementBondDateList;
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
            map_difficulty: { [key : string ] : UserMapSelectDifficulty}; //通关信息
            level_difficulty: string[]; //玩家所    通关的难度 --弃用
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
     * 新玩家状态
     */
    MapChapter_GetNewPlayerStatus : {
        data: {
            status : number, //状态
        };
    }
    /**
     * 获取难度信息
     */
    MapChapter_GetDifficulty : {
        data: {
            select_map: string, //已选地图编号
            select_difficulty: string, //已选地图难度
            time : number, //倒计时
        };
    }
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
            hero_id : MapSelectHeroData[],  
            time : number ,//选择倒计时
        };
    }

    /**
     * 玩家投票信息
     */
    MapChapter_GetPlayerVoteData : {
        data : {
            vote_data : MapVote,
        }
    }
    /**
     * 地图状态
     */
    MapChapter_GetGameSelectPhase : {
        data: {
            game_select_phase: number, //0处于营地 ----选择地图---> 1 确认了地图难度 ----选择英雄---> 2 确认了英雄 ----开始---> 3正常游戏开始了 ---过程--> 4正常游戏流程结束 -> 999最终流程  ----返回---> 0处于营地
        };
    }
    /**
     * 游戏次数
     */
    MapChapter_NewPlay : {
        data: {
            count : number,  //游戏次数
            extend : {} , //扩展参数
        };
    }

     /**
     * 获取神秘商店信息
     */
     MysticalShopSystem_GetShopData: {
        data: {
            shop_field_list: ShopFieldList[], //玩家商店信息
            player_refresh_data: PlayerRefreshData; //玩家刷新信息
            player_vip_status : number ; //玩家vip状态 0 不是 1是
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
    /**
     * 神秘商店购买流程
     */
    MysticalShopSystem_GetPlayerShopBuyData : {
        data : {
            player_shop_buy_data : { [key : string ] : number }
        }
    }
    /**
     *  神秘商店
     */
    
    //服务器相关
    /**
     * 游戏激活状态
     */
    ServiceInterface_GetGameActivate: {
        data: {
            Activate: number, //激活状态 0 未激活 1已激活
            Msg?: string,
        };
    };

    //玩家生命数
    GameInformation_GetPlayerLifeData : {
        data: {
            player_life : number
        }
    }

    GameInformation_GetPlayerDieData : {
        data: {
            time : number[]
        }
    }
    //局内游戏时间
    GameInformation_GetPlayGameHeadData : {
        data : {
            time : number , 
            difficulty : string ,
        }
    }

    /**
     * 天赋数据
     */
    HeroTalentSystem_GetHeroTalentListData: {
        data: {
            hero_talent_list: CGEDPlayerTalentSkillClientList,
            talent_points: number,
            talent_use_count: number,
        };
    };

    /**
     * 天赋数据 重置后的英雄
     */
    HeroTalentSystem_ResetHeroTalent: {
        data: {
            hero_name : string,
        };
    };
    
    /**
     * 获取通关后存档数据
     */
    ArchiveService_GetPlayerGameOverData : {
        data: CGEDGeneralGameOverDataPassData
    }


}


declare interface MapSelectHeroList {
    hero_id : number,
    state : number, //是否确认 0 未确认 1 确认
    star : number , //星级
    lv : number , //等级
}
declare interface MapSelectHeroData {
    hero_id : number,
    star : number , //星级
    lv : number , //等级
}


declare interface MapVote {
    playervote : number[], //准备状态
    state : number, // 0 未开启投票 1开启投票
    vote_time : number , //投票到期时间
}

declare interface UserMapSelectDifficulty { //地图详细信息
    user_difficulty: number, // 玩家最高可选难度
    difficulty_max: number, // 地图最高难度
    map_key: string, //地图编号 m1 m2 
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
    is_vip : number , //是否为vip栏位
    refresh_count : number , //刷新次数
    refresh_soul : number , //刷新价格
}   
//商店刷新信息
declare interface PlayerRefreshData {
    refresh_count: number, //刷新次数
    soul: number, //刷新灵魂
}

//玩家购买记录
declare interface PlayerShopBuyData {
    item_name : number,
    
}
//商店状态信息
declare interface ShopStateData {
    is_ready : number, // 是否准备好了 0 未准备好 1准备好了
}

    
declare interface CGEDGetEquipListInfo {
    id: string, //唯一id
    n: string, //装备key
    r: number, //稀有度 0 1 2 3 => n,r,sr,ssr
    zl: number, //装备等级
    t : number , //装备部位
    ma: { //主attr属性
        k: string, //键
        v: number, //值
    }[],
    pa: { //拼图属性
        k: string, //键
        v: number, //值
        l:number ,//拼图等级
    }[],
    s: { //套装
        k: string, //键;
    }[],
    is_new?: number, //没有就是老的  有就是新装备
    lk? : number , //装备锁
}

declare interface ServerEquip {
    id?: string, //唯一id
    n: string, //装备key
    r: number, //稀有度 0 1 2 3 => n,r,sr,ssr
    zl: number, //装备等级
    ma : string, //装备主属性
    pa : string, // 装备拼图属性
    s : string, //套装数据  
    lk? : number , //装备锁
    created_at ? : number , //创建时间
    t : number , //装备部位
}



declare interface CGEDEquipConfigInfo {
    hero: {
        [heroid: string]: string[][],
    };
}
declare interface CGEDPlayerTalentSkill {
    //技能位置  - 技能信息
    [index: string] : CGEDPlayerTalentList;
}
declare interface CGEDPlayerTalentList {
    uc : number; //当前技能入点数
    iu: number,  //当技能是否解锁 0 未解锁 1已解锁
    //层
    t :  { //天赋key
        //层数 - 层数中的技能信息
        [index: number]: { 
            //当前层选择的技能key
            sk : string ;
            //天赋key
            si : {
                [index: string]: CGEDPlayerTalentDataSkill;

            }
        };
    }
    tm : number , //最大层数 99被动不算
    pu : number , //当前技能是否解锁被动 0 未解锁 1已解锁
}
declare interface CGEDPlayerTalentDataSkill {
    iu: number, //当前技能是否解锁 0 未解锁 1已解锁
    ml : number , //最高等级
    uc : number , //当前技能投入点数
}
declare interface CGEDPlayerTalentSkillClientList {
    [ index : string] : CGEDPlayerTalentDataSkillClient
}

declare interface CGEDPlayerTalentDataSkillClient {
    iu: number, //当前技能是否解锁 0 未解锁 1已解锁
    uc : number , //当前技能投入点数
}
declare interface CGEDPlayerTalentSkillPoints {
    use_count : number , //使用的技能点
    points : number , //还剩的技能点
}


declare interface CGEDPlayerTalentConfig {
    unlock_count : { [ key : number] : number};
}



declare interface CGEDServerSkillful {
    level : { [ key : string] : {
        lv : number, //等级
        exp : number, //经验
        type : number, //类型
        cur_exp : number , //当前经验   
    }};
}


declare interface CGEDGeneralGameOverDataPassData {
    state : number // 通关状态 1通关  2未通关 
    time : number , //通关所用时间
    player_list_data : {
        player_id : PlayerID,
        steam_id : number, //steam_id
        exp : number, //通关奖励经验
        old_exp : number, //当时的经验
        pass_item : { //通关物品 //包含  商城物品（例如抽奖券）
            item_id : string, // 物品id
            type : number , // 1商城物品 
            item_number : number, //数量
            quality : number , // 品质 
        }[],
        skill_exp : {
            [key : string] : { //类型
                exp : number, //通关奖励经验
                old_exp : number, //当时的经验
            }
        }[],
        is_mvp : number , //是否为mvp
    }[],
}