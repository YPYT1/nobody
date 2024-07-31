
// import { reloadable } from "../../../utils/tstl-utils";
// import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
// import * as RuneSystemJson from "../../../json/config/game/rune_system.json";

// /** 符文相关 */
// @reloadable
// export class RuneSystem extends UIEventRegisterClass {
//     //玩家符文获得信息
//     PlayerRuneData: { [player: number]: PlayerRuneDataProps } = {};
//     //每个玩家可选列表
//     PlayerUpgradePool : { [player: number]: { key: string[], pro: number[]; }} = {};
//     //选择数据
//     PlayerSelectData : PlayerRuneSelectServerData[] = [];
//     //符文刷新次数
//     PlayerRefreshCount: number[] = [];
//     //可选最大值
//     PlayerRuneSelectMax: number[] = [];
//     //玩家单次最大随机数量
//     PlayerSelectCount: number[] = [];
    
//     PointCount : number[] = [] //点数

//     ConsumePointCount : number[] = [] //已使用的点数
//     //高级符文列表结果列表
//     AdvRuneUnlockConfig : {
//         [key: string]: { //解锁条件
//            key : string, //所需符文
//            val : number, //所需数量
//         }[],
//     } = {};

//     constructor() {
//         super("RuneSystem")
//         //配置初始化
//         for (let index = 0; index < 6; index++) {
//             this.PlayerRefreshCount.push(GameRules.PUBLIC_CONST.PLAYER_RUNE_REFRESH_COUNT)
//             this.PlayerSelectCount.push(GameRules.PUBLIC_CONST.PLAYER_RUNE_SELECT_MAX)
//             this.PlayerRuneSelectMax.push(GameRules.PUBLIC_CONST.PLAYER_RUNE_SELECT_MAX);
//             this.PlayerSelectData.push({
//                 "rune_list" : {},
//                 "is_select" :  0
//             });
//             this.PointCount.push(0);
//             this.ConsumePointCount.push(0);
//         }
//         for (let [key, RowData] of pairs(RuneSystemJson)) {
//             if(RowData.IsAdv == 1){
//                 let UnlockCondition = RowData.UnlockCondition;
//                 let UnlockConfig : { 
//                     key : string, //所需符文
//                     val : number, //所需数量    
//                  }[] = [];
//                 let ConditionList = UnlockCondition.split(",");
//                 for (const iterator of ConditionList) {
//                     let ConditionList = iterator.split("&");
//                     UnlockConfig.push({
//                         key : ConditionList[0],
//                         val : parseInt(ConditionList[1]),
//                     })
//                 }
//                 this.AdvRuneUnlockConfig[key] = UnlockConfig;   
//             }
//         }
//     }

//     /**
//      * 获取当前升级选项 
//      * 1.默认是3个,如果其他则可以多选
//      * 2.符合条件后会出现特殊升级
//      */
//     CreatRuneSelectData(player_id: PlayerID , param : CGED["RuneSystem"]["CreatRuneSelectData"]) {
//         if (this.PlayerSelectData[player_id].is_select == 0) {
//             //最多几样物品
//             let amount = this.PlayerSelectCount[player_id];
//             //循环计数器
//             let amount_count = 0;
//             let amount_max = 50;
//             //返回数据
//             let ret_data: { [key: string]: PlayerRuneSelectServer; } = {};
//             let shop_wp_list: string[] = [];
//             let PlayerRuneData = this.PlayerRuneData[player_id];
//             for (let index = 1; index <= amount; index++) {
//                 amount_count ++;
//                 if(amount_count > amount_max ){
//                     break;
//                 }
//                 let rune_count = 0;
//                 let key_list = this.PlayerUpgradePool[player_id].key;
//                 let pro_list = this.PlayerUpgradePool[player_id].pro;
//                 let rune_key = key_list[GetCommonProbability(pro_list)];
//                 let RuneSystem = RuneSystemJson[rune_key as keyof typeof RuneSystemJson];
//                 //重复物品跳过
//                 if (shop_wp_list.includes(rune_key)) {
//                     //跳过本次 
//                     index--;
//                     continue;
//                 } 
//                 //获取当前数量
//                 if(PlayerRuneData.hasOwnProperty(rune_key)){
//                     rune_count = PlayerRuneData[rune_key];
//                 }
//                 // 超过等级也 跳过
//                 if (rune_count >= RuneSystem.CountMax) {
//                     //跳过本次 
//                     index--;
//                     continue;
//                 }
//                 ret_data[index] = { 
//                     key: rune_key, 
//                 };
//                 shop_wp_list.push(rune_key);
//             }
//             this.PlayerSelectData[player_id].rune_list = ret_data;
//             //修改为已刷新
//             this.PlayerSelectData[player_id].is_select = 1;
//         }
//         if(GameRules.PUBLIC_CONST.IS_AUTO_SELECT_RUNE == 1 && this.PointCount[player_id] > 0){
//             //自动选第一个
//             this.PostSelectRune(player_id , { index : 1})
//         }else{
//             this.GetRuneSelectData(player_id, param);
//         }
        
