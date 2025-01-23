//code = 203 统一给玩家看 msg的信息


declare interface ItemTReturn { //通关获得的物品
    id : string, //道具唯一id
    item_id: number, //物品唯一id
    number: number, //数量
    customs ? :  string , //额外数据
}

declare interface PlayerInfoData{ //基础数据
    exp: number, //地图经验值
    cz_gold: number, //黄金
    jf_gold: number , //良善点
    jb_gold: number , //银币
    zs_gold: number , //钻石
    vip_times : number , //月卡时间
    vip_zs : number , //终身卡
}


declare interface CreateGameParam {
    steamids: number[]
}

declare interface CreateGameReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  { //数据
        list : {
            [steam_id : string] : {
                wg_set: number, //标记为外挂 0不是 1是
				inside: number, //是否内侧 0否 1是
				level_difficulty: string, //通关难度
				exp: number, //地图经验值
				cz_gold: number, //黄金
				jf_gold: number , //良善点
                jb_gold: number , //银币
                zs_gold: number , //钻石
                skill_data : string,//技能数据
                limit : AM2_Server_Shopping_Limit_List, //限制
                bow_wash : string, //首冲数据
                vip_times : number , //月卡时间
                vip_zs : number , //终身卡
                draw_record : AM2_Draw_Lottery_Draw_Record,
                pass_record : AM2_Draw_Pass_Record,
                pa : string, //魂石数据
                talentdata : string , //天赋数据
            }
        }
        time : number , // 服务器时间
        game_id : string , // 游戏唯一id
        v : string, //游戏版本
    }
}

/**
 * 验证码参数
 */
declare interface VerificationCodeParam {
	sid: string, //steam_id
	code: string , //激活码
}

/**
 * 激活码查询
 */
declare interface CheckjhmCodeParam {
	sid: string, //steam_id
}

declare interface VerificationCodeReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  { //数据
        inside : number  //是否激活 0 未激活 1已激活
    }
}



/**
 * 确认难度
 */
declare interface ConfirmDifficultyParam {
	nd: number , //难度
}
/**
 * 确认难度返回
 */
declare interface ConfirmDifficultyReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {

    }
}

/**
 * 游戏结束参数
 */
declare interface GameOverParam {
	state: number , //结束状态 0 输了 1赢了
    host_steam_id : number ,//主机steamid
    bosskills : number ,
    bossmax : number , 
    ext_items : {
        [ sid : string] : {
            [item_id : number] : number,
        }
    },
    skill_exp : {
        [ sid : string] : string,
    }
}
/**
 * 游戏结束返回
 */
declare interface GameOverReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        list : {
            [steam_id : string] : { // steamid
                add_items : ItemTReturn[],
                skill_exp : string,
                level_difficulty : string, //当前可用难度
                pass_record : AM2_Draw_Pass_Record, //通行证返回数据
            }
        }
    }
}


/**
 * 新增装备
 */
declare interface AddEquipParam {
	sid : string , //steamid
    equipdata : ServerEquip[] , //装备信息
}
/**
 * 新增装备返回
 */
declare interface AddEquipReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  { [equip_id : string] : ServerEquip}
}


/**
 * 获取装备信息
 */
declare interface GetEquipParam {
	sid : string , //steamid
    limit ? : number , //获取数量
}
/**
 * 获取装备信息返回
 */
declare interface GetEquipReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  { [equip_id : string] : ServerEquip}
}



/**
 * 更新装备信息
 */
declare interface UpdateEquipParam {
	sid : string , //steamid
    equipdatalist : { [equip_id : string] : ServerEquip} , //装备信息
}
/**
 * 更新装备信息返回
 */
declare interface UpdateEquipReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  { [equip_id : string] : ServerEquip}
}



/**
 * 日志信息
 */
declare interface GameLogParam {
    data : { [ sid : string] : string} , //记录数据
}
/**
 * 更新装备信息返回
 */
declare interface GameLogReturn {
    code : number, //状态码
    msg : string, //服务器消息
}




/**
 * 存档商城购买参数
 */
declare interface ShoppingBuyParam {
	sid : string , //steamid
    shop_id : number , //商品id
    buy_count : number , //购买数量
    buy_types : number , // 支付方式 1 内部货币  //扫码支付 和充值统一
}
/**
 * 存档商城购买返回数据
 */
declare interface ShoppingBuyReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data : {
        limit : AM2_Server_Shopping_Limit_List,
        add_item : AM2_Server_Backpack[],
        red_item : AM2_Server_Backpack[],
        base : PlayerInfoData,
    }
}

/**
 * 获取背包数据参数
 */
declare interface GetCustomBackpackParam {
	sid : string , //steamid
    aff_class : string , //affiliation_class 物品类型 , 逗号分割
}
/**
 * 获取背包返回数据
 */
declare interface GetCustomBackpackReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        list : AM2_Server_Backpack[]
    }
}


