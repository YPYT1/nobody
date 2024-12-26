

declare interface AM2_Server_ToGetLog {
    lost?: number,  // ?
    types: number, // 
    id?: string; // ?
    number: number, //数量
    item_id: number, // 物品id
    lv: number, //等级
    fj: number, // 是否有子类 0无 1有
    child?: AM2_Server_ToGetLog[],
}

declare interface AM2_Server_ToGetLog_Draw {
    lost?: number,  // ?
    types: number, // 物品表类型    
    id?: string; // ?
    number: number, //数量
    item_id: number, // 物品id
    lv: number, //等级
    fj: number, // 是否有子类 0无 1有
    items ?: AM2_Server_Draw_Data | AM2_Pet_Backpack_Data,
    child ?: AM2_Server_ToGetLog[],
}
declare interface AM2_Server_Draw_Data {
    transaction : number,
    name : string,
    item_id  : number,
    id : string,
    affiliation_class : number,
    join_time : string,
    customs : string,
    number : number,
    lv : number,
    steam_id : string
}
//存档背包
declare interface AM2_Server_Backpack {
    id: string,	//系统内唯一id
    item_id: number, //物品表唯一id
    number: number,	//物品数量
    customs ?: string, //自定义字段
}

declare interface AM2_Server_Backpack_Update {
    id: string,	//系统内唯一id
    item_id: number,	//物品表唯一id
    number: number,	//物品数量
    customs: string, //自定义字段
    type : number , //类型 0更新 1删除
}

declare interface AM2_Horcrux_Backpack {
    [item_id: number]: AM2_Horcrux_Backpack_Data;
}
declare interface AM2_Horcrux_Backpack_Data {
    id?: string,	//系统内唯一id
    lv: number,	//物品等级
    number: number,	//物品数量
    is_disabled : number , //1 禁用 0 正常
    item_id: number, //物品id
    debris_id?: string, //碎片唯一id
    debris_item_id: number, //碎片商品id
    debris_number: number,	//碎片数量
}

declare interface AM2_Pet_Backpack_Data {
    id : string,//物品唯一id
    state : number, // 非0装备中
    a1 : string , //  固有属性 属性列表ID_key_数值,多个
    a2 : string , // 增幅属性 同上
    a3 : string , // 随机技能 同上
    item_id : number , //物品id
    scores : number, //评分
    lv : number , // 等级
    quality : number , //品质
    exp : number , //经验值
    locks : number , //是否锁定
    customs : string , //自定义字段
}
declare interface AM2_Imprinting_Backpack {
    [id: string]: AM2_Imprinting_Backpack_Data;
}


declare interface AM2_Imprinting_Backpack_Data {
    lv: number,	//物品等级
    number: number,	//物品数量
    id: string, //唯一id
    type: number, //类型 1副职 2强散技能 3套装
    item_id: number, //物品id
    extra: AM2_ImprintItem_ExtraProps[],
}


declare interface AM2_Imprinting_Debris_Backpack {
    [item_id: number]: AM2_Imprinting_Debris_Data;
}


declare interface AM2_Imprinting_Debris_Data {
    lv: number,	//物品等级
    number: number,	//物品数量
    id: string, //唯一id
    item_id: number, //物品id
}

declare interface AM2_ImprintItem_ExtraProps { 
    // 1副职 2强散技能 3套装 信息
    k: string, //键
    v: number, //等级 
    a: { //装备attr属性 一般只有 强散和套装才有
        k: string, //键
        v: number, //值
    }[]
}

//圣物轮回返回数据
declare interface AM2_Server_Relics {
    [index: string]: {
        item: {
            [item_index: number]: number;
        },
        t: string;
    };
}
// 货币
declare interface AM2_Server_Currency {
    jian_hun?: number, //箭魂
    jing_hua?: number, //精华
    zuan_shi?: number, //钻石
    pet_exp? : number, //宠物经验
    item_55? : number, //宠物蛋碎片
    item_93? : number, //无尽碎片
    item_97? : number, //新年货币
    item_98? : number, //魂币 
    item_99? : number, //魂器箱 
    item_100? : number , //符文经验
    item_2002? : number , //福字
    item_2004? : number , //龙年币
    item_2005? : number , // UR宠物兑换箱
    item_2006? : number , // 大师证明
    
}

declare interface AM2_Server_Draw_Reel {
    pt_amount : number ;
    xd_amount : number ; 
    hqx_amount : number ; //武器箱
    xlhd_amount : number ; //新年活动
}

declare interface AM2_Server_Send_Qeuip_Data {
    t?:number; // 1装备 2商城道具 3轮回
    n: string; //t=1 > 装备key t2 imte_key t3 轮回key
    count? : number; // 数量
    r: number, //稀有度 0 1 2 3 => n,r,sr,ssr
    type ?: number ; //特殊状态 没有则没特殊状态 1 额外掉落 2翻倍掉落
}

declare interface AM2_Server_Merchant_Data {
    zk : number, //折扣率
    state : number , // 购买状态 0 未购买 1已购买
    l_cost : number , // 原价
    item_id : number , //物品id
    number : number , //获得数量
    cost : number , //实际价格
    id : number , //商人物品表id
    cost_types : number , //价格类型
}

declare interface AM2_Server_GetProcessAbysData {
    start_time : number , //开始时间
    end_time : number , //结束时间
    AbyssType : number , //
    player_state : number[], //玩家是否选择深渊状态
}



declare interface AM2_Server_GetProcessConversionDropOut{
    "1" : { //消耗物品
        item_id  : number , //
        count  : number, //
    }[] ,
    "2" : { //获得物品
        item_id  : number , //
        count  : number, //
    }[]
    select_count : number , // 可用转换次数 次数 > 0才有效
}

declare interface AM2_Server_Player_Id_Courier_Out {
    item_id : number , // 物品id
    id : string //宠物唯一id
}
declare interface AM2_Server_Player_Id_item90 {
    item90_1 : number , // 上限数量
    item90_2 : number , // 已孵化数量
    item90_3 : number , // 数量
}

declare interface AM2_Server_Shopping_Limit {
    limit : { //已购信息
        [goods_id : string] : number
    },
    sc : string ,  //首冲信息
}

declare interface AM2_Server_Ranking_list_Data {
    e : (CGEDGetEquipListInfo | object)[], //装备信息
    sd64 : string , //sd64 
    h : number , //
}



declare interface Server_PICTUER_FETTER_CONFIG {
    [ pictuer_suit_id : string ] : number[], //激活的卡片
}

//玩家图鉴配置
declare interface ServerPlayerConfigPictuerFetter {
    [ pictuer_suit_id : string ] : string[], //激活的卡片
}

