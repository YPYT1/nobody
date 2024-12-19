
import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
/**
 * 投资系统
 */
@reloadable
export class InvestSystem extends UIEventRegisterClass {
    /**
     * 玩家投资等级
     */
    PlayerInvestLevelList : number[] = [];
    /**
     * 玩家投资额外等级
     */
    PlayerExtraInvestLevelList : number[] = [];
    /**
     * 初始默认等级
     */
    PlayerInvestInitLevel = 1;
    /**
     * 默认升级公式
     */
    // InvestUpEquation = "LEVEL*10";
    /**
     * 默认资源公式 
     */
    InvestGetResourceEq = "2+LEVEL";
    /**
     * 投资效率 受资源加成影响
     */
    InvestGetResourceEfficiencyList : number [] = [];
    /**
     * 初始投资回报间隔
     */
    IntervalInit : number = 1; 
    /**
     * 初始化玩家定时器数据
     */
    PlayerTimerData : {
        Interval : number, //投资获取回报间隔 初始1s
        State : boolean, // 定时器状态 false = 关闭 true = 开启
        ResourceCount : number; //获取资源总数量
    }[] = []
    /*
    /**
     * 是否停止收益 
     */
    PlayerInvestStop : boolean[] = [];
    /**
     * 默认玩家数量
     */
    player_count : number = 4;

