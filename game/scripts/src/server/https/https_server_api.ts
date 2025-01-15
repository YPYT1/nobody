/** @noSelfInFile */


//1,创建比赛获取队伍人员信息
const ACTION_CREATE_GAME = "/creategame";
//1.2,提交激活码
const ACTION_VERIFICATION_CODE = "/setjhm";
// 1.3 确认难度
const ACTION_CONFIRM_DIFFICULTY = "/confirm_difficulty";
// 1.4 游戏结束
const ACTION_GAME_OVER = "/game_over";
// 1.5 查询激活码
const ACTION_CHECKJHM_CODE = "/checkjhm";
// 2.1 兑换码领取
const ACTION_GAME_DHM = "/gamedhm";

// 3.1 添加装备 
const ACTION_ADD_EQUIP = "/add_equip";
// 3.2 查看装备
const ACTION_GET_EQUIP = "/get_equip";
// 3.2 查看装备
const ACTION_UPDATE_EQUIP = "/update_equip";

// 4.1 存档技能升级
const ACTION_SKILL_DATA_UP = "/skill_data_up";


// 4.2 获取图鉴相关数据
const ACTION_GET_PICTUER_DATA = "/get_pictuer_data";


// 4.3 修改图鉴相关数据
const ACTION_PICTUER_SAVE = "/pictuer_save";

// 4.4 修改魂石相关数据
const ACTION_PLAYER_SOUL_STONE_SAVE = "/player_soul_stone_save";





// 1.4 本地联机游戏追加人员
// 路由	/addtogame
// 请求类型	POST
// 请求数据	参考:
// {  "gid":"2022120516202710000","sid":"steam32ID"}}
 
// 返回值	同1.1 返回一致数据 list=全部人员
const ACTION_ADD_TO_GAME = "/addtogame";


// 1.5 查询激活状态
// 路由	/check_info
// 请求类型	POST
// 请求数据	参考:
// {list:”steamid32,steamid32”}
 
// 返回值	Data={steamid:0没有激活 1已激活}
const ACTION_CHECK_INFO = "/check_info";

// 2.1 兑换码领取
// 路由	/dhm
// 请求类型	POST
// 请求数据	参考:
// {  "gid":"2022120516202710000","sid":"steam32ID","keys":"兑换码"}}
 
// 返回值	Data=[]ToGetLog
const ACTION_DHM = "/dhm";
// 2.2 充值/充值购买
// 路由	/recharge
// 请求类型	POST
// 请求数据	参考:
// sid    string 	用户steamID
// gid    string	游戏ID
// cost   int    	金额单位元
// shop_id int	商城ID 非购买物品类默认0
// from   uint8  	0微信 1支付宝 2海外支付
// number int    	充值/购买数量  购买只能是1
// pm_id   string	海外支付提交(选填)
 
// 返回值	Data=[]ToGetLog
const ACTION_RECHARGE = "/recharge";

// 2.4.1 获取成就
// 路由	/player_achievement
// 请求类型	POST
// 请求数据	参考:
//   {"gid":"2022120821030410001","sid":"1308661008"}
// 返回值	Data= {1}{2}{3}
const ACTION_GET_PLAYER_ACHIEVEMENT = "/player_achievement";
// 2.4.2添加成就
// 路由	/add_player_achievement
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022120821030410001","sid":"1308661008","cj":"4,5,6"}
// 返回值	Data= 无
const ACTION_ADD_PLAYER_ACHIEVEMENT = "/add_player_achievement";
// 2.5 英雄经验
// 2.5.1 获取我的英雄列表
// 路由	/get_player_hero
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022120821030410001","sid":"1308661008"}
 
// 返回值	   "data": {
//         "item": { 英雄名称,exp
//             "test": 100
//         },
//         "spot": 99900 通用经验点
//     },
const ACTION_GET_PLAYER_HERO = "/get_player_hero";
// 2.5.2 使用通用经验添加指定英雄经验
// 路由	/assign_player_hero
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121011345210000","sid":"1308661008" ,"name":"test","spot":100}
// Name 英雄名称
// Spot 追加的经验
 
