declare interface CGED {
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
            index : number , //物品位置
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
        CreatRuneSelectData : {
            //生成符文可选列表
        }
        GetRuneSelectData : {//直接获取选列表

        }
        PostSelectRune : { //选择列表
            index : number //选择的下标
        }
        //随机符文
        RuneRandom : {
            //随机获得一个符文
        }
        //获取当前玩家符文数据
        GetRuneData : {

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
        //选择英雄
        SelectHero : {
            hero_id : number;
        }
        //确认英雄
        SelectHeroAffirm : {

        }
    }

    /**
     * 局内信息
     */
    GameInformation : {
        //获取生命数
        GetPlayerLifeData : {

        }
        //获取局内头部信息
        GetPlayGameHeadData : {

        }
    }

    //存档装备相关
    ServiceEquipment : {
        //拼图升级
        PuzzleUpgrade : {
            equip_id : string, 
            index : number,
        }
        //拼图降级
        PuzzleLower : {
            equip_id : string, 
            index : number,
        }

    }

}

