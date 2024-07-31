
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import * as ArmsEvolutionJson from "../../../json/config/game/arms_evolution.json";
interface EvolutionTableProps {
    [ability: string]: {
        [code: string]: {
            id: string,
            kv: typeof ArmsEvolutionJson[keyof typeof ArmsEvolutionJson]
        }
    }
}

/** 技能升级相关 */
@reloadable
export class ArmsEvolution extends UIEventRegisterClass {
    //玩家技能选择信息
    PlayerUpgradeStatus: { [player: number]: PlayerUpgradeStatusProps } = {};
    //技能数据
    EvolutionTable: EvolutionTableProps;
    //每个玩家可选列表
    PlayerUpgradePool : { [player: number]: { key: string[], pro: number[]; }} = {};
    //选择数据
    PlayerSelectData : PlayerUpgradeSelectServerData[] = [];
    //技能刷新次数
    PlayerRefreshCount: number[] = [];
    //可选最大值
    PlayerArmsSelectMax: number[] = [];
    //玩家单次最大随机数量
    PlayerSelectAmount: number[] = [];
    
    EvolutionPoint : number[] = [] //技能点
    //玩家可用技能key
    PlayerArmsKeyList : string[][] = []; 

    ConsumeEvolutionPoint : number[] = [] //已使用的技能点
    constructor() {
        super("ArmsEvolution")
        this.InitArmsEvolutionTable()
        //配置初始化
       for (let index = 0; index < 6; index++) {
            this.PlayerRefreshCount.push(GameRules.PUBLIC_CONST.PLAYER_REFRESH_COUNT)
            this.PlayerSelectAmount.push(GameRules.PUBLIC_CONST.PLAYER_ARMS_SELECT_MAX)
            this.PlayerArmsSelectMax.push(999);
            this.PlayerSelectData.push({
                "arms_list" : {},
                "is_select" :  0 ,
                "index" : 0,
            });
            this.EvolutionPoint.push(0);
            this.ConsumeEvolutionPoint.push(0);
            this.PlayerArmsKeyList.push([]);
       }
    }
    /**
     * 加载kv表配置
     */
    InitArmsEvolutionTable() {
        this.EvolutionTable = {};
        for (const iterator in ArmsEvolutionJson) {
            let RowData = ArmsEvolutionJson[iterator as keyof typeof  ArmsEvolutionJson];
            RowData.CodeID
        }
        for (let [id, RowData] of pairs(ArmsEvolutionJson)) {
            let Ability = RowData.Ability;
            if (this.EvolutionTable[Ability] == null) {
                this.EvolutionTable[Ability] = {}
            }
            let code_id = RowData.CodeID;
            // let Object = { ...RowData, ...{ ID: id as string } };
            this.EvolutionTable[Ability][code_id] = {
                id: id,
                kv: RowData
            };
        }
    }

    /**
     * 获取当前升级选项 
     * 1.默认是3个,如果其他则可以多选
     * 2.符合条件后会出现特殊升级
     */
    CreatArmssSelectData(player_id: PlayerID , param : CGED["ArmsEvolution"]["CreatArmssSelectData"]) {
        if (this.PlayerSelectData[player_id].is_select == 1) {
            //修改为已刷新
            this.PlayerSelectData[player_id].is_select = 1;
            //最多几样物品
            let amount = this.PlayerArmsSelectMax[player_id];
            //循环计数器
            let amount_count = 0;
            let amount_max = 50;
            //返回数据
            let ret_data: { [key: string]: PlayerUpgradeSelectServer; } = {};
            let shop_wp_list: string[] = [];
            let PlayerAbilityData = this.PlayerUpgradeStatus[player_id].abilitydata;
            for (let index = 1; index <= amount; index++) {
                let arms_sub = this.PlayerArmsKeyList[player_id].length;
                amount_count ++;
                if(amount_count > amount_max ){
                    break;
                }
                //是否超限
                if (index > arms_sub) {
                    break;
                }
                let arms_level = 0;
                let key_list = this.PlayerUpgradePool[player_id].key;
                let pro_list = this.PlayerUpgradePool[player_id].pro;
                let arms_key = key_list[GetCommonProbability(pro_list)];
                let ArmsEvolutionData = ArmsEvolutionJson[arms_key as keyof typeof ArmsEvolutionJson];
                //重复物品跳过
                if (shop_wp_list.includes(arms_key)) {
                    //跳过本次 
                    index--;
                    continue;
                }
                //获取当前等级
                if(PlayerAbilityData.hasOwnProperty(ArmsEvolutionData.Ability)){
                    if(PlayerAbilityData[ArmsEvolutionData.Ability].upgrades.hasOwnProperty(ArmsEvolutionData.CodeID)){
                        arms_level = PlayerAbilityData[ArmsEvolutionData.Ability].upgrades[ArmsEvolutionData.CodeID];
                    }
                }
                // 超过等级也 跳过
                if (arms_level >= ArmsEvolutionData.Limit) {
                    //跳过本次 
                    index--;
                    continue;
                }
                ret_data[index] = { 
                    key: arms_key, 
                    
                };
                shop_wp_list.push(arms_key);
            }
            this.PlayerSelectData[player_id].arms_list = ret_data;
            
        }
        // this.GetArmssSelectData(player_id, param);
    }