// 返回值	Data= 同2.5.1 返回一致
const ACTION_ASSIGN_PLAYER_HERO = "/assign_player_hero";
// 2.6.1 获取天赋树
// 路由	/get_player_treeTalent
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022120821030410001","sid":"1308661008" }
 
// 返回值	  "data": {
//         "item": { 判断nil
//             1:5  key id val 等级
//         },
//         "t": 0, 可重置时间时间戳
//         "consume": 0,消耗天赋点
//         "talent": 1000当前天赋点
//     }
const ACTION_GET_PLAYER_TREE_TALENT = "/get_player_treeTalent";
// 2.6.2 升级天赋树
// 路由	/upgrade_player_treeTalent
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022120918214610000","sid":"1308661008" ,"item":{"1":2}}
//  Item=天赋id 需要升级x级
// 返回值	同获取天赋一个返回值
const ACTION_UPGRADE_PLAYER_TREE_TALENT = "/upgrade_player_treeTalent";
// 2.6.3 重置天赋树
// 路由	/reset_player_treeTalent
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022120918214610000","sid":"1308661008" }
//  Item=天赋id 需要升级x级
// 返回值	同获取天赋一个返回值
const ACTION_RESET_PLAYER_TREE_TALENT = "/reset_player_treeTalent";
// 2.7.1 获取
// 路由	/get_player_relics
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":"1308661008" } 
// 返回值	Data ={"1":{item:{1:5个},t:"xxxx"}} 判断null
const ACTION_GET_PLAYER_RELICS = "/get_player_relics";
// 2.7.2 兑换属性
// 路由	/compound_player_relics
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":"1308661008",”class_id”:1,”keys”:”力量+1” } 
// 返回值	Data ={"1":{item:{1:5个},t:"xxxx"}} 判断null
const ACTION_COMPOUND_PLAYER_RELICS = "/compound_player_relics";
// 2.7.3 操作数据对象
// 路由	/operation_player_relics
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":"1308661008",
// ”datas”:{} - map [int]参考7.4} 
// 返回值	Data =等同datas
const ACTION_OPERATION_PLAYER_RELICS = "/operation_player_relics";
// 2.8.1 设置缓存接口
// 路由	/set_cache
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":"1308661008" ,"key":"test","value":"12311"} 
// 返回值	Null
const ACTION_SET_CACHE = "/set_cache";
// 2.8.2 设置获取接口
// 路由	/set_cache
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":"1308661008" ,"key":"test"} 
// 返回值	Data=默认””
const ACTION_GET_CACHE = "/get_cache";
// 2.9 lua log
// 路由	/lua_log
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","data":”错误输出”} 
// 返回值	Data=默认””
const ACTION_LUA_LOG = "/lua_log";
// 2.10 背包类
// 2.10.1 获取指定分类道具背包
// 路由	/get_custom_backpack
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":"1308661008" ,"list":"物品表分类多个_分割"} 
const ACTION_GET_CUSTOM_BACKPACK = "/get_custom_backpack";
// 2.10.3 使用道具
// 路由	/use_prop
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":"1308661008" , ‘’id’:string背包id’,number:使用数量int,
// ,"list":"物品表分类多个_分割" 选填 用于是否返回背包数据
// } 
 
// 返回值	Data= {
// Git=[7.1],
// 如果list不等于空 bp=[7.2]
const ACTION_USE_PROP = "/use_prop";
// }
// 2.12 四象
// 2.12.1获取四象
// 路由	/get_sixiang
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":”1308661008”} 
// 返回值	Data={ sixiang={“1”:exp} 可能为空 key string 类型1-4
// base_info 参考7.3通用用户基础信息返回
// }
const ACTION_GET_SIXIANG = "/get_sixiang";
// 2.12.2升级四象
// 路由	/set_sixiang
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008”
//  ‘key”:” string 1-4”,
// “exp”:int-追加原本exp比如原本 1 参数 2 最终3
// consume={int:int}
// 1:xxx=钻石消耗
// 8:xxx 箭魂消耗
// } 
// 返回值	Data={
// sixiang={“1”:exp} 可能为空 key string 类型1-4
// base_info 参考7.3通用用户基础信息返回
// }
const ACTION_SET_SIXIANG = "/set_sixiang";

