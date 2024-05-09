
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import * as ArmsJson from "../../../json/abilities/arms.json";

/** 技能升级相关 */
@reloadable
export class NewArmsEvolution extends UIEventRegisterClass {
    //每个玩家可选列表
    PlayerUpgradePool : { 
        [player: number]: { //玩家
            [qualiy : number] : {  //品质
                key: string[], //物品key
                pro: number[]; //物品概率
            }
        } 
    } = {};

    ItemQmax : number = 7; //物品最高品质
    //技能点
    EvolutionPoint : number[] = [] 
    //已使用的技能点
    ConsumeEvolutionPoint : number[] = [] 

    //技能刷新次数
    PlayerRefreshCount: number[] = [];
    //玩家单次最大随机数量
    PlayerSelectAmount: number[] = [];
    //选择数据
    PlayerSelectData : PlayerUpgradeSelectServerData[] = [];
    //是否第一次选择
    PlayerFirstState : boolean[] = [];
    //第一次选择的技能
    PlayerUpgradePoolFirstData : string[][] = [];

    constructor() {
        super("NewArmsEvolution")
        for (let index = 0; index < GameRules.PUBLIC_CONST.PLAYER_COUNT; index++) {
            this.PlayerUpgradePool[index] = {};
            this.EvolutionPoint.push(0);
            this.PlayerRefreshCount.push(GameRules.PUBLIC_CONST.PLAYER_REFRESH_COUNT)
            this.PlayerSelectAmount.push(GameRules.PUBLIC_CONST.PLAYER_ARMS_SELECT_MAX)
            this.PlayerFirstState.push(false)
            this.PlayerUpgradePoolFirstData.push([])

            this.PlayerSelectData.push({
                "arms_list" : {},
                "is_select" :  0 ,
                "index" : 0,
            });
        }
    }
   /**
    * 初始化玩家可选物品概率(可重复调用)
    * @param player_id 
    */
   InitPlayerUpgradeStatus(player_id: PlayerID) {

        //重置生命
        GameRules.Spawn.player_life_list[player_id] = 2
        this.PlayerUpgradePool[player_id] = {};
        this.EvolutionPoint[player_id] = 0;
        this.AddEvolutionPoint(player_id , 1)
        this.PlayerFirstState[player_id] = true;
        this.PlayerSelectData[player_id] = {
            "arms_list" : {},
            "is_select" :  0 ,
            "index" : -1,
        };
        this.PlayerUpgradePoolFirstData[player_id] = [];
        
        for (const [key, val] of pairs(ArmsJson)) {
            if(val.Rarity > 0 && val.Disable){
                if(!this.PlayerUpgradePool[player_id].hasOwnProperty(val.Rarity)){
                    this.PlayerUpgradePool[player_id][val.Rarity] = {
                        key : [],
                        pro : [],
                    }
                }
                this.PlayerUpgradePool[player_id][val.Rarity].key.push(key);
                this.PlayerUpgradePool[player_id][val.Rarity].pro.push(val.Probability);
                if(this.ItemQmax < val.Rarity){
                    this.ItemQmax = val.Rarity;
                }
            }
            //第一次必出技能
            if(val.Rarity > 0 && val.Disable && val.is_first == 1){
                this.PlayerUpgradePoolFirstData[player_id].push(key)
            }
        }
    }

    /**
     * 获取当前升级选项 
     * 1.默认是3个,如果其他则可以多选
     * 2.符合条件后会出现特殊升级
     */
    CreatArmssSelectData(player_id: PlayerID , param : CGED["NewArmsEvolution"]["CreatArmssSelectData"]) {
        //阶段2之前不可用
        if(GameRules.MapChapter._game_select_phase <= 2){
            return
        }

        if (this.PlayerSelectData[player_id].is_select == 0) {
            //验证是否满足条件
            if(this.EvolutionPoint[player_id] <= 0){
                print("技能点不足！")
                return
            }
            let MyHero = PlayerResource.GetSelectedHeroEntity(player_id);
            let Index = param.index; 
            let Ability = MyHero.GetAbilityByIndex(Index);
            let Key = Ability.GetAbilityName();
            let Quality = ArmsJson[Key as keyof typeof ArmsJson].Rarity;
            print("Quality :" , Quality )
            if(this.ItemQmax == Quality){
                print("已经是最高品质了！")
                return 
            }
            //最多几样物品
            let amount = this.PlayerSelectAmount[player_id];
            //循环计数器
            let amount_count = 0;
            let amount_max = 50;
            //返回数据
            let ret_data: { [key: string]: PlayerUpgradeSelectServer; } = {};
            let shop_wp_list: string[] = [];
            //如果为第一次刷新则改为特定刷新
            if(this.PlayerFirstState[player_id]){
                this.PlayerFirstState[player_id] = false;
                for (let i = 0; i < amount; i++) {
                    amount_count ++;
                    if(amount_count > amount_max ){
                        break;
                    }
                    // let key_list = this.PlayerUpgradePool[player_id][Quality].key;
                    // let pro_list = this.PlayerUpgradePool[player_id][Quality].pro;
                    // let arms_key = key_list[GetCommonProbability(pro_list)];
                    let index = RandomInt(0 , this.PlayerUpgradePoolFirstData[player_id].length - 1)
                    let arms_key = this.PlayerUpgradePoolFirstData[player_id][index]
                    //重复物品跳过
                    if (shop_wp_list.includes(arms_key)) {
                        //跳过本次 
                        i--;
                        continue;
                    }
                    ret_data[i] = { 
                        key: arms_key, 
                    };
                    shop_wp_list.push(arms_key);
                }

            }else{
                for (let i = 0; i < amount; i++) {
                    amount_count ++;
                    if(amount_count > amount_max ){
                        break;
                    }
                    let key_list = this.PlayerUpgradePool[player_id][Quality + 1].key;
                    let pro_list = this.PlayerUpgradePool[player_id][Quality + 1].pro;
                    let arms_key = key_list[GetCommonProbability(pro_list)];
                    //重复物品跳过
                    if (shop_wp_list.includes(arms_key)) {
                        //跳过本次 
                        i--;
                        continue;
                    }
                    ret_data[i] = { 
                        key: arms_key, 
                    };
                    shop_wp_list.push(arms_key);
                }
            }
            //修改为已刷新
            this.PlayerSelectData[player_id].is_select = 1;
            this.PlayerSelectData[player_id].arms_list = ret_data;
            this.PlayerSelectData[player_id].index = Index;
        }
        this.GetArmssSelectData(player_id, {});
    }