//     }

//     /**
//      * 选择列表
//      */
//     PostSelectRune(player_id: PlayerID, params: CGED["RuneSystem"]["PostSelectRune"]) {
//         let index = params.index;
//         if (this.PointCount[player_id] > 0) {
            
//             let PlayerSelectDataInfo = this.PlayerSelectData[player_id];
//             if (!PlayerSelectDataInfo.rune_list.hasOwnProperty(index)) {
//                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "没有此选项！！！");
//                 return;
//             }
//             if (PlayerSelectDataInfo.is_select == 0) {
//                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "已选择！！！！");
//                 return;
//             }

//             //技能点减少
//             this.PointCount[player_id] --;
//             //已使用的技能点
//             this.ConsumePointCount[player_id] ++;   
//             let rune_key = PlayerSelectDataInfo.rune_list[index].key;
//             // let RuneData = RuneSystemJson[rune_key as keyof typeof RuneSystemJson];
//             // let RuneCount = 0; //符文数量
//             //初始化技能
//             if(this.PlayerRuneData[player_id].hasOwnProperty(rune_key)){
//                 this.PlayerRuneData[player_id][rune_key] += 1;
//                 // RuneCount = this.PlayerRuneData[player_id][rune_key];
//             }else{
//                 this.PlayerRuneData[player_id][rune_key] = 1
//             }
//             //解锁其他技能 并移除自身可选
//             for (const key in this.AdvRuneUnlockConfig) {
//                 const unconfig = this.AdvRuneUnlockConfig[key];
//                 let unlock = true;
//                 for (const iterator of unconfig) {
//                     if(this.PlayerRuneData[player_id].hasOwnProperty(iterator.key)){
//                         let playerrunecount = this.PlayerRuneData[player_id][iterator.key]
//                         if(playerrunecount < iterator.val){
//                             unlock = false;
//                             break
//                         }
//                     }else{
//                         break
//                     }
//                 }
//                 let RuneWeight = RuneSystemJson[rune_key as keyof typeof RuneSystemJson].Weight;
//                 if(unlock == true){
//                     this.PassRuneKeySetWeight(player_id , key , RuneWeight);
//                 }
//             }
//             this.PlayerSelectData[player_id].is_select = 0;
//             this.CreatRuneSelectData(player_id , {});
//         } else {
//             // GameRules.Cmsg();
//             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "缺少技能点");
//         }
//     }

//     /**
//      * 设置池子出现概率
//      * @param Ability 技能名字
//      * @param CodeID 技能code
//      * @param Weight 设置的权总值
//      */
//     PassRuneKeySetWeight(PlayerId : PlayerID, RuneKey : string , Weight : number){
//         let index = this.PlayerUpgradePool[PlayerId].key.indexOf(RuneKey);
//         if(index != -1){
//             print("RuneKey :" ,RuneKey)
//             this.PlayerUpgradePool[PlayerId].pro[index] = Weight;
//         }else{
//             print("arms_evolution 表配置错误")
//         }
        
//     }



//     /**
//      * 获取符文点数等
//      */
//     GetRuneSelectData(player_id: PlayerID, params: CGED["RuneSystem"]["GetRuneSelectData"]) {
//         //商店组成 1未刷新 2未挑战
//         let data : PlayerRuneSelectRetData = {
//             Data: this.PlayerSelectData[player_id] , //列表
//             EvolutionPoint : this.PointCount[player_id], //技能点
//             ConsumeEvolutionPoint : this.ConsumePointCount[player_id] //已使用的技能点
//         };
//         CustomGameEventManager.Send_ServerToPlayer(
//             PlayerResource.GetPlayer(player_id),
//             "RuneSystem_GetRuneSelectData",
//             {
//                 data
//             }
//         );
//     }