// 2.13 获取个人基础信息
// 路由	/get_base_info
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” 
// } 
// 返回值	Data={ 
// 参考 7.3

// }

const ACTION_GET_BASE_INFO = "/get_base_info";

// 2.14.1 查看
// 路由	/equip/look
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// } 
// 返回值	Data={ 
// Equip=参考 7.5

// }
const ACTION_EQUIP_LOOK = "/equip/look";

// 2.14.2修改
// 路由	/equip/modify
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,
// Now={“唯一的ID”:参考7.5,全字段提交}, map类型
// consume=”物品表id_数量,物品表id_数量” 消耗道具,可为空
// Logs=操作描述
// } 
// 返回值	Data={ 
// Consume=提交id 对应返回 扣过的值,如果材料类型 0返回空
// }
const ACTION_EQUIP_MODIFY = "/equip/modify";

// 2.14.3添加		
// 路由	/equip/add
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,
// Now=[]数组类型 参考7.5,
// Logs=操作描述
// } 
// 返回值	Data={ 
// Now=[]新添加的装备
// }
const ACTION_EQUIP_ADD = "/equip/add";
// 2.14.4 删除
// 路由	/equip/del
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,
// List=”唯一id,唯一id”,
// item_list=”物品表id_数量,物品表id_数量” 添加道具,可为空
// Logs=操作描述
// } 
// 返回值	Data={ 
// 空}
const ACTION_EQUIP_DEL = "/equip/del";
// 2.14.5 修改装备配置
// 路由	/equip_cfg/modify
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// Equip_cfg:”12321312”
// } 
// 返回值	Data={  
// 空}
const ACTION_EQUIP_CFG_MODIFY = "/equip_cfg/modify";
// /pet_cfg/modify
// 宠物装备配置修改
// {
// gid string
// sid string
// pet_cfg string
// }
const ACTION_PET_CFG_MODIFY = "/pet_cfg/modify";