    /**
     * 升级
     */
    ArmsUpgrade(player_id: PlayerID , param : CGED["NewArmsEvolution"]["ArmsUpgrade"]) {
        let MyHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let Index = param.index; 
        let Ability = MyHero.GetAbilityByIndex(Index);
        let Key = Ability.GetAbilityName();
        if(this.EvolutionPoint[player_id] <= 0){
            print("技能点不足！")
            return
        }
        let Quality = ArmsJson[Key as keyof typeof ArmsJson].Rarity;
        if(this.ItemQmax == Quality){
            print("已经是最高品质了！")
            return 
        }
        let key_list = this.PlayerUpgradePool[player_id][Quality + 1].key;
        let pro_list = this.PlayerUpgradePool[player_id][Quality + 1].pro;
        let ability_name = key_list[GetCommonProbability(pro_list)];
        //替换
        GameRules.NewArmsEvolution.ReplaceAbility( ability_name , Index , MyHero )
    }

    /**
     * 替换技能
     * @param player_id 
     * @param params 
     */
    ReplaceAbility( ability_name: string, order: number, queryUnit: CDOTA_BaseNPC_Hero ) {
        const hUnit = queryUnit;
        let order_ability = hUnit.GetAbilityByIndex(order);
        if (order_ability) {
            order_ability.RemoveSelf()
            hUnit.RemoveAbilityByHandle(order_ability)
        }
        let new_ability = hUnit.AddAbility(ability_name)
        new_ability.SetLevel(1);
    }


    /**
     * 选择列表
     */
    PostSelectArms(player_id: PlayerID, params: CGED["NewArmsEvolution"]["PostSelectArms"]) {
        let index = params.index;
        if (this.EvolutionPoint[player_id] > 0) {
            
            let PlayerSelectDataInfo = this.PlayerSelectData[player_id];
            if (!PlayerSelectDataInfo.arms_list.hasOwnProperty(index)) {
                print("没有此选项！！！");
                return;
            }
            if (PlayerSelectDataInfo.is_select == 0) {
                print("没有刷新技能！！");
                return;
            }
            let ability_name = PlayerSelectDataInfo.arms_list[index].key
            let Index = PlayerSelectDataInfo.index
            let MyHero = PlayerResource.GetSelectedHeroEntity(player_id);

            GameRules.NewArmsEvolution.ReplaceAbility( ability_name , Index , MyHero )
            //技能点减少
            this.AddEvolutionPoint(player_id , -1)
            PlayerSelectDataInfo.is_select = 0;
            PlayerSelectDataInfo.index = -1;
            PlayerSelectDataInfo.arms_list = {};
            this.GetArmssSelectData(player_id, {});
        } else {
            // GameRules.Cmsg();
            print("技能点不足")
        }
    }

    /**
     * 获取物品信息初始化信息
     */
    GetArmssSelectData(player_id: PlayerID, params: CGED["NewArmsEvolution"]["GetArmssSelectData"]) {
        //商店组成 1未刷新 2未挑战
        let data : PlayerUpgradeSelectRetData = {
            Data: this.PlayerSelectData[player_id] , //列表
        };
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "NewArmsEvolution_GetArmssSelectData",
            {
                data
            }
        );
    }
    /**
     * 获取物品信息初始化信息
     */
    GetEvolutionPoint(player_id: PlayerID, params: CGED["NewArmsEvolution"]["GetEvolutionPoint"]) {
        //商店组成 1未刷新 2未挑战
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "NewArmsEvolution_GetEvolutionPoint",
            {
                data : {
                    EvolutionPoint : this.EvolutionPoint[player_id]
                }
            }
        );
    }
    /**
     * 增加技能点
     */
    AddEvolutionPoint(player_id: PlayerID , count : number ){
        this.EvolutionPoint[player_id] += count;
        this.GetEvolutionPoint(player_id , {});
    }
    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if(cmd == "-arms_add"){
             let count = args[0] ? parseInt(args[0]) : 1;
             this.AddEvolutionPoint(player_id , count);
        }
        if(cmd == "-iu"){
            let index = parseInt(args[0]) ?? 1;
            this.ArmsUpgrade(player_id , {
                index : index
            })
        }
        if(cmd == "--CreatArmssSelectData"){
            let index = args[0] ? parseInt(args[0]) : 0;
            this.CreatArmssSelectData(player_id , { index : index})
        }
        if(cmd == "--PostSelectArms"){
            let index = args[0] ? parseInt(args[0]) : 0;
            this.PostSelectArms(player_id , { index : index})
        }
    }
}