/**
 * 存档技能升级参数
 */
declare interface SkillDataUpParam {
	sid : string , //steamid
    red_item_str  : string , //  逗号分割 itemid_number,itemid_number
    skill_data :  string , // `skill_data` : '存档技能数据',
}

/**
 * 存档技能升级返回数据
 */
declare interface SkillDataUpReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        red_item : AM2_Server_Backpack[],
        skill_data : string , // `skill_data` : '存档技能数据',
    }
}




/**
 * 抽奖数据参数
 */
declare interface DrawLotteryParam {
	sid : string , //steamid
    types : number , //抽奖类型
    number : number , //抽奖次数
}
/**
 * 抽奖返回数据
 */
declare interface DrawLotteryReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        draw_result : AM2_Draw_Lottery_Data[],
        add_item : AM2_Server_Backpack[],
        red_item : AM2_Server_Backpack[],
        draw_record : AM2_Draw_Lottery_Draw_Record,
    }
}
/**
 * 累抽领取参数
 */
declare interface GetServerDrawAccParam {
	sid : string , //steamid
    type : number , //抽奖类型  默认1
    count : number , // 领取到的目标 -1 表示领取到最新
}
/**
 * 抽奖返回数据
 */
declare interface GetServerDrawAccReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        add_item : AM2_Server_Backpack[],
        draw_record : AM2_Draw_Lottery_Draw_Record,
    }
}



/**
 * 通行证数据
 */
declare interface GetServerPassParam {
	sid : string , //steamid
    type : number , //通行证类型 
    count : number , // 领取到的目标 -1 表示领取到最新
    get_type : number , // 获取类型 1 普通 2高级
}
/**
 * 通行证返回数据
 */
declare interface GetServerPassReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        add_item : AM2_Server_Backpack[],
        pass_record : AM2_Draw_Pass_Record,
    }
}



/**
 *  获取图鉴参数
 */
declare interface GetPictuerDataParam {
	sid : string , //steamid
}
/**
 *  获取图鉴返回数据
 */
declare interface GetPictuerDataReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        list : AM2_Server_Backpack[],
        pictuer : {
            pictuer_data : string,
            pictuer_config : string,
        },
    }
}



/**
 * 图鉴保存参数
 */
declare interface PictuerSaveParam {
	sid : string , //steamid
    pictuer_data ? : string , //图鉴激活数据
    pictuer_config ? : string , // 图鉴配置数据
    red_item_str ? : string , // 删除物品
}
/**
 * 图鉴保存返回数据
 */
declare interface PictuerSaveReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        red_item : AM2_Server_Backpack[],
        pictuer : {
            pictuer_data : string,
            pictuer_config : string,
        },
    }
}

/**
 * 魂石升级保存参数
 */
declare interface PlayerSoulStoneSaveParam {
	sid : string , //steamid
    pa ? : string , //魂石保存数据
    red_item_str ? : string , // 删除物品
    add_item_str ? : string , // 增加物品
}
/**
 * 魂石保存升级返回数据
 */
declare interface PlayerSoulStoneSaveReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        red_item : AM2_Server_Backpack[],
        add_item : AM2_Server_Backpack[],
        pa : string,

    }
}



/**
 * 天赋保存参数
 */
declare interface PlayerTalentSaveParam {
	sid : string , //steamid
    talentdata  : string , //天赋数据
}
/**
 * 天赋升级返回数据
 */
declare interface PlayerTalentSaveReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        talentdata : string,
    }
}



/**
 * 兑换码请求数据
 */
declare interface GameDhmParam {
	sid : string , //steamid
    keys : string , //通行证类型 
}
/**
 * 兑换码返回数据
 */
declare interface GameDhmReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        add_item : AM2_Server_Backpack[],
    }
}





/**
 * 兑换码请求数据
 */
declare interface RechargeOrderParam {
	sid : string , //steamid
    from : number , //0 是微信 1是支付宝
    shop_id : number , //购买商品的id
    count : number , //购买数量

}
/**
 * 兑换码返回数据
 */
declare interface RechargeOrderReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        pay_order : string,
        pay_m : string,
    }
}



/**
 * 兑换码请求数据
 */
declare interface GetOrderItemParam {
	sid : string , //steamid
    pay_order : string , //订单号

}
/**
 * 兑换码返回数据
 */
declare interface GetOrderItemReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        add_item : AM2_Server_Backpack[],
        limit : AM2_Server_Shopping_Limit_List,
        bow_wash : string,
    }
}



/**
 * 物品使用数据参数
 */
declare interface UseItemParam {
	sid : string , //steamid
    use_item_id : number , //使用的物品
    number : number , //使用次数
}
/**
 * 物品使用返回数据
 */
declare interface UseItemReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        add_item : AM2_Server_Backpack[],
        red_item : AM2_Server_Backpack[],
    }
}