// 2.14.6修改装备(融合装备,修改,删除并用)
// 路由	/equip/modify1
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,
// Now={“唯一的ID”:参考7.5,全字段提交}, map类型
// consume=”物品表id_数量,物品表id_数量” 消耗道具,可为空
// Logs=操作描述
// del_list=”装备ID,装备ID”
// add_item "itemid_数量,多个" 增加物品
// } 
// 返回值	Data={ 
// Consume=提交id 对应返回 扣过的值,如果材料类型 0返回空
// }
const ACTION_EQUIP_MODIFY1 = "/equip/modify1";
// 2.14.7 修改装备2(修改,宝石删除并用)
// 路由	/equip/modify2
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,
// Now={“唯一的ID”:参考7.5,全字段提交}, map类型 单个对象
// consume=”物品表id_数量,物品表id_数量” 消耗道具,可为空
// Logs=操作描述
// del_list=”宝石id _item_id,....”
// } 
const ACTION_EQUIP_MODIFY2= "/equip/modify2";
// 2.15.1 升级
// 路由	/hun_qi/upgrade
// 请求类型	POST    
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “bid”=”xxx唯一32位id” 魂器
// } 
// 返回值	Data={  
// Hq={}升级后背包对象,
// Sp={}升级后碎片对象 number=x,可能为空
// }
const ACTION_HUN_QI_UPGRADE = "/hun_qi/upgrade";
// 2.15.2 碎片合成
// 路由	/hun_qi_sp/upgrade
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “quality”:int 最大品质 不在品质+1
// “bid”=”xxx唯一32位id” 魂器碎片
// } 
// 返回值	Data={  
// Lsp={}消耗碎片对象, number=x,可能为空
// nsp={}升级后碎片对象
// }
const ACTION_HUN_QI_SP_UPGRADE = "/hun_qi_sp/upgrade";
// 2.15.3 创建
// 路由	/hun_qi/create
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// Item_id= int 
// } 
// 返回值	Data={  
// Item 返回魂器对象
// }
const ACTION_HUN_QI_CREATE = "/hun_qi/create";
// 2.16.1 升级
// 路由	/pet/upgrade
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “bid”=”xxx唯一32位id” 魂器
// } 
// 返回值	Data={  
// Pet={}升级后背包对象,
// Sp={}升级后碎片对象 number=x,可能为空
// }
const ACTION_PET_UPGRADE = "/pet/upgrade";
// 2.16.2 合成碎片
// 路由	/pet_sp/upgrade
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “quality”:int 最大品质 不在品质+1
// “bid”=”xxx唯一32位id” 魂器碎片
// } 
// 返回值	Data={  
// Lsp={}消耗碎片对象, number=x,可能为空
// nsp={}升级后碎片对象
// }
const ACTION_PET_SP_UPGRADE = "/pet_sp/upgrade";
// 2.16.3 出战宠物
// 路由	/pet/played_pet
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,  
// “bid”=”xxx唯一32位id” 宠物唯一id
// } 
// 返回值	Data={  
// 空
// }
const ACTION_PET_PLAYED_PET = "/pet/played_pet";
// 2.16.4 取消出战宠物
// 路由	/pet/un_played_pet
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   
// } 
// 返回值	Data={  
// 空
// }
const ACTION_PET_UN_PLAYED_PET = "/pet/un_played_pet";
// 2.16.1 v2 获取我的宠物
// 路由	/pet/get
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid" : "1308661008", 
// "limit" : number , 数量
// "cache_md5" : "上次返回的md5"
// } 
// 返回值	Data=!
// Code= 204 数据未发生变化使用之前缓存Code=1 才有后续数据
// Data=[] 参考 7.8
// Cache md5= 当前数据效验值
// }
const ACTION_PET_GET = "/pet/get";

// 2.16.2 v2 宠物继承经验
// 路由	/pet/inherit_experience
// 请求类型	POST
// 请求数据	参考: pet2经验给pet1
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “pet1”:宠物1唯一id
// “pet2”:宠物2唯一id,
// Consume:”道具表id_数量_特殊道具唯一ID, 多个,分割”
// *itemid 和唯一id 不要重复
// } 
// 返回值	Data={
// Pet1=完整结构
// Pet2=完整结构
// Item=消耗后的个数
// }
const PET_INHERIT_EXPERIENCE = "/pet/inherit_experience";

// 2.16.3 v2 宠物锁定
// 路由	/pet/locks
// 请求类型	POST
// 请求数据	{"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “pet”:宠物唯一id,
// locks: int 0,1
// } 
// 返回值	Data={  
// Pet=完整结构 
// }
const PET_LOCKS = "/pet/locks";

// 2.16.4 宠物添加经验

// 路由	/pet/add_exp
// 请求类型	POST
// 请求数据	{"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “pet”:宠物唯一id,
// number:xx int 添加的经验} 
// 返回值	Data={  
// Pet=完整结构 ,
// item_56 =剩余经验
// }
const PET_ADD_EXP = "/pet/add_exp";

// 2.16.5 宠物分解
// 路由	/pet/resolve
// 请求类型	POST
// 请求数据	{"gid":"2022121215465110000",
// "sid":”1308661008” , 
// “pet”:宠物唯一id 多个,分割
// } 
// 返回值	Data={  
// Gits=参考7.1 数组
// Fj =宠物唯一id完成分解的 ,分割
// }
const PET_RESOLVE = "/pet/resolve";
// 2.16.6 宠物属性修改
// /pet/custom_modify
// {
// gid=(string)局内id,
// sid=(string)用户id,
// only_id=(string)宠物唯一id
// custom={a2,custom,a3=(string)}都未空不传递 否则是[]不是{} 报错 (选填)
// consume= onlyid_itemid_数量,多个 (选填)
// logs = 道具消耗描述
// }
// return {
// consumeCurrent 消耗道具 通用返回}
const PET_CUSTOM_MODIFY = "/pet/custom_modify";

