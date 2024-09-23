//code = 203 统一给玩家看 msg的信息

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
				tb_gold: number, //钻石
				tq_gold: number , //元素精华
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
}
/**
 * 游戏结束返回
 */
declare interface GameOverReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        [steam_id : string] : { // steamid
            add_items : { //通关获得的物品
                id : number, //道具唯一id
                item_id: number, //物品唯一id
                count: string, //数量
                class: number, //类型
                type: number, //类型
                lv: number , //等级
                customs :  string , //额外数据
            }[]
        }
    }
}



/**
 * 游戏兑换码
 */
declare interface GameDhmParam {
	sid : string , //steamid
    keys : string , //兑换码
}
/**
 * 游戏结束返回
 */
declare interface GameDhmReturn {
    code : number, //状态码
    msg : string, //服务器消息
    data :  {
        add_items : { //通关获得的物品
            id : number, //道具唯一id
            item_id: number, //物品唯一id
            count: string, //数量
            class: number, //类型
            type: number, //类型
            lv: number , //等级
            customs :  string , //额外数据
        }[]
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
    gid: string, //游戏id
    data : { [ sid : string] : string} , //记录数据
}
/**
 * 更新装备信息返回
 */
declare interface GameLogReturn {
    code : number, //状态码
    msg : string, //服务器消息
}