    /**
     * 选择列表
     */
    PostSelectArms(player_id: PlayerID, params: CGED["ArmsEvolution"]["PostSelectArms"]) {
        let index = params.index;
        if (this.EvolutionPoint[player_id] > 0) {
            
            let PlayerSelectDataInfo = this.PlayerSelectData[player_id];
            if (!PlayerSelectDataInfo.arms_list.hasOwnProperty(index)) {
                
                print("没有此选项！！！");
                return;
            }
            if (PlayerSelectDataInfo.is_select == 0) {
                print("已被选择！！！！");
                return;
            }

            //技能点减少
            this.EvolutionPoint[player_id] --;
            //已使用的技能点
            this.ConsumeEvolutionPoint[player_id] ++;
            let arms_key = PlayerSelectDataInfo.arms_list[index].key;
            let ArmsEvolutionData = ArmsEvolutionJson[arms_key as keyof typeof ArmsEvolutionJson];
            let AbilityName = ArmsEvolutionData.Ability; //技能名
            let CodeID = ArmsEvolutionData.CodeID; //技能code
            let IsAdv = ArmsEvolutionData.IsAdv; //是否高级技能
            let Limit = ArmsEvolutionData.Limit; //满级检查
            let AbilityLV = 0; //技能等级
            //初始化技能
            if(!this.PlayerUpgradeStatus[player_id].abilitydata.hasOwnProperty(AbilityName)){
                this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName] = {
                    calculatecount : 0,
                    count : 0 ,
                    upgrades :{

                    }
                }
            }
            //增加裂变等级
            if(this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].upgrades.hasOwnProperty(CodeID)){
                this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].upgrades[CodeID] += 1;
            }else{
                this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].upgrades[CodeID] = 1;
            }
            if(this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].upgrades[CodeID] >= Limit){
                this.CheckLimit(player_id , arms_key)
            }
            
            //技能计数
            if(IsAdv == 0){
                this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].calculatecount += 1;
            }
            AbilityLV = this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].calculatecount;
            this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].count += 1;
            //是否可以解锁部分技能
            let is_Unlock = false;
            let UnlockIndex = -1;
            if(ArmsEvolutionData.UnlockCondition == "pass"){
                is_Unlock = true;
                UnlockIndex = 0;
            }else{
                if(ArmsEvolutionData.UnlockCondition.indexOf(",") != -1){
                    let UnlockConditionList = ArmsEvolutionData.UnlockCondition.split(",");
                    for (let i = 0; i < UnlockConditionList.length; i++) {
                        const element = UnlockConditionList[i];
                        if(element != "null"){
                            if(parseInt(element) == AbilityLV){
                                is_Unlock = true;
                                UnlockIndex = i
                                break;
                            }
                        }
                    }
                }
            }
            //解锁其他技能 并移除自身可选
            if(is_Unlock){
                let LockConditionParamList : string[] = [];
                if(ArmsEvolutionData.hasOwnProperty("LockConditionParam")){
                    LockConditionParamList  = ArmsEvolutionData["LockConditionParam"] as string[]
                }
                let UnlockConditionParamList : string[] = [];
                if(ArmsEvolutionData.hasOwnProperty("UnlockConditionParam_" + UnlockIndex)){
                    UnlockConditionParamList  = ArmsEvolutionData["UnlockConditionParam_" + UnlockIndex] as string[]
                }
                let ConditionParamList = LockConditionParamList.concat(UnlockConditionParamList);
                for (const iterator of ConditionParamList) {
                    let ConditionList = iterator.split("&");
                    if(ConditionList[0] && ConditionList[1]){
                        if(ConditionList[2]){
                            if(!this.PlayerUpgradeStatus[player_id].abilitydata[AbilityName].upgrades.hasOwnProperty(ConditionList[2])){
                                continue;
                            }
                        }
                        this.PassAbilityCodeIDSetWeight(player_id , ConditionList[0] , parseInt(ConditionList[1]));
                    }
                }
            }
            this.PlayerSelectData[player_id].is_select = 0;
            this.CreatArmssSelectData(player_id , {});
        } else {
            // GameRules.Cmsg();
            print("没有天赋点")
        }
    }

    /**
     * 设置池子出现概率
     * @param Ability 技能名字
     * @param CodeID 技能code
     * @param Weight 设置的权总值
     */
    PassAbilityCodeIDSetWeight(PlayerId : PlayerID, ArmsKey : string , Weight : number){
        let index = this.PlayerUpgradePool[PlayerId].key.indexOf(ArmsKey);
        if(this.PlayerUpgradePool[PlayerId].key.indexOf(ArmsKey) != -1){
            this.PlayerUpgradePool[PlayerId].pro[index] = Weight;
            if(this.PlayerArmsKeyList[PlayerId].indexOf(ArmsKey) == -1){
                this.PlayerUpgradePool[PlayerId].pro[index] = 0;
            }
        }else{
            print("arms_evolution 表配置错误")
        }
        
    }
    /**
     * 满级检查 并移除可选值
     * @param player_id 
     * @param Count 
     * @param Limit 
     * @param arms_key 
     */
    CheckLimit(PlayerId : PlayerID , ArmsKey : string){
        let PlayerArmsKeyListIndex = this.PlayerArmsKeyList[PlayerId].indexOf(ArmsKey);
        if(PlayerArmsKeyListIndex != -1){
            this.PlayerArmsKeyList[PlayerId].splice(PlayerArmsKeyListIndex , 1);
        }
    }



    /**
     * 获取物品信息初始化信息
     */
    // GetArmssSelectData(player_id: PlayerID, params: CGED["ArmsEvolution"]["GetArmssSelectData"]) {
    //     //商店组成 1未刷新 2未挑战
    //     let data : PlayerUpgradeSelectRetData = {
    //         Data: this.PlayerSelectData[player_id] , //列表
    //     };
    //     DeepPrintTable(data);
    //     DeepPrintTable(this.PlayerUpgradePool)
    //     DeepPrintTable(this.PlayerArmsKeyList)
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "TreasureSystem_GetShopsData",
    //         {
    //             data
    //         }
    //     );
    // }
    /**
     * 增加技能点
     */
    AddEvolutionPoint(player_id: PlayerID , count : number ){
        this.EvolutionPoint[player_id] += count;
        // this.GetArmssSelectData(player_id , {});
    }


    /** 初始化玩家的升级树所有数据 */
    InitPlayerUpgradeStatus(player_id: PlayerID) {
        this.PlayerUpgradeStatus[player_id] = {
            "abilitydata" : {},
        }
        this.PlayerUpgradePool[player_id] = {
            key : [],
            pro : [],
        }
        let abiliy_list = [
            "arms_2",
        ];
        for (const iterator of abiliy_list) {
            for (const key in this.EvolutionTable[iterator]) {
                //权重
                let Weight = this.EvolutionTable[iterator][key].kv.Weight;
                this.PlayerUpgradePool[player_id].key.push(this.EvolutionTable[iterator][key].id);
                this.PlayerUpgradePool[player_id].pro.push(Weight);
                this.PlayerArmsKeyList[player_id].push(this.EvolutionTable[iterator][key].id);
            }
        }
    }

    /**
     * 火力技升级 加入池子
     * @param player_id 
     * @param ability_name 
     */
    ArmsJoinPool(player_id: PlayerID, ability_name: string) {

    }

    /**
     * 火力技移除,并返回对应选择次数
     */
    ArmsRefund(player_id: PlayerID, ability_name: string) {

    }


    


    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-sevo") {
            DeepPrintTable(this.EvolutionTable)
        }
        if (cmd == "-arms_getup" || cmd == "-ag") {
            // this.GetArmssSelectData(player_id, {});
        }
        if (cmd == "-arms_creat") {
            this.CreatArmssSelectData(player_id, {});
        }
        if(cmd == "-arms_add"){
             let count = parseInt(args[0]) ?? 1;
             this.AddEvolutionPoint(player_id , count);
        }
        if(cmd == "-arms_select" || cmd == "-as"){
            let index = parseInt(args[0]) ?? 1;
            this.PostSelectArms(player_id , {
                index : index,
            });
       }
    }
}