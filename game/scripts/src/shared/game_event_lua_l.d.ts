declare interface CGED {
    //服务器数据
    ArchiveService : {
        //获取通关后数据
        GetPlayerGameOverData : {

        }
    }

    //投资系统
    InvestSystem : {
        GetPlayerInvestData : {
            
        }
    }
    //神秘商店
    MysticalShopSystem : {
        //购买物品
        BuyItem : {
            index : number // 购买位置 从0开始
        }
        //单物锁定
        ShopLock : {
            index : number // 锁定位置 从0开始
        }
        //玩家准备
        PlayerReady : {
            
        }
        //刷新单个物品
        RefreshOneItemBySoul : {
        }
        //获取商店状态 是否可以购买等
        GetShopState : {

        }
        //获取商店出售数据
        GetShopData : {

        }
        //获取玩家购买数据
        GetPlayerShopBuyData : {
            
        }
    }

    ArmsEvolution : {
        CreatArmssSelectData: {//当有技能点时可刷新选技能列表
            
        },
        GetArmssSelectData : {//直接获取选技能列表

        }
        PostSelectArms : {//选择列表 必须要有技能点 
            index : number //选择的下标
        }
    }
    //技能相关
    NewArmsEvolution : {
        //弃用
        ArmsUpgrade : {
            index : number // 物品位置  从0开始
        }
        CreatArmssSelectData: {//当有技能点时可刷新选技能列表
            index : number , //选择的技能位置
        },

        CreatArmssWeightData : { //当有技能点时可重新随机当前技能
            index : number , //选择的技能位置
        }
        GetArmssSelectData : {//直接获取选技能列表

        }
        PostSelectArms : {//选择列表 必须要有技能点
            index : number //选择的下标
        }
        //获取当前玩家技能点数量
        GetEvolutionPoint : {

        }
        //获取玩家元素羁绊
        GetArmssElementBondDateList : {
            
        }
    }
    // 物品升级 弃用
    ItemEvolution  : {
        //升级技能的位置
        ItemUpgrade : {
            index : number // 物品位置  从0开始
        }
    }
    //符文系统
    RuneSystem : {
        /**
         * 获取符文是否可选信息
         */
        GetRuneSelectData: {

        };
        /**
         * 获取玩家已有符文列表
         */
        GetPlayerRuneData: {

        };
        /**
         * 选择符文
         */
        PostSelectRune: {
            index: number;
        };
        /**
         * 消耗次数刷新未选择符文的列表
         */
        ConsumeRefreshCount: {

        };
    }
    //英雄天赋系统 : 
    HeroTalentSystem : {
        //点天赋
        HeroSelectTalent : {
            key : string ; //天赋下标
        }
        //获取天赋信息
        GetHeroTalentListData : {
            
        }
        //重新获取充值英雄的名字
        ResetHeroTalent : {

        }
        //获取可选天赋
        GetSelectTalentData : {

        }
        //点天赋->index
        HeroSelectTalentOfIndex : {
            index : number ; //选择下标
        }
    }
    //地图选择
    MapChapter : {
        //获取可选最高难度
        GetDifficultyMax : {

        }
        //选择难度
        SelectDifficulty : {
            difficulty: string;
        },
        //获取难度 
        GetDifficulty : {
            difficulty: string;
        }
        //确认难度
        SelectDifficultyAffirm : {

        }
        //返回到选择难度
        ReturnSelectDifficulty : {

        }
        //获取可用英雄列表
        GetPlayerHeroList : {

        }
        //获取游戏阶段
        GetGameSelectPhase : {

        }
        //获取所有玩家选择英雄列表
        GetPlayerSelectHeroList : {

        }
        //获取是否为新玩家状态
        GetNewPlayerStatus : {

        }
        //选择英雄
        SelectHero : {
            hero_id : number;
        }
        //确认英雄
        SelectHeroAffirm : {

        }
        //发起重开投票 只有主机有效
        OpenReopenVote : {
            
        }
        //玩家重开投票
        PlayerVote : {
            /** 0 拒绝 1 通过 */
            vote : number ,
        }
        //玩家投票信息
        GetPlayerVoteData : {

        }
        //获取游戏信息
        NewPlay : {

        }
    }

    /**
     * 局内信息
     */
    GameInformation : {
        //获取生命数
        GetPlayerLifeData : {

        }
        //获取玩家死亡信息
        GetPlayerDieData : {

        }
        //获取局内头部信息
        GetPlayGameHeadData : {

        }
    }

    //存档装备相关
    ServiceEquipment : {
        //拼图升级
        PuzzleUpgrade : {
            equip_id : string, //装备id
            index : number, //拼图词条下标
        }
        //拼图降级
        PuzzleLower : {
            equip_id : string, //装备id
            index : number, //拼图词条下标
        }
        //装备强化
        EquipIntensify : {
            equip_id : string, //装备id
        }
        //强化转移
        IntensifyTransfer : {
            source_equip_id : string, //来源装备id（清除强化的装备）
            target_equip_id : string, //目标装备id（增加强化的装备）
        }

        //魂石转移 必要转移规则 来源装备品质 >= 目标装备品质 否则会出现设定悖论
        PuzzleTransfer : { 
            source_equip_id : string, //来源装备id（清除魂石的装备）
            target_equip_id : string, //目标装备id（增加魂石的装备）
        }
        //预先获取分解数据信息
        GetResolveEquipData : {
            id_list : string[], //分解装备id信息
        }
        //确认分解
        ResolveEquip : {
            id_list : string[], //分解装备id信息
        }
        //穿戴装备
        InstallEquip : {
            equip_id : string, //装备id
            hero_id : number, //英雄id
            t: number, // 装备栏位 从1开始
        }
        //获取玩家装备穿戴信息
        GetEquipConfig : {
            
        }
        //保存装备信息到服务器
        SaveEquipConfig : {

        }
        //
         //还原装备穿戴
        RestoreEquipConfig: {
            t: number, // 装备栏位 从1开始
            hero_id: string;  // 英雄
        };
        //解除装备
        UninstallEquip: {
            t: number, // 装备栏位 从1开始
            equip_type: number, // 装备位置 
            hero_id : string;// 英雄
        };
        //获取玩家所有装备
        GetEquipList : {

        }
    }

    ServiceSoul : {
        //对具体部位创建
        SoulAddOfField : {
            box_type : number ,//部位  1 武器
            key : string , //魂石key
        }
        //升级
        SoulIntensify : {
            box_type : number ,//部位  1 武器
            index : number ,// 位置
            type : number , // 1升级 2降级
            ext_item ? : number , //额外的物品id  只有升级的时候才有 并且使用一个
        }
        //预览魂石删除
        DeforehandSoulDelete : {
            box_type : number ,//部位  1 武器
            index : number ,// 位置
        }
        //魂石删除
        SoulDelete: {
            box_type : number ,//部位  1 武器
            index : number ,// 位置
        }
        //获取魂石数据
        GetPlayerServerSoulData : {

        }
    }
    //存档天赋功能
    ServiceTalent : {
        //点天赋
        ClickTalent : {
            key : string , //天赋下标
            index : number , //配置index
        }
        //获取存档天赋
        GetPlayerServerTalent : {

        }
        //获取存档天赋by英雄
        GetPlayerServerTalentByHero : {
            hero_id : number,
            index : number , //配置index
        }
        //保存存档天赋
        SaveTalentConfig : {
            hero_id : number,
            index : number , //配置index
        }
        //还原存档天赋
        RestoreTalentConfig : {
            hero_id : number,
            index : number , //配置index
        }
        //重置存档天赋
        ResetTalentConfig : {
            hero_id : number,
            index : number , //配置index
        }
    }
    //存档接口
    ServiceInterface : {
        //解锁图鉴
        PlayerConsumeCard : {
            suit_id : string ,
            card_id : string ,
        }
        //装备图鉴
        ConfigPictuerFetter : {
            index : number , //装备栏位
            suit_id : string , //图鉴id
        }
        //卸载图鉴
        UninstallPictuerFetter : {
            index : number , //装备栏位
            suit_id : string , //图鉴id
        }
        //保存图鉴配置
        SavePictuerFetter : {
            index : number , //装备栏位
        }
        //还原图鉴配置
        RestorePictuerFetter : {
            index : number , //装备栏位
        }

        //卡片合成
        CompoundCard : {
            list : string[][],  //结构 [ [ "3","4" ,"6"] , [ "5" , "7" , "9" ] ] 为两个合成 最多八个 卡片id
            type : number , // 0 普通 1快速
        }
        //获取图鉴信息
        GetConfigPictuerFetter : {

        }
        //获取玩家所有卡片
        GetPlayerCardList : {

        }

        //激活码
        PlyaerGameActivate : {
            key : string,
        }

        //查询激活码
        GetGameActivate : {

        }

        //获取背包数据
        GetPlayerServerPackageData : {
            
        }
        //获取存档特殊数据 黄金 良善点 
        GetPlayerServerGoldPackageData : {
            
        }
        //获取技能相关信息
        GetPlayerServerSkillData : {
            
        }
        //存档技能升级
        ServerSkillUp : {
            key : string , // 技能key
        }

        //购买
        ShoppingBuy : {
            shop_id : string ,  //购买商品id
            count : number , //购买数量
        }
        //抽奖
        DrawLottery : {
            type : number , //奖池类型 默认1
            count : number , //抽奖次数 
        }
        //累抽领取
        GetServerDrawAcc : {
            type : number , //奖池类型 默认1
            count : number , //领取到多少 -1 表示全部
        }
        //通行证领取
        GetServerPass : {
            type : number , //通行证类型 
            count : number , //领取到多少 -1 表示全部
            get_type : number , // 获取类型 1 普通 2高级
        }

        //限购数据
        GetPlayerShoppingLimit : {

        }
        /**
         * 获取服务器时间
         */
        GetServerTime : {
            
        }
        /**
         * 获取抽奖记录
         */
        GetPlayerServerDrawLotteryDrawRecord : {

        }
        /**
         * 获取玩家成长礼 通行证
         */
        GetPlayerServerPassRecord : {
            
        }
        /**
         * 获取玩家vip信息
         */
        GetPlayerVipData : {

        }
    }
}

