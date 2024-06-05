
import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import * as ArmsJson from "../../../json/abilities/arms.json";
import * as ElementBondJson from "../../../json/config/game/element_bond.json";

const element_label: CElementType[] = ["null", "fire", "ice", "thunder", "wind", "light", "dark"];

/** 技能升级相关 */
@reloadable
export class NewArmsEvolution extends UIEventRegisterClass {
    //每个玩家可选列表
    PlayerUpgradePool: {
        [player: number]: { //玩家
            [qualiy: number]: {  //品质
                key: string[], //物品key
                pro: number[]; //物品概率
            }
        }
    } = {};

    kill_list : number[] = [ 50 , 50 , 100 , 200 , 400 , 600 , 800 , 1000 , 1000 , 1000 , 1000];

    /**
     * 全局限购记录
     */
    arms_global_count: {
        [key: string]: {
            count: number,
            max: number,
        },
    } = {};


    ItemQmax: number = 7; //物品最高品质    
    //技能点
    EvolutionPoint: number[] = []
    //已使用的技能点
    ConsumeEvolutionPoint: number[] = []

    //技能刷新次数
    PlayerRefreshCount: number[] = [];
    //玩家单次最大随机数量
    PlayerSelectAmount: number[] = [];
    //选择数据
    PlayerSelectData: PlayerUpgradeSelectServerData[] = [];
    //是否第一次选择
    PlayerFirstState: boolean[] = [];
    //第一次选择的技能                
    PlayerUpgradePoolFirstData: string[][] = [];

    //玩家羁绊数据
    ElementBondDateList: ElementBondDateList[] = [];

     //玩家羁绊记录数据
     ElementBondDateRecord : ElementBondDateList[][] = [];

    // 羁绊表
    ElementBondTable: { [element: string]: number[] };

