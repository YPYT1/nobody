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
    //物品升级系统
    ItemEvolution : {
        //升级物品
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
}