//     /**
//      * 获取玩家符文数据
//      */
//     GetRuneData(player_id: PlayerID, params: CGED["RuneSystem"]["GetRuneData"]) {
//         CustomGameEventManager.Send_ServerToPlayer(
//             PlayerResource.GetPlayer(player_id),
//             "RuneSystem_GetRuneData",
//             {
//                 data : this.PlayerRuneData[player_id]
//             }
//         );
//     }

//     /**
//      * 获得随机符文的信息
//      */
//     GetRuneRandomData(player_id: PlayerID , rune_key : string) {
//         CustomGameEventManager.Send_ServerToPlayer(
//             PlayerResource.GetPlayer(player_id),
//             "RuneSystem_GetRuneRandomData",
//             {
//                 data : rune_key
//             }
//         );
//     }
//     /**
//      * 增加点数
//      */
//     AddPointCount(player_id: PlayerID , count : number ){
//         this.PointCount[player_id] += count;
//         this.GetRuneSelectData(player_id , {});
//     }


//     /** 初始化玩家的符文所有数据 */
//     InitPlayerUpgradeStatus(player_id: PlayerID) {

//         this.PlayerRuneData[player_id] = {};

//         this.PlayerSelectData[player_id] = {
//             "rune_list" : {},
//             "is_select" :  0
//         };
//         this.PointCount[player_id] = 0;

//         this.ConsumePointCount[player_id] = 0;

//         this.PlayerUpgradePool[player_id] = {
//             key : [],
//             pro : [],
//         }
//         for (let [key, RowData] of pairs(RuneSystemJson)) {
//             this.PlayerUpgradePool[player_id].key.push(key);
//             this.PlayerUpgradePool[player_id].pro.push(RowData.Weight);
//         }
//     }


//     /**
//      * 随机获得一个符文
//      */
//     RuneRandom(player_id: PlayerID) {
//         //记录获得的次数
//         this.ConsumePointCount[player_id] ++;   

//         //循环计数器
//         let amount_count = 0;
//         let amount_max = 50;
//         let rune_key = "";
//         //返回数据
//         let PlayerRuneData = this.PlayerRuneData[player_id];
//         for (let index = 1; index <= 1; index++) {
//             amount_count ++;
//             if(amount_count > amount_max ){
//                 print("已经没有可获得的符文了....")
//                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "符文系统:错误....");
//                 return
//             }
//             let rune_level = 0;
//             let key_list = this.PlayerUpgradePool[player_id].key;
//             let pro_list = this.PlayerUpgradePool[player_id].pro;
//             rune_key = key_list[GetCommonProbability(pro_list)];
//             let RuneSystem = RuneSystemJson[rune_key as keyof typeof RuneSystemJson];
//             //重复物品跳过
//             //获取当前等级
//             if(PlayerRuneData.hasOwnProperty(rune_key)){
//                 rune_level = PlayerRuneData[rune_key];
//             }
//             // 超过等级跳过本次循环
//             if (rune_level >= RuneSystem.CountMax) {
//                 //跳过本次 
//                 index--;
//                 continue;
//             }
//         }

//         // let RuneData = RuneSystemJson[rune_key as keyof typeof RuneSystemJson];
//         // let RuneCount = 0; //符文数量
//         //初始化技能
//         if(this.PlayerRuneData[player_id].hasOwnProperty(rune_key)){
//             this.PlayerRuneData[player_id][rune_key] += 1;
//             // RuneCount = this.PlayerRuneData[player_id][rune_key];
//         }else{
//             this.PlayerRuneData[player_id][rune_key] = 1
//         }
//         //解锁其他技能 并移除自身可选
//         for (const key in this.AdvRuneUnlockConfig) {
//             const unconfig = this.AdvRuneUnlockConfig[key];
//             DeepPrintTable(unconfig);
//             let unlock = true;
//             for (const iterator of unconfig) {

//                 if(this.PlayerRuneData[player_id].hasOwnProperty(iterator.key)){
//                     let playerrunecount = this.PlayerRuneData[player_id][iterator.key]

//                     if(playerrunecount < iterator.val){
//                         unlock = false;
//                         break
//                     }
//                 }else{
//                     unlock = false;
//                     break
//                 }
//             }
//             let RuneWeight = RuneSystemJson[rune_key as keyof typeof RuneSystemJson].Weight;
//             //如果存在可以解锁的符文 则调用解锁方法
//             if(unlock == true){
//                 this.PassRuneKeySetWeight(player_id , key , RuneWeight);
//             }
//         }
//         //初始化符文给对应玩家
//         this.InitRune(player_id , rune_key)

