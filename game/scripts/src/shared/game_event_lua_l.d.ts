declare interface CGED {
    ArmsEvolution : {
        CreatArmssSelectData: {//当有技能点时可刷新选技能列表

        },
        GetArmssSelectData : {//直接获取选技能列表

        }
        PostSelectArms : {//选择列表 必须要有技能点
            index : number //选择的下标
        }
    }
    //技能升级
    NewArmsEvolution : {
        //升级技能的位置
        ArmsUpgrade : {
            index : number // 物品位置  从0开始
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
}