// 2.17 获取时间特权
// 路由	/get_time_item_list
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   
// } 
// 返回值	Data=道具列表id_时间,多个  到期不返回
const ACTION_GET_TIME_ITEM_LIST = "/get_time_item_list";
// 2.18 通用分解
// 路由	/general_decomposition
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   
// “bid”:”xxxx,xxx,xxx”唯一id,string 
// } 
// 返回值	Data={空}
// }
const ACTION_GENERAL_DECOMPOSITION = "/general_decomposition";
// 2.19 宝石 
// 2.19.1 添加宝石
// 路由	/gem/add
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// show:”描述 尽量简洁”  
// list=Map类型 {“a1”:{customs=customs,item_id=int},”a2”:{customs=Customs,item_id=int}}
// } 
// 返回值	Data={
// 新增的道具
// “背包id”:{
// 参考7.2
// }
const ACTION_GEM_ADD = "/gem/add";
// 2.19.2 删除宝石 
// 路由	/gem/del
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , 
// show:”描述 尽量简洁”  
// list=id!item_id!item_id_id!item_id_id!item_id 
// }
// 返回值	Data={ 
// 空

// }
const ACTION_GEM_DEL = "/gem/del";
// 2.19.3 查看宝石背包
// 路由	/gem/get
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   
// } 
// 返回值	Data={
// “背包id”:{
// 参考7.2
// }

// }
const ACTION_GEM_GET = "/gem/get";
// 2.20.1 获取通行证
// 路由	/my_pass/get
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   
// } 
// 返回值	Data={
// 参考7.6
// }
const MY_PASS_GET = "/my_pass/get";
// 2.20.1 获取通行证    
// 路由	/my_pass/get
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   
// } 
// 返回值	Data={
// 参考7.6
// }
const MY_PASS_DRAW = "/my_pass/draw";

// 2.22 LUA消耗道具
// 路由	/cost_item
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,  
// consume=”背包id_(道具ID)_数量, 多个”删除道具可为空
// Logs=”后台变化日志插入尽量短值”
// } 
// 返回值	Data={
// Item_id=数量 
// 数量<=0 不返回
// }
const COST_ITEM = "/cost_item";
// 2.23lua添加道具
// 路由	/add_item
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,  
//  add_item=”ItemID_数量, 多个”道具表唯一id
// Logs=”后台变化日志插入尽量短值”
// } 
// 返回值	Data={ nil 这个需要特定返回
// }
const ADD_ITEM = "/add_item";
// 2.24 通关商人
// 2.24.1 生成/获取
// 路由	/merchant/get/v2
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   } 
// 返回值	{
// Info=”游戏难度_库概率_随机值”,
// List={
// Steam_id={
// I=2级库 type 值,
//  Pt={
// *值=0 或者 “” 自动压缩数据 不返回 根据key 默认补返回值
// id        int      //列表ID
// types     int      //是否固定物品
// cost_types int  //价格类型
// cost      int     //价格
// zk        int      //折扣
// l_cost     int     //原价
// item_id    int    //道具ItemID
// number    int     //道具数量
// state     int    //0待购买 1 已购买
// }
//  Vip=pt 结构相同
// }
// }


// }
const MERCHANT_GET = "/merchant/get/v2";
// 2.24.2 购买
// 路由	/merchant/buy
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,  
// Index:购买引索 位置 从0开始} 
// 返回值	Data={ 参考7.7
// }
const MERCHANT_BUY = "/merchant/buy";

// 2.25 宠物蛋奖励
// 2.25.1 获取
// 路由	/get_pet_award
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” ,   } 
// 返回值	Data={ 
// .number 抽奖数记录,
// .pet_award 当前领取到ID
// }
const GET_PET_AWARD = "/get_pet_award";

