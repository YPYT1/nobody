
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

    ItemQmax : number = 1; //物品最高品质
    
    EvolutionPoint : number[] = [] //技能点

    ConsumeEvolutionPoint : number[] = [] //已使用的技能点

    constructor() {
        super("NewArmsEvolution")
        for (let index = 0; index < GameRules.PUBLIC_CONST.PLAYER_COUNT; index++) {
            this.PlayerUpgradePool[index] = {};
            this.EvolutionPoint.push(0);
        }
    }
   /**
    * 初始化玩家可选物品概率(可重复调用)
    * @param player_id 
    */
   InitPlayerUpgradeStatus(player_id: PlayerID) {
        this.PlayerUpgradePool[player_id] = {};
        this.EvolutionPoint[player_id] = 0;
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
        }
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
        //移除物品
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
    PostSelectArms(player_id: PlayerID, params: CGED["ArmsEvolution"]["PostSelectArms"]) {
    }

    /**
     * 获取物品信息初始化信息
     */
    GetArmssSelectData(player_id: PlayerID, params: CGED["ArmsEvolution"]["GetArmssSelectData"]) {
        
    }
    /**
     * 增加技能点
     */
    AddEvolutionPoint(player_id: PlayerID , count : number ){
        this.EvolutionPoint[player_id] += count;
        this.GetArmssSelectData(player_id , {});
    }



    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if(cmd == "-arms_add"){
             let count = parseInt(args[0]) ?? 1;
             this.AddEvolutionPoint(player_id , count);
        }
        if(cmd == "-iu"){
            let index = parseInt(args[0]) ?? 1;
            this.ArmsUpgrade(player_id , {
                index : index
            })
        }
    }
}