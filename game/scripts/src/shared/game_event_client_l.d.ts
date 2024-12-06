declare interface CustomGameEventDeclarations {
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
            player_vip_status : number ; //玩家vip状态 0 不是 1是
            player_shop_buy_ts_data : PlayerShopBuyTsClient[],
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
     * 神秘商店购买数据
     */
    MysticalShopSystem_GetPlayerShopBuyData : {
        data : {
            player_shop_buy_data : { item_key: string , count : number }[],
            player_shop_buy_ts_data : PlayerShopBuyTsClient[],
        }
    }

    /**
     * 发送消息给全体
     */
    CMsg_SendMsgToAll: {
        data: {
            event_type: CGMessageEventType,
            message: "",
        };
    };
    /**
     *  神秘商店
     */
    
    //服务器相关

    /**
     * 获取存档天赋数据
     */
    ServiceTalent_GetPlayerServerTalent: {
        data: {
            server: {
                [hero_id: number]: CGEDGetTalentListInfo[]; //服务器存档数据
            },
            local: {
                [hero_id: number]: CGEDGetTalentListInfo[]; //临时数据
            },
        };
    };

    ServiceTalent_GetPlayerServerTalentByHero : {
        data: {
            server : CGEDGetTalentListInfo; //服务器存档数据
            local : CGEDGetTalentListInfo; //临时数据
        };
    }
    ServiceTalent_EmptyTalentOfPlayer : {
        data: {
            index : number; // 第几页天赋
            hero_id : number; // 英雄id
        };
    }
    /**
     * 游戏激活状态
     */
    ServiceInterface_GetGameActivate: {
        data: {
            Activate: number, //激活状态 0 未激活 1已激活
            Msg?: string,
        };
    };
    /**
     * 获取图鉴配置
     */
    ServiceInterface_GetConfigPictuerFetter : {
        data: {
            server : string[][], // 配置栏-羁绊id
            locality : string[][], // 配置栏-羁绊id
            is_vip : number , //是否为vip
        };
    }
    /**
     * 获取玩家所有卡片
     */
    ServiceInterface_GetPlayerCardList : {
        data: {
            card : AM2_Server_Backpack[],
            pictuer_list : Server_PICTUER_FETTER_CONFIG, //我的图鉴列表
        };
    }
    /**
     * 图鉴合成结果
     */
    ServiceInterface_GetCompoundCardList : {
        data: {
            card : string[], //卡片id
            type : number , // 0 背对显示 1 正常显示 
        };
    }
    /**
     * 强制关闭图鉴加载弹窗
     */
    ServiceInterface_PictuerLoadClose : {
        data: {
            
        };
    }

    /**
     * 背包数据
     */
    ServiceInterface_GetPlayerServerPackageData: {
        data: AM2_Server_Backpack[];
    };
    /**
     * 背包更新数据返回
     */
    ServiceInterface_PackageDataUpdate : {
        data: AM2_Server_Backpack_Update[]
    }

    /**
     * 技能数据
     */
    ServiceInterface_GetPlayerServerSkillData : {
        data: {
            SkillLevel : PlayerServerSkillLevelCount,
            SkillTypeLevel : CGEDServerSkillTypeLevel,
        }
    }
    //玩家生命数
    GameInformation_GetPlayerLifeData : {
        data: {
            player_life : number
        }
    }
    /**
     * 玩家魂石装备
     */
    ServiceSoul_GetPlayerServerSoulData : {
        data: CGEDGetSoulList
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
            round_index : number,
            round_max : number,
            type : number , // 0 普通显示 1 boss显示 
            boss_time : number , //boss倒计时时间
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
     * 选择天赋数据
     */
    HeroTalentSystem_GetSelectTalentData : {
        data : CGEDPlayerSelectTalentData
    }

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

    /**
     * 玩家可选符文列表
     */
    RuneSystem_GetRuneSelectData: {
        data: CGEDPlayerRuneSelectDataList;
    };

    /**
     * 玩家拥有符文列表
     */
    RuneSystem_GetPlayerRuneData: {
        data: {
            [index: string]: CGEDPlayerRuneData;
        };
    };
    /**
     * //选英雄的时候使用  修改时 使用单条数据最好
     */
    ServiceEquipment_GetEquipConfig: { 
        data: {
            server: CGEDEquipConfigInfo, // 服务器
            local: CGEDEquipConfigInfo, // 本地配置
        };
    },
    /**
     * 装备列表
     */
    ServiceEquipment_GetEquipList: { //装备信息
        data: {
            list: {
                [eq_id: string]: CGEDGetEquipListInfo;
            };
        };
    };
    /**
     * 获取分解信息
     */
    ServiceEquipment_GetResolveEquipData: {
        data: {
            list: { //分解物品列表
                [item_id: string]: number;
            },
        };
    };

    
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
    key : string, // 物品key
    soul : number, // 需要灵魂
    type : number , // 类型 1 为普通 2为成长装备
    is_discount: number, //折扣 1为折扣 0为没打折
    discount_rate: number, // 80% 20% 10 % 1% ----不低于1%
    rarity: number, // 稀有度 1 2 3 4 5 6
    is_buy: number, // 0 未购买 1 已购买
    is_lock : number , //是否锁定
    is_vip : number , //是否为vip栏位
    refresh_count : number , //刷新次数
    refresh_soul : number , //刷新价格
    refresh_max : number , //刷新上限
    star : number , // 星级
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


//成长类道具特殊栏位
declare interface PlayerShopBuyTsClient { 
    item_key: string ,  // 物品id
    count : number ,  // 数量 = 品质 = 星级
    is_vip: number ,  // 是否vip栏位 0 不是  1是
    type : number  , // 类型 0未解锁 1已使用 2未使用 
}
    
declare interface CGEDGetTalentListInfo {
    u : number , //总投入点 用于反算可以使用的点
    y : number , //可用天赋点
    i : { //天赋信息
        [tier_number : number ] : {
            c : number , //当前层点了多少点
            k : {
                [talent_key : string] : { //有key就是解锁 没有就是没解锁
                    uc : number , //投入点
                },
            }
        }
        
    }
}

declare interface ServerEquip {
    id?: string, //唯一id
    n: string, //装备key
    r: number, //稀有度 0 1 2 3 => n,r,sr,ssr
    zl: number, //装备等级
    i : number , //强化数
    ma : string, //装备主属性
    pa : string, // 装备拼图属性
    s : string, //套装数据  
    lk? : number , //装备锁
    created_at ? : number , //创建时间
    t : number , //装备部位
}

declare interface CGEDGetEquipListInfo {
    id: string, //唯一id
    n: string, //装备key
    r: number, //稀有度 0 1 2 3 4 => C B A S SS
    zl: number, //装备等级
    t : number , //装备部位
    i : number , //强化数
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

/**
 * 魂石服务器数据
 */
declare interface CGEDGetSoulList {
    id ? : string, //唯一id 用于服务器修改数据
    i : { [ index : string ] : //部位下标
        {
            d : CGEDGetSoulListData[]
            c : { //总消耗 //用于删除返回
                [ item_id : number] : number , //物品数量key
            }
        }
    }
}
/**
 * 魂石数据
 */
declare interface CGEDGetSoulListData {
    k: string, //属性键
    v: number, //属性数值
    l:number ,//拼图等级
}

/**
 * 魂石升级模板
 */
declare interface CGEDGetSoulUpDropUse {
    consume : string, //主要消耗
    items : string[], //额外物品列表
    pro :number ,//概率
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
    uc : number , //当前技能投入点数
    ui?:number;
}
declare interface CGEDPlayerTalentSkillPoints {
    use_count : number , //使用的技能点
    points : number , //还剩的技能点
}


declare interface CGEDPlayerTalentConfig {
    unlock_count : { [ key : number] : number};
    unlock_level : { [ key : number] : number};
}


/**
 * 总技能
 */
declare interface PlayerServerSkillLevelCount {
    level : { [ key : string] : {
        lv : number, //等级
        exp : number, //经验
        type : number, //类型
        cur_exp : number , //当前经验   / 或技能点
        level_exp : number , //升级经验 / 或技能点
        is_max : number , //是否满级
        is_adv : number , // 0 普通 1高级
        need_item : { //所需道具
            [item_id : number] : number
        }, 
    }};
}
/**
 * 分支
 */
declare interface CGEDServerSkillTypeLevel {
    [ key : string ] : {
        lv : number, //等级
    };
}


declare interface CGEDGeneralGameOverDataPassData {
    state : number // 通关状态 1通关  2未通关 
    time : number , //通关所用时间
    game_count : number , //游戏次数
    player_list_data : CGEDPlayerListData[], //玩家存档数据
}

declare interface CGEDPlayerListData {
    player_id : PlayerID,
    steam_id : number, //steam_id
    exp : number, //通关奖励经验
    old_exp : number, //当时的经验
    pass_item : CGEDPlayerPassItem[],
    skill_exp : CGEDPlayerSkillExp[],
    is_mvp : number , //是否为mvp
}

//通关物品 //包含  商城物品（例如抽奖券）
declare interface CGEDPlayerPassItem { 
    id ? : string,//物品id
    item_id : string, // 物品id
    number : number, //数量
    quality : number , // 品质 
    type : number , // 自定义物品
}
declare interface CGEDPlayerSkillExp {
    [key : string] : { //类型
        exp : number, //通关奖励经验
        old_exp : number, //当时的经验
    }
}



declare interface CGEDPlayerRuneSelectServerData {
    is_check: boolean,
    level: number,
    item_list: { [index: string]: CGEDPlayerRuneSelectData; },
    check_index: number,
    is_refresh: boolean,
    time : number ,
    type : number , //获得类型 0 升级时的符文 1天辉符文 2夜魇符文
}
declare interface CGEDPlayerRuneSelectDataList {
    item_list: { [index: string]: CGEDPlayerRuneSelectData; }; //可选符文列表 无数据代表不可选 等级下标
    is_new_fate_check: number, // 0可以挑战 1 还有未选择的符文 2 挑战中 -- 弃用 不通过战斗获取
    refresh_count: number, //剩余刷新次数 主要通过这个来判断是否展示等 0 为没有次数
    fate_level: number, // 玩家天命挑战成功次数 -即为挑战等级 -- 弃用 不通过战斗获取
    player_refresh_count: number, // 剩余重随符文次数
    time : number , // 倒计时   
    type : number , //获得类型 0 升级时的符文 1天辉符文 2夜魇符文
}


declare interface CGEDPlayerRuneSelectData {
    name: string,  //符文名字
    level: number,  // 符文等级
    level_index: number;  //符文下标
    attr_list : {
        [ attr_id : string ] : number , //数值
    }
}


declare interface CGEDPlayerRuneData {
    name: string, //符文名字
    index: number, //物品位置id
    level: number, //符文等级 只作为显示颜色
    is_award: boolean, //是否为通过集齐其他符文获取的奖励符文
    level_index: number, //符文等级下标
    is_delete: boolean, // 是否删除
    is_more_level: boolean, //是否有多个等级
    is_level_up: boolean, //是否可以升级
    is_level_max: boolean, //是否满级
    attr_list :  {
        [ attr_id : string ] : number , //数值
    }
}

declare interface CGEDPlayerTalentSkillPoints {
    use_count : number , //使用的技能点
    points : number , //还剩的技能点
}

declare interface CGEDPlayerSelectTalentData {
    is_show : number, // 0显示 1不显示
    data : {
        key : string , //技能key  -1 // 为投资
        lv : number , //技能等级
        r : number , //品质
        type : number , // 1技能 2其他
    }[],
}