// 2.25.3 领取
// 路由	/git_pet_award
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000",
// "sid":”1308661008” , index=int 领取id  } 
// 返回值	Data={ 
// .number 抽奖数记录,
// .pet_award 当前领取到ID
// }
const GitPetAward = "/git_pet_award";


// 2.26.1 获取累计充值信息
// 累计充值 奖励表道具表
// /get_cumulative_recharge	{获取信息}
// {gid="局内唯一id",sid="steam_id"}
// 返回:
// cumulative_recharge=领取到的id
// number=累充 数量
const GetCumulativeRecharge = "/get_cumulative_recharge";

// 2.26.3 累计充值领取
// 路由	/git_cumulative_recharge
// 请求类型	POST
// 请求数据	参考:
// /git_cumulative_recharge	{领取}
// {gid="局内唯一id",sid="steam_id",index =int(表id)}
// 返回:
// cumulative_recharge=领取到的id
// number=累充 数量
const GitCumulativeRecharge = "/git_cumulative_recharge";
	
// 3.1商城购买
// 路由	/shopping_buy
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":”1308661008”,”index_id”:int(商城表id),”buy_types”:int(购买方式),’number’: int 购买} 
// 返回值	Data={item=[]ToGetLog,limit=map[int]购买时间_次数 限购信息}
const ACTION_SHOPPING_BUY = "/shopping_buy";
// 3.1 商城购买-宠物
// /pet/lua_add
// {
// gid=(string)局内id,
// sid=(string)用户id, 
// consume= onlyid_itemid_数量,多个 (选填)
// pet={
// 	item_id:int 必填
// 	a1,a2,a3 string 选填
// }
// logs string  描述
// }
const PET_LUA_ADD = "/pet/lua_add";

// 3.2获取商城复购
// 路由	/shopping_limit_get
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":”1308661008”} 
// 返回值	Data=map[int]购买时间_次数 限购信息
const ACTION_SHOPPING_LIMIT_GET = "/shopping_limit_get";

// 3.3 抽奖
// 路由	/draw_lottery
// 请求类型	POST
// 请求数据	参考:
// {"gid":"2022121215465110000","sid":”1308661008”
// types int 对应配置库类型
// number int 抽奖次数

// } 
// 返回值	Data={
// Git=[]togetlog,
// player_info=基础信息 参考7.3


// }

const ACTION_DRAW_LOTTERY = "/draw_lottery";


const ACTION_GET_SERVER_DRAW_ACC = "/get_server_draw_acc"

const ACTION_GET_SERVER_PASS = "/get_server_pass"

// 排行榜 设置
// /ranking_list/set
// froms=类型int
// info={
// a1 string //steamID ,分割多个 
// a2 string //自定义字段存储显示信息
// a3 int64 //排序字段1
// a4 int64 //排序字段2
// a5 int64 //提交时间排序3  -提交忽略
// }
const RANKING_LIST_SET = "/ranking_list/set";
// 获取
// /ranking_list/get
// types=1  int 当前排行榜 2奖励排行榜
// sid=steamid string
// froms=类型int
// start= int 开始排名 从0开始
// limit int 获取数据个数 
const RANKING_LIST_GET = "/ranking_list/get";

// /operation_day_info 
// gid string 局内id
// sid string steamid
// consume string 消耗 唯一iD_道具列表id_数量 多个,分割 和消耗道具接口一样的参数
// symbol string + -
// number int 变化值 必须是正数
// key string  引索key lua控制
// add_item string 添加道具 道具列表id_数量多个,分割
// show string 道具变化描述

const OPERATION_DAY_INFO = "/operation_day_info";
//修改物品的customs 属性
// /item_modify_custom
// {
// gid string 游戏唯一id
// sid string 用户steamid
// logs string 操作说明(道具变化显示)少字
// consume onlyid_itemid_数量,多个
// item  map{ string 道具唯一id}={ 可为空
// 	customs string  不能为空"" 可以等于"{}" 
// }
// }
const ITEM_MODIFY_CUSTOM = "/item_modify_custom";