//         this.GetRuneRandomData(player_id , rune_key)
//         this.GetRuneData(player_id, {});
//     }
    
//     InitRune(player_id: PlayerID , rune_name : string){

//     }

//     /**
//      * 获取一个指定符文
//      */
//     GetRuneByName(player_id: PlayerID , rune_name : string) {
//         //记录获得的次数
//         this.ConsumePointCount[player_id] ++;   

//         let rune_key  = rune_name;

//         if(rune_key == ""){
//             print("不能为空")
//             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "符文系统:错误....");
//             return 
//         }
//         if(!RuneSystemJson.hasOwnProperty(rune_key)){
//             print("符文不存在")
//             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "符文系统:错误....");
//             return 
//         }
        
//         // let RuneData = RuneSystemJson[rune_key as keyof typeof RuneSystemJson];
//         // let RuneCount = 0; //符文数量
//         //初始化技能
//         if(this.PlayerRuneData[player_id].hasOwnProperty(rune_key)){
//             this.PlayerRuneData[player_id][rune_key] += 1;
//             // RuneCount = this.PlayerRuneData[player_id][rune_key];
//         }else{
//             this.PlayerRuneData[player_id][rune_key] = 1
//         }
//         //解锁其他技能 并移除自身可选
//         for (const key in this.AdvRuneUnlockConfig) {
//             const unconfig = this.AdvRuneUnlockConfig[key];
//             let unlock = true;
//             for (const iterator of unconfig) {

//                 if(this.PlayerRuneData[player_id].hasOwnProperty(iterator.key)){
//                     let playerrunecount = this.PlayerRuneData[player_id][iterator.key]

//                     if(playerrunecount < iterator.val){
//                         unlock = false;
//                         break
//                     }
//                 }else{
//                     unlock = false;
//                     break
//                 }
//             }
//             let RuneWeight = RuneSystemJson[rune_key as keyof typeof RuneSystemJson].Weight;
//             //如果存在可以解锁的符文 则调用解锁方法
//             if(unlock == true){
//                 this.PassRuneKeySetWeight(player_id , key , RuneWeight);
//             }
//         }

//         this.InitRune(player_id , rune_key)


//         this.GetRuneRandomData(player_id , rune_key)
//         this.GetRuneData(player_id, {});
//     }

//     /**
//      * 火力技升级 加入池子
//      * @param player_id 
//      * @param ability_name 
//      */
//     ArmsJoinPool(player_id: PlayerID, ability_name: string) {

//     }

//     /**
//      * 火力技移除,并返回对应选择次数
//      */
//     ArmsRefund(player_id: PlayerID, ability_name: string) {

//     }
 

//     Debug(cmd: string, args: string[], player_id: PlayerID) {
//         if (cmd == "-sevo") {
//             this.AddPointCount(player_id , 10);
//         }
//         if (cmd == "-rune_getup" || cmd == "-rg") {
//             this.GetRuneSelectData(player_id, {});
//         }
//         if (cmd == "-rune_creat" || cmd == "-rc") {
//             this.CreatRuneSelectData(player_id, {});
//         }
//         if(cmd == "-rune_add"){
//              let count = parseInt(args[0]) ?? 1;
//              this.AddPointCount(player_id , count);
//         }
//         if(cmd == "-rune_select" || cmd == "-rs"){
//             let index = parseInt(args[0]) ?? 1;
//             this.PostSelectRune(player_id , {
//                 index : index,
//             });
//         }

//         if(cmd == "-rune_init" ){
//             this.InitPlayerUpgradeStatus(player_id)
//         }

//         if(cmd == "-RR"){
//             this.RuneRandom(player_id)
//         }

//         if(cmd == "-RN"){
//             let runename = args[0] ?? "";
//             this.GetRuneByName(player_id , runename)
//         }

//         if(cmd == "-wd"){
//             print("-wudi!!!!!!!!!!!!!!")
//             let hero = PlayerResource.GetSelectedHeroEntity(player_id);
//             GameRules.CustomAttribute.ModifyAttribute(hero , {
//                 "AttackDamage" : {
//                     "Base" : 10000,
//                 },
//                 "AttackSpeed" : {
//                     "Base" : 1000
//                 },
//                 "HealthPoints" : {
//                     "Base" : 100000,
//                 }
//             })
//         }
//     }
// }