    constructor() {
        super("NewArmsEvolution")
        for (let index = 0; index < GameRules.PUBLIC_CONST.PLAYER_COUNT; index++) {
            this.PlayerUpgradePool[index] = {};
            this.EvolutionPoint.push(0);
            this.PlayerRefreshCount.push(GameRules.PUBLIC_CONST.PLAYER_REFRESH_COUNT)
            this.PlayerSelectAmount.push(GameRules.PUBLIC_CONST.PLAYER_ARMS_SELECT_MAX)
            this.PlayerFirstState.push(false)
            this.PlayerUpgradePoolFirstData.push([])

            this.ElementBondDateList.push({
                "Element": {
                    [ElementTypeEnum.null]: 0,
                    [ElementTypeEnum.fire]: 0,
                    [ElementTypeEnum.ice]: 0,
                    [ElementTypeEnum.thunder]: 0,
                    [ElementTypeEnum.wind]: 0,
                    [ElementTypeEnum.light]: 0,
                    [ElementTypeEnum.dark]: 0
                }
            })
            //6个位置的记录状态
            this.ElementBondDateRecord.push([]);
            for (let i = 0; i < 6; i++) {
                this.ElementBondDateRecord[index].push({
                    "Element" : {
                        [ElementTypeEnum.null] : 0,
                        [ElementTypeEnum.fire] : 0,
                        [ElementTypeEnum.ice] : 0,
                        [ElementTypeEnum.thunder] : 0,
                        [ElementTypeEnum.wind]: 0,
                        [ElementTypeEnum.light] : 0,
                        [ElementTypeEnum.dark] : 0
                    }
                })
            }

            this.PlayerSelectData.push({
                "arms_list": {},
                "is_select": 0,
                "index": 0,
            });
        }
        // 构造一个羁绊表
        this.ElementBondTable = {};
        for (let k in ElementBondJson) {
            let row_data = ElementBondJson[k as keyof typeof ElementBondJson];
            let element_key = element_label[row_data.CElementType];
            let activate_count = row_data.activate_count;
            if (this.ElementBondTable[element_key] == null) {
                this.ElementBondTable[element_key] = []
            }
            this.ElementBondTable[element_key].push(activate_count)
        }

    }
    /**
     * 重新初始化全局限购
     */
    ArmsGlobalInit(){
        let playercount = GetPlayerCount();
        for (const [key, val] of pairs(ArmsJson)) {
            if (val.Rarity > 0 && val.Disable) {
                this.arms_global_count[key] = {
                    count : 0,
                    max : playercount,
                };
            }
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
        //初始给与一点技能点 且不消耗灵魂
        this.AddEvolutionPoint(player_id, 1);
        this.PlayerFirstState[player_id] = true;
        this.PlayerSelectData[player_id] = {
            "arms_list": {},
            "is_select": 0,
            "index": -1,
        };
        this.ElementBondDateList[player_id] = {
            "Element": {
                [ElementTypeEnum.null]: 0,
                [ElementTypeEnum.fire]: 0,
                [ElementTypeEnum.ice]: 0,
                [ElementTypeEnum.thunder]: 0,
                [ElementTypeEnum.wind]: 0,
                [ElementTypeEnum.light]: 0,
                [ElementTypeEnum.dark]: 0
            }
        }
                   
        for (let index = 0; index < 6; index++) {
            this.ElementBondDateRecord[player_id][index] = {
                "Element" : {
                    [ElementTypeEnum.null] : 0,
                    [ElementTypeEnum.fire] : 0,
                    [ElementTypeEnum.ice] : 0,
                    [ElementTypeEnum.thunder] : 0,
                    [ElementTypeEnum.wind]: 0,
                    [ElementTypeEnum.light] : 0,
                    [ElementTypeEnum.dark] : 0
                }
            }
            
        }

        this.GetArmssElementBondDateList(player_id, {})

        this.PlayerUpgradePoolFirstData[player_id] = [];

        for (const [key, val] of pairs(ArmsJson)) {
            if (val.Rarity > 0 && val.Disable) {
                if (!this.PlayerUpgradePool[player_id].hasOwnProperty(val.Rarity)) {
                    this.PlayerUpgradePool[player_id][val.Rarity] = {
                        key: [],
                        pro: [],
                    }
                }
                this.PlayerUpgradePool[player_id][val.Rarity].key.push(key);
                this.PlayerUpgradePool[player_id][val.Rarity].pro.push(val.Probability);
                if (this.ItemQmax < val.Rarity) {
                    this.ItemQmax = val.Rarity;
                }
            }
            //第一次必出技能
            if (val.Rarity > 0 && val.Disable && val.is_first == 1) {
                this.PlayerUpgradePoolFirstData[player_id].push(key)
            }
        }
    }

    /**
     * 获取当前升级选项 
     * 1.默认是3个,如果其他则可以多选
     * 2.符合条件后会出现特殊升级
     */
    CreatArmssSelectData(player_id: PlayerID, param: CGED["NewArmsEvolution"]["CreatArmssSelectData"]) {
        //阶段2之前不可用
        if (GameRules.MapChapter._game_select_phase <= 2) {
            return
        }

        if (this.PlayerSelectData[player_id].is_select == 0) {
            //验证是否满足条件
            if (this.EvolutionPoint[player_id] <= 0) {
                print("技能点不足！")
                return
            }
            let MyHero = PlayerResource.GetSelectedHeroEntity(player_id);
            let Index = param.index;
            let Ability = MyHero.GetAbilityByIndex(Index);
            let Key = Ability.GetAbilityName();
            let Quality = ArmsJson[Key as keyof typeof ArmsJson].Rarity;
            if (this.ItemQmax == Quality) {
                print("已经是最高品质了！")
                return
            }
            let killcount = this.kill_list[Quality+1] ;
            let skillcount = 1;
            //最多几样物品
            let amount = this.PlayerSelectAmount[player_id];
            //循环计数器
            let amount_count = 0;
            let amount_max = 50;
            //返回数据
            let ret_data: { [key: string]: PlayerUpgradeSelectServer; } = {};
            let shop_wp_list: string[] = [];
            //如果为第一次刷新则改为特定刷新
            if (this.PlayerFirstState[player_id]) {
                if(skillcount > 0){
                    //技能点减少
                    this.AddEvolutionPoint(player_id, - skillcount)
                }

                this.PlayerFirstState[player_id] = false;
                for (let i = 0; i < amount; i++) {
                    amount_count++;
                    if (amount_count > amount_max) {
                        break;
                    }
                    // let key_list = this.PlayerUpgradePool[player_id][Quality].key;
                    // let pro_list = this.PlayerUpgradePool[player_id][Quality].pro;
                    // let arms_key = key_list[GetCommonProbability(pro_list)];
                    let index = RandomInt(0, this.PlayerUpgradePoolFirstData[player_id].length - 1)
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
                    this.arms_global_count[arms_key].count +=1;
                    shop_wp_list.push(arms_key);
                }
            } else {
                if(killcount > 0){
                    let Validation = GameRules.ResourceSystem.ResourceValidation(player_id , {
                        "Kills" : killcount
                    })
                    if(Validation == false){
                        print("资源不足！！！");
                        return;
                    }
                }
                if(killcount > 0){
                    GameRules.ResourceSystem.ModifyResource(player_id , {
                        "Kills" : - killcount
                    })
                }
                if(skillcount > 0){
                    //技能点减少
                    this.AddEvolutionPoint(player_id, - skillcount)
                }
                for (let i = 0; i < amount; i++) {
                    amount_count++;
                    if (amount_count > amount_max) {
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
                    //全局唯一数量验证
                    if(this.arms_global_count.hasOwnProperty(arms_key)){
                        if(this.arms_global_count[arms_key].count >= this.arms_global_count[arms_key].max){
                            //跳过本次 
                            i--;
                            continue;
                        }
                    }
                    ret_data[i] = {
                        key: arms_key,
                    };
                    this.arms_global_count[arms_key].count +=1;
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
     * 获取重随数据
     * 1.默认是3个,如果其他则可以多选
     * 2.符合条件后会出现特殊升级
     */
    CreatArmssWeightData(player_id: PlayerID, param: CGED["NewArmsEvolution"]["CreatArmssSelectData"]) {
        //阶段2之前不可用
        if (GameRules.MapChapter._game_select_phase <= 2) {
            return
        }
        if (this.PlayerSelectData[player_id].is_select == 0) {
            //验证是否满足条件
            if (this.EvolutionPoint[player_id] <= 0) {
                print("技能点不足！")
                return
            }
            let MyHero = PlayerResource.GetSelectedHeroEntity(player_id);
            let Index = param.index;
            let Ability = MyHero.GetAbilityByIndex(Index);
            let Key = Ability.GetAbilityName();
            let Quality = ArmsJson[Key as keyof typeof ArmsJson].Rarity;
            if (this.ItemQmax == Quality) {
                print("已经是最高品质了！")
                return
            }
            //技能点减少
            let skillcount = 1;
            if(skillcount > 0){
                //技能点减少
                this.AddEvolutionPoint(player_id, - skillcount)
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
            for (let i = 0; i < amount; i++) {
                amount_count++;
                if (amount_count > amount_max) {
                    break;
                }
                let key_list = this.PlayerUpgradePool[player_id][Quality].key;
                let pro_list = this.PlayerUpgradePool[player_id][Quality].pro;
                let arms_key = key_list[GetCommonProbability(pro_list)];
                //重复物品跳过
                if (shop_wp_list.includes(arms_key)) {
                    //跳过本次 
                    i--;
                    continue;
                }
                //全局唯一数量验证
                if(this.arms_global_count.hasOwnProperty(arms_key)){
                    if(this.arms_global_count[arms_key].count >= this.arms_global_count[arms_key].max){
                        //跳过本次 
                        i--;
                        continue;
                    }
                }
                ret_data[i] = {
                    key: arms_key,
                };
                this.arms_global_count[arms_key].count +=1;
                shop_wp_list.push(arms_key);
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
    ArmsUpgrade(player_id: PlayerID, param: CGED["NewArmsEvolution"]["ArmsUpgrade"]) {
        let MyHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let Index = param.index;
        let Ability = MyHero.GetAbilityByIndex(Index);
        let Key = Ability.GetAbilityName();
        if (this.EvolutionPoint[player_id] <= 0) {
            print("技能点不足！")
            return
        }
        let Quality = ArmsJson[Key as keyof typeof ArmsJson].Rarity;
        if (this.ItemQmax == Quality) {
            print("已经是最高品质了！")
            return
        }
        let key_list = this.PlayerUpgradePool[player_id][Quality + 1].key;
        let pro_list = this.PlayerUpgradePool[player_id][Quality + 1].pro;
        let ability_name = key_list[GetCommonProbability(pro_list)];
        //替换
        GameRules.NewArmsEvolution.ReplaceAbility(ability_name, Index, MyHero)
    }

    /**
     * 替换技能
     * @param player_id 
     * @param params    
     */
    ReplaceAbility(ability_name: string, order: number, queryUnit: CDOTA_BaseNPC_Hero) {
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
        let PlayerSelectDataInfo = this.PlayerSelectData[player_id];
        if (!PlayerSelectDataInfo.arms_list.hasOwnProperty(index)) {
            print("没有此选项！！！");
            return;
        }
        if (PlayerSelectDataInfo.is_select == 0) {
            print("没有刷新技能！！");
            return;
        }
        let ability_name = PlayerSelectDataInfo.arms_list[index].key;

        let Index = PlayerSelectDataInfo.index;
        let MyHero = PlayerResource.GetSelectedHeroEntity(player_id);

        //减少原来的元素羁绊
        let Ability = MyHero.GetAbilityByIndex(Index);
        let Key = Ability.GetAbilityName();
        let Rarity = ArmsJson[Key as keyof typeof ArmsJson].Rarity;
        //被替换的技能回归池子
        if(Rarity != 0){
            this.arms_global_count[Key].count --;
        }
        
        this.GetArmssElementBondDateList(player_id, {})

        GameRules.NewArmsEvolution.ReplaceAbility(ability_name, Index, MyHero)

        PlayerSelectDataInfo.is_select = 0;
        PlayerSelectDataInfo.index = -1;
        PlayerSelectDataInfo.arms_list = {};

        //其他未选中的回归池子
        for( let k in PlayerSelectDataInfo.arms_list){
            let kint = parseInt(k);
            if(index != kint){
                //回归池子
                let arms_key = PlayerSelectDataInfo.arms_list[k].key
                this.arms_global_count[arms_key].count --;
            }
            
        }
        this.GetArmssSelectData(player_id, {});
    }

    /**
     * 获取物品信息初始化信息
     */
    GetArmssSelectData(player_id: PlayerID, params: CGED["NewArmsEvolution"]["GetArmssSelectData"]) {
        //商店组成 1未刷新 2未挑战
        let data: PlayerUpgradeSelectRetData = {
            Data: this.PlayerSelectData[player_id], //列表
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
    GetArmssElementBondDateList(player_id: PlayerID, params: CGED["NewArmsEvolution"]["GetArmssElementBondDateList"]) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "NewArmsEvolution_GetArmssElementBondDateList",
            {
                data: this.ElementBondDateList[player_id]
            }
        );
    }

    /**
     * 修改元素属性
     * @param player_id 玩家id
     * @param Element 元素
     * @param count 数量
     * @param SkillIndex 技能位置
     */
    SetElementBondDate(player_id : PlayerID , Element : ElementTypeEnum , count : number , SkillIndex : number ){

        //还原当前位置被替换的量
        for (let index = 0; index < Object.keys(this.ElementBondDateRecord[player_id][SkillIndex].Element).length; index++) {
            const element = this.ElementBondDateRecord[player_id][SkillIndex].Element[index];
            if(element != 0){
                this.ElementBondDateList[player_id].Element[index] -= element;
                this.ElementBondDateRecord[player_id][SkillIndex].Element[index] = 0;
            }
        }
        
        //先处理光暗特殊情况
        if(Element == ElementTypeEnum.dark || Element == ElementTypeEnum.light){
            if(count > 0){ //处理增加的情况
                let max = ElementTypeEnum.dark;
                //寻找最高元素的值
                let HighestElement = 0;
                //唯一标识
                let only_status = false;
                for (let index = 1; index <= max ; index++) {
                    //下一个元素如果等于了此数量则不唯一
                    if(HighestElement == this.ElementBondDateList[player_id].Element[index]){
                        only_status = false;
                    }

                    if(HighestElement < this.ElementBondDateList[player_id].Element[index]){
                        HighestElement = this.ElementBondDateList[player_id].Element[index]
                        only_status = true;
                    }
                    
                }
                if(HighestElement != 0 && only_status == true){
                    //处理暗
                    if(Element == ElementTypeEnum.dark){
                        for (let index = 1; index <= max ; index++) {
                            if(index != ElementTypeEnum.dark){
                                if(HighestElement == this.ElementBondDateList[player_id].Element[index]){
                                    if(this.ElementBondDateList[player_id].Element[index] > 0){
                                        this.ElementBondDateList[player_id].Element[index] -= count;
                                    }else{
                                        this.ElementBondDateList[player_id].Element[index] -= count;
                                    }
                                    //记录被减少的量
                                    this.ElementBondDateRecord[player_id][SkillIndex].Element[index] -= count;
                                }
                            }
                        }
                    }
                    //处理光
                    if(Element == ElementTypeEnum.light){
                        for (let index = 1; index <= max ; index++) {
                            if(index != ElementTypeEnum.light){
                                if(HighestElement == this.ElementBondDateList[player_id].Element[index]){
                                    if(this.ElementBondDateList[player_id].Element[index] > 0){
                                        this.ElementBondDateList[player_id].Element[index] += count;
                                    }else{
                                        this.ElementBondDateList[player_id].Element[index] += count;
                                    }
                                    //记录增加的量
                                    this.ElementBondDateRecord[player_id][SkillIndex].Element[index] += count;
                                }
                            }
                        }
                    }
                }
            }
        }

        //再添加元素
        this.ElementBondDateList[player_id].Element[Element] += count;

        this.UpdateElementBondEffect(player_id);

        this.GetArmssElementBondDateList(player_id, {})
    }

    /** 更新元素羁绊效果 */
    UpdateElementBondEffect(player_id: PlayerID) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        const element_bond = this.ElementBondDateList[player_id].Element;
        for (let k in element_bond) {
            let kint = parseInt(k);
            if (kint == 0) { continue }
            let key_index = parseInt(k) as keyof typeof element_bond;
            let element_key = element_label[key_index];
            let element_count = element_bond[key_index];
            let RowElementBondTable = this.ElementBondTable[element_key];
            
            for (let count of RowElementBondTable) {
                let bond_key = element_label[key_index] + "_" + count;
                if (element_count >= count) {
                    let row_element_bond = ElementBondJson[bond_key as keyof typeof ElementBondJson];
                    let row_kv_data = row_element_bond.AbilityValues as CustomAttributeTableType;
                    if (row_kv_data) {
                        GameRules.CustomAttribute.SetAttributeInKey(hHero, bond_key, row_kv_data)
                    }
                } else {
                    GameRules.CustomAttribute.DelAttributeInKey(hHero, bond_key)
                }
            }
        }
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
                data: {
                    EvolutionPoint: this.EvolutionPoint[player_id]
                }
            }
        );
    }
    /**
     * 增加技能点
     */
    AddEvolutionPoint(player_id: PlayerID, count: number) {
        this.EvolutionPoint[player_id] += count;
        this.GetEvolutionPoint(player_id, {});
    }

    GetArmsElementType(hAbility: CDOTABaseAbility) {
        let ability_name = hAbility.GetAbilityName();
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if (cmd == "-arms_add") {
            let count = args[0] ? parseInt(args[0]) : 1;
            this.AddEvolutionPoint(player_id, count);
        }
        if (cmd == "-iu") {
            let index = parseInt(args[0]) ?? 1;
            this.ArmsUpgrade(player_id, {
                index: index
            })
        }
        if (cmd == "--CreatArmssSelectData") {
            let index = args[0] ? parseInt(args[0]) : 0;
            this.CreatArmssSelectData(player_id, { index: index })
        }
        if (cmd == "--PostSelectArms") {
            let index = args[0] ? parseInt(args[0]) : 0;
            this.PostSelectArms(player_id, { index: index })
        }
        if (cmd == "--SetElementBondDate") {
            let Element = args[0] ? parseInt(args[0]) : 1;
            let count = args[1] ? parseInt(args[1]) : 1;
            this.SetElementBondDate(player_id, Element, count , 0)
        }
        if(cmd == "--addResource"){
            let Type = args[0] ? parseInt(args[0]) : 1;
            let count = args[1] ? parseInt(args[1]) : 1;
            let key = "Gold";
            if(Type == 1){
                key = "Gold"
            }else if(Type == 2){
                key = "Soul"
            }else if(Type == 3){
                key = "Kills"
            }else if(Type == 4){
                key = "TeamExp"
            }else if(Type == 5){
                key = "SingleExp"
            }
            GameRules.ResourceSystem.ModifyResource(player_id , {
                [key] : count
            })
        }
    }
}