    constructor(){
        super("InvestSystem" , true);
        /**
         * 基础信息 玩家收益间隔在此实现
         */
        for (let player_id = 0 as PlayerID; player_id < this.player_count; player_id++) {
            this.PlayerInvestStop.push(false);
            this.PlayerInvestLevelList.push(this.PlayerInvestInitLevel)
            this.PlayerExtraInvestLevelList.push(0);     
            this.InvestGetResourceEfficiencyList.push(100);

            let level = this.PlayerInvestLevelList[player_id] + this.PlayerExtraInvestLevelList[player_id];
            let InvestGetResource = this.EqK(player_id , level);

            this.PlayerTimerData.push({
                Interval : 1, //
                State : false,
                ResourceCount : InvestGetResource,
            })
        }
    }
    Init(player_id : PlayerID){
        /**
         * 基础信息 玩家收益间隔在此实现
         */
        this.PlayerInvestStop[player_id] = false;
        this.PlayerInvestLevelList[player_id] = this.PlayerInvestInitLevel;
        this.PlayerExtraInvestLevelList[player_id] = 0;
        this.InvestGetResourceEfficiencyList[player_id] = 100;

        let level = this.PlayerInvestLevelList[player_id] + this.PlayerExtraInvestLevelList[player_id];
        let InvestGetResource = this.EqK(player_id , level);

        this.PlayerTimerData[player_id] = {
            Interval : 1, //间隔时间
            State : false,
            ResourceCount : InvestGetResource,
        };
        this.GetPlayerInvestData(player_id , {});
        
    }
    //获取玩家投资等级信息
    GetPlayerInvestData(player_id: PlayerID, params: CGED["InvestSystem"]["GetPlayerInvestData"], callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "InvestSystem_GetPlayerInvestData" ,
            {
                data: {
                    PlayerInvestLevel : this.PlayerInvestLevelList[player_id],
                    PlayerExtraInvestLevel : this.PlayerExtraInvestLevelList[player_id],
                    ResourceCount : this.PlayerTimerData[player_id].ResourceCount,
                    InvestGetResourceEfficiency : math.floor(this.InvestGetResourceEfficiencyList[player_id]  / 100),
                    Interval : this.PlayerTimerData[player_id].Interval,
                }
            }
        );
    }
    //投资升级
    PostInvestUp(player_id: PlayerID , Level : number) {

        this.PlayerInvestLevelList[player_id] += Level;
        //计算下一级需要量
        this.EqInvestResource(player_id);
        // let hero = PlayerResource.GetSelectedHeroEntity(player_id);
        // GameRules.PlayerHeroAttributeData.base_data[hero.GetEntityIndex()]["BaseInvestLevel"] = this.PlayerInvestLevelList[player_id] ;//基础投资等级
        // if(hero.treasure_passive_type["item_treasure_null_133_buff_1"] && hero.treasure_level["item_treasure_null_133"]){
        //     let treasure_level = hero.treasure_level["item_treasure_null_133"];
        //     let value = GameRules.TreasurePublicData.GetTKV("item_treasure_null_133", "attr_value", treasure_level);
        //     GameRules.PlayerHeroAttributeData.base_data[hero.GetEntityIndex()]["BonusAllAttr"] += value;
            
        // }
        //更新一次属性
        // GameRules.PlayerHeroAttributeData.UpdateHeroAttribute(PlayerResource.GetSelectedHeroEntity(player_id) , false , "Update_15")
}
    //开始收益
    StartEarnings(player_id : PlayerID){
        if(this.PlayerTimerData[player_id].State == false){
            this.PlayerTimerData[player_id].State = true;
            let unit = PlayerResource.GetSelectedHeroEntity(player_id);
            unit.SetContextThink("player_earnings",()=>{
                //增加资源 -> 灵魂
                GameRules.ResourceSystem.ModifyResource( player_id, 
                    { 
                        "Soul": GameRules.InvestSystem.PlayerTimerData[player_id].ResourceCount
                    }
                )
                //处理收益其他问题

                //返回修改时间
                return GameRules.InvestSystem.PlayerTimerData[player_id].Interval;
            },0)
        }
        
    }
    //停止收益
    StopEarnings(){
        let player_count = GetPlayerCount()
        for (let index = 0 as PlayerID; index < player_count ; index++) {
            if(this.PlayerTimerData[index].State == true){
                this.PlayerTimerData[index].State = false;
                let unit = PlayerResource.GetSelectedHeroEntity(index);
                unit.StopThink("player_earnings")
            }
        }
    }

    /**
     * 改变倍率时重新计算投资获取的灵魂
     * @param player_id  玩家id
     * @param Efficiency 效率 (整数) 
     */
    ResetIncome(player_id : PlayerID , Efficiency : number){
        //未激活才生效 且只能激活一次
        if(this.InvestGetResourceEfficiencyList[player_id] != Efficiency){
            this.InvestGetResourceEfficiencyList[player_id] = Efficiency;
            this.EqInvestResource(player_id)
        }
    }
    /**
     * 重设额外等级
     * @param player_id  玩家id
     * @param Efficiency 效率 (整数) 
     */
     SetExtraInvestLeve(player_id : PlayerID , ExtraInvestLevel : number){
        //未激活才生效 且只能激活一次
        if(this.PlayerExtraInvestLevelList[player_id] != ExtraInvestLevel){
            this.PlayerExtraInvestLevelList[player_id] = ExtraInvestLevel;
            this.EqInvestResource(player_id)
        }
    }

    /**
     * 效率计算公式
     */
    EqK(player_id : PlayerID , level : number ) : number{
        let param_resource = {
            LEVEL : level
        }
        let Efficiency = this.InvestGetResourceEfficiencyList[player_id];
        //重新获取资源计算规则
        let EarningsResource = math.floor(LFUN.eval(this.InvestGetResourceEq,param_resource) * Efficiency / 100) 
        EarningsResource = math.max(0 , EarningsResource);
        return EarningsResource;
    }
    /**
     * 重算投资资源效率
     * @param player_id 
     */
    EqInvestResource(player_id : PlayerID){
        //计算此等级可用获取的资源 
        let level = this.PlayerInvestLevelList[player_id] + this.PlayerExtraInvestLevelList[player_id];
        this.PlayerTimerData[player_id].ResourceCount = this.EqK(player_id , level);
        //重算后发送下消息
        this.GetPlayerInvestData(player_id,{})
    }
    /**
     * debug 命令
    */
    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-syks") {  //开始投资收益
            // this.StartEarnings();
        } else if (cmd == "-sytz") { //停止投资收益
            this.StopEarnings();
        }else if (cmd == "-syup") { //投资等级升级
            let up_level = args[0] ? tonumber(args[0]) : 1;
            this.PostInvestUp(player_id, up_level)
        }
    }
}