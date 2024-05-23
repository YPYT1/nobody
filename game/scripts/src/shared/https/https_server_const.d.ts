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
	gid: string, //游戏id
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
	gid: string, //游戏id
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
