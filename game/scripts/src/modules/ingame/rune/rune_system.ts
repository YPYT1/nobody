import * as RuneConfig from "../../../json/config/game/rune/rune_config.json";
import { modifier_rune_effect } from "../../../modifier/rune_effect/modifier_rune_effect";

import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
import * as RuneAttrConfig from "../../../json/config/game/rune/rune_attr_config.json";

//符文系统
@reloadable
export class RuneSystem extends UIEventRegisterClass {
    //每个玩家升级可用符文列表
    drop_list: { key: string[], pro: number[]; }[] = [];
    //每个玩家天辉可用符文列表
    tianhui_task_drop_list: { key: string[], pro: number[]; }[] = [];
    //每个玩家夜魇可用符文列表
    nightmare_task_drop_list: { key: string[], pro: number[]; }[] = [];
    //debug模式
    de_bug = true;
    //记录天命次数与数据
    player_fate_data: CGEDPlayerRuneSelectServerData[][] = [];
    //符文刷新次数
    player_refresh_count: number[] = [ 0 , 0 , 0 , 0 , 0 , 0];
    //已获符文列表
    check_rune_name: string[][] = [];
    //当前选择列表符文
    player_check_rune_name: string[][] = [];
    //记录玩家所选天命下标
    player_fate_data_index: number[] = [];
    //玩家天命挑战成功次数
    player_challenge_number: number[] = [];
    //最大选择数量
    player_select_rune_max: number[] = [];
    //符文数量
    player_rune_count : number[] = [ 0 , 0 , 0 , 0 , 0 , 0];
    //符文刷新初始化次数
    player_refresh_count_config : number = 0;

    //选择倒计时
    count_down_time = 45;

    //属性编号与值
    rune_attr_list : string[] = [];

    rune_keyvalue: typeof RuneConfig = RuneConfig;
    /**
     * 初始化
     */
    //玩家单次最大随机数量
    player_select_amount: number[] = [];
    /**     
     * 初始化
     */
    //玩家单次最大随机数量
    rune_select_to_player5 : number[] = [0, 0, 0, 0, 0, 0];

    //玩家符文列表
    player_rune_list: { [index: string]: CGEDPlayerRuneData; }[] = [{}, {}, {}, {}, {}, {}];

    rune_ability_values: {
        [name: string]: {
            [key: string]: number[];
        };
    } = {};

    constructor() {
        super("RuneSystem" , true);
        for (let index = 0; index < 6 ; index++) {
            this.drop_list.push({
                key : [],
                pro : [],
            })
            this.tianhui_task_drop_list.push({
                key : [],
                pro : [],
            })
            this.nightmare_task_drop_list.push({
                key : [],
                pro : [],
            })
            this.player_fate_data.push([]);
            this.check_rune_name.push([]);
            this.player_check_rune_name.push([]);
            this.player_fate_data_index.push(0);
            this.player_challenge_number.push(1);
            this.player_select_rune_max.push(100);
            this.player_select_amount.push(3);
        }

        for (let i_key in RuneConfig) {
            let data = RuneConfig[i_key as keyof typeof RuneConfig];
            this.rune_ability_values[i_key] = {};
            //技能数组
            for (const A_key in data.AbilityValues) {
                let str = tostring(data.AbilityValues[A_key]);
                let strlist = str.split(" ");
                let numlist: number[] = [];
                for (let value of strlist) {
                    numlist.push(tonumber(value));
                }
                this.rune_ability_values[i_key][A_key] = numlist;
            }
        }

        for (let i_key in RuneAttrConfig) {
            this.rune_attr_list.push(i_key);
        }
        
        this.player_refresh_count_config = GameRules.PUBLIC_CONST.PLAYER_REFRESH_COUNT_CONFIG
    }
    InitPlayerUpgradeStatus( player_id : PlayerID , hHero: CDOTA_BaseNPC = null) {
        let hero_id = -1;
        //掉落列表初始化
        if(hHero != null && hHero.IsHero()){
            hero_id = hHero.GetHeroID();
        }
        //公共物品物品
        let drop_info: { key: string[], pro: number[]; } = {
            key : [],
            pro : [],
        };
        let tianhui_task_drop_list : { key: string[], pro: number[]; } = {
            key : [],
            pro : [],
        };
        let nightmare_task_drop_list : { key: string[], pro: number[]; } = {
            key : [],
            pro : [],
        };

        for (let key in RuneConfig) {
            const element = RuneConfig[key as keyof typeof RuneConfig];
            if(element.hero_id != 0){
                if(element.hero_id == hero_id){
                    drop_info.key.push(key);
                    drop_info.pro.push(element.probability);
                }
            }else if(element.task_type == 0 || element.task_type == 3){
                drop_info.key.push(key);
                drop_info.pro.push(element.probability);
            }
            if(element.task_type == 3 || element.task_type == 1){
                tianhui_task_drop_list.key.push(key);
                tianhui_task_drop_list.pro.push(element.probability);
            }
            if(element.task_type == 3 || element.task_type == 2){
                nightmare_task_drop_list.key.push(key);
                nightmare_task_drop_list.pro.push(element.probability);
            }
        }
        
        this.drop_list[player_id] = drop_info;
        this.tianhui_task_drop_list[player_id] = tianhui_task_drop_list;
        this.nightmare_task_drop_list[player_id] = nightmare_task_drop_list;
        
        //初始化刷新次数
        this.player_refresh_count[player_id] = this.player_refresh_count_config;
        this.player_fate_data[player_id] = [];
        this.check_rune_name[player_id] = [];
        this.player_check_rune_name[player_id] = [];
        this.player_rune_list[player_id] = {};
        this.player_fate_data_index[player_id] = 0;
        this.player_challenge_number[player_id] = 1;
        this.player_select_rune_max[player_id] = 100;
        //玩家默认最大3次
        this.player_select_amount[player_id] = 3;

        //初始化英雄相关数据
        if(hHero != null){
            hHero.rune_level_index = {};
            hHero.rune_trigger_count = {};
        }
        GameRules.RuneSystem.GetRuneSelectData(player_id, {});
    }
    /**
     * 获取符文 根据类型
     * @param player_id 
     * @param type 类型
     */
    GetRuneSelectToPlayer(player_id: PlayerID , type : number = 0) {
        //解锁
        // GameRules.CMsg.SendScreenParticleToClient("GetRune", player_id);
        //符文商店选择信息

        let fate_dota: CGEDPlayerRuneSelectServerData = {
            is_check: false ,
            level: this.player_challenge_number[player_id] ,
            item_list: {} ,
            check_index: -1 ,
            is_refresh: false ,
            time : 0 , 
            type : type ,
        };
        // DeepPrintTable(fate_dota);
        this.player_fate_data[player_id].push(fate_dota);
        this.player_challenge_number[player_id]++;
        //推送选择信息
        this.RefreshShopList(player_id);
        // SendCustomMessageToPlayer(
        //     PlayerResource.GetPlayer(player_id),
        //     "DOTA_UI_TEXT_fate_challenge_success"
        // );
        // GameRules.CMsg.SendCommonMsgToPlayer(
        //     player_id,
        //     "#custom_text_get_rune",
        //     {}
        // );
    }
    /**
     * 
     * @param type 获取符文类型 0公共+专属 1公共+天辉 2公共+夜魇
     */
    GetRuneSelectToAll(type : number = 0) {
        let player_count = GetPlayerCount();
        // GameRules.CMsg.SendScreenParticleToClient("GetRune", -1);
        for (let index = 0 as PlayerID; index < player_count; index++) {
            let fate_dota: CGEDPlayerRuneSelectServerData = {
                is_check: false,
                level: this.player_challenge_number[index],
                item_list: {},
                check_index: -1,
                is_refresh: false,
                time : 0,
                type :type,
            };
            this.player_fate_data[index].push(fate_dota);
            this.player_challenge_number[index]++;
            //推送选择信息
            this.RefreshShopList(index);
        }
        // GameRules.CMsg.SendCommonMsgToPlayer(
        //     -1 as PlayerID,
        //     "#custom_text_get_rune",
        //     {}
        // );
    }
    /**
     * 获取物品信息初始化信息
     */
    GetRuneSelectData(player_id: PlayerID, params:  CGED["RuneSystem"]["GetRuneSelectData"], callback?) {
        //商店组成 1未刷新 2未挑战
        let data: CGEDPlayerRuneSelectDataList = {
            item_list : {},
            is_new_fate_check : 0, // 0可以挑战 1 还有未选择的符文 2 挑战中
            refresh_count : 0,
            fate_level : this.player_challenge_number[player_id],
            player_refresh_count: this.player_refresh_count[player_id],
            time : 0 ,
            type : 0 ,
        }; 
        //当有数据才返回
        if (this.player_fate_data[player_id].length > this.player_fate_data_index[player_id]) {
            data.is_new_fate_check = 1;
            data.item_list = this.player_fate_data[player_id][this.player_fate_data_index[player_id]].item_list;
            data.time = this.player_fate_data[player_id][this.player_fate_data_index[player_id]].time;
            data.type = this.player_fate_data[player_id][this.player_fate_data_index[player_id]].type;
        }
        data.refresh_count = this.player_fate_data[player_id].length - this.player_fate_data_index[player_id];

        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "RuneSystem_GetRuneSelectData",
            {
                data
            }
        );
    }
    /**
     * 获取符文列表
     */
    GetPlayerRuneData(player_id: PlayerID, params: CGED["RuneSystem"]["GetPlayerRuneData"], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "RuneSystem_GetPlayerRuneData",
            {
                data: this.player_rune_list[player_id]
            }
        );
    }
    /**
     * 刷新符文物品
     */
    RefreshShopList(player_id: PlayerID, is_sx = false) {
        let fate_data_info = this.player_fate_data[player_id][this.player_fate_data_index[player_id]];
        if(is_sx == true && fate_data_info.is_refresh == true){
            this.player_fate_data[player_id][this.player_fate_data_index[player_id]].is_refresh = false;
        }
        if (fate_data_info.is_refresh == false) {
            let _hero = PlayerResource.GetSelectedHeroEntity(player_id);
            //修改已刷新状态
            fate_data_info.is_refresh = true;
            //最多几样物品
            let amount = this.player_select_amount[player_id];
            let ret_data: { [key: string]: CGEDPlayerRuneSelectData; } = {};
            let shop_wp_list: string[] = [];
            for (let index = 1; index <= amount; index++) { // 45 - 44 
                let rune_sub = this.player_select_rune_max[player_id] - this.check_rune_name[player_id].length;
                if (index > rune_sub) {
                    //补全
                    // for (let adv_i = index + 1; adv_i <= amount; adv_i++) {
                    // ret_data[adv_i] = { name : "null" , level : 1};
                    // shop_wp_list.push(item_name);
                    // }
                    break;
                }
                let item_name = "null";
                if(fate_data_info.type == 1){
                    let key_list = this.tianhui_task_drop_list[player_id].key;
                    let pro_list = this.tianhui_task_drop_list[player_id].pro;
                    item_name = key_list[GetCommonProbability(pro_list)];
                }else if(fate_data_info.type == 2){
                    let key_list = this.nightmare_task_drop_list[player_id].key;
                    let pro_list = this.nightmare_task_drop_list[player_id].pro;
                    item_name = key_list[GetCommonProbability(pro_list)];
                }else{
                    let key_list = this.drop_list[player_id].key;
                    let pro_list = this.drop_list[player_id].pro;
                    item_name = key_list[GetCommonProbability(pro_list)];
                }
                if(item_name == "null"){
                    index--;
                    continue;
                }
                //重复物品跳过
                if (shop_wp_list.includes(item_name)) {
                    //跳过本次 
                    index--;
                    continue;
                }
                // 出现和已获取的道具 跳过
                if (this.check_rune_name[player_id].includes(item_name)) {
                    //跳过本次 
                    index--;
                    continue;
                }
                let level_info = 1;
                let level_index = 0;
                if (RuneConfig[item_name as keyof typeof RuneConfig].is_item_level == 1) {
                    level_index = GetCommonProbability(RuneConfig[item_name as keyof typeof RuneConfig].item_level_pro);
                    level_info = RuneConfig[item_name as keyof typeof RuneConfig].item_level_section[level_index];
                }

                //属性附加 this.rune_attr_list
                let attr_count = 1;
                let ran_number = RandomInt(1 , 100);
                if(ran_number > 98){ // 99  100
                    attr_count = 3;
                }else if(ran_number > 89){
                    attr_count = 2;
                }
                let attr_list : {
                    [ attr_id : string ] : number , //数值
                } = {};

                if(!_hero.prop_count["prop_72"]){
                    for (let a_i = 0; a_i < attr_count ; a_i ++) {
                        let attr_id_index = RandomInt(0 , this.rune_attr_list.length - 1);
                        let attr_id = this.rune_attr_list[attr_id_index];
                        if(attr_list.hasOwnProperty(attr_id)){
                            a_i--;
                        }else{
                            let attr_id_data = RuneAttrConfig[attr_id as keyof typeof RuneAttrConfig];
                            let attr_id_number = this.ZoomNumber(attr_id_data.AttrSection , attr_id_data.Decimal);
                            attr_list[attr_id] = attr_id_number;
                        }
                    }
                }
                ret_data[index] = { name: item_name, level: level_info, level_index: level_index , attr_list : attr_list};
                shop_wp_list.push(item_name);
                this.player_check_rune_name[player_id].push(item_name);
            }
            
            fate_data_info.item_list = ret_data;

            //玩家倒计时
            if(is_sx == false){

                
                let hero = PlayerResource.GetSelectedHeroEntity(player_id);

                if(_hero.prop_count["prop_67"]){
                    GameRules.RuneSystem.TimeSelectRune( player_id );
                }else{
                    let count_down_time = GameRules.GetDOTATime(false,false) + this.count_down_time;
                    fate_data_info.time = count_down_time;
                    hero.StopThink("REFRESH_SHOP_LIST" + "_" + player_id+ "_" + (this.player_fate_data_index[player_id] - 1) );
                    hero.SetContextThink("REFRESH_SHOP_LIST" + "_" + player_id+ "_" + this.player_fate_data_index[player_id], () => {
                        GameRules.RuneSystem.TimeSelectRune( player_id );
                        return null;
                    }, this.count_down_time);
                }
            }
            
        }
        this.GetRuneSelectData(player_id, {});
    }

    /**
     * 数字等比放大缩小功能
     * @param value_scope 
     * @param float 
     */
    ZoomNumber(value_scope : string , float : number) :  number{
        let attr_value = 0;
        let value_list = value_scope.split("-");
        let value_min = tonumber(value_list[0]);
        let value_max = tonumber(value_list[1]);
        //等比放大
        if (float > 0) {
            for (let index = 0; index < float; index++) {
                value_min = value_min * 10;
                value_max = value_max * 10;
            }
        }
        //计算出结果
        attr_value = value_min + RandomInt(0, (value_max - value_min));
        //等比缩小
        if (float > 0) {
            for (let index = 0; index < float; index++) {
                attr_value = attr_value / 10;
            }
        }
        return attr_value;
    }

    
    /**
     * 消耗刷新次数刷新
     * @param player_id 
     * @param params 
     * @param callback 
     */
    ConsumeRefreshCount(player_id: PlayerID, params: CGED["RuneSystem"]["ConsumeRefreshCount"]) {
        if (this.player_refresh_count[player_id] > 0) {
            let fate_data_info = this.player_fate_data[player_id][this.player_fate_data_index[player_id]];
            if (fate_data_info.is_refresh == true) { 
                this.RefreshShopList(player_id , true);
                this.player_refresh_count[player_id]--;
                this.GetRuneSelectData(player_id, params);
            } else {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "符文:没有符文可选？");
            }
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "符文:次数不足");
        }
    }

    /**
     * 倒计时选择符文
     */
    TimeSelectRune(player_id : PlayerID){
        let hero = PlayerResource.GetSelectedHeroEntity(player_id);
        //暂停定时器
        hero.StopThink("REFRESH_SHOP_LIST" + "_" + player_id + "_" + this.player_fate_data_index[player_id]);
        let fate_data_info = this.player_fate_data[player_id][this.player_fate_data_index[player_id]];
        let max_level = -1;
        let select_index = -1;
        for (let index = 1; index <= Object.keys(fate_data_info.item_list).length; index++) {
            const element = fate_data_info.item_list[index];
            if(element.level > max_level){
                select_index = index;
                max_level = element.level;
            }
        }   
        GameRules.RuneSystem.PostSelectRune( player_id , { index : (select_index - 1) })
    }
    /**
     * 选择符文
     */
    PostSelectRune(player_id: PlayerID, params: CGED["RuneSystem"]["PostSelectRune"]) {
        let index = params.index + 1;
        let level_index = 0;
        let hero = PlayerResource.GetSelectedHeroEntity(player_id);
        hero.StopThink("REFRESH_SHOP_LIST" + "_" + player_id+ "_" + this.player_fate_data_index[player_id]);
        GameRules.RuneSystem.player_check_rune_name[player_id] = [];
        if (GameRules.RuneSystem.player_fate_data[player_id].length > GameRules.RuneSystem.player_fate_data_index[player_id]) {
            let fate_data_info = GameRules.RuneSystem.player_fate_data[player_id][GameRules.RuneSystem.player_fate_data_index[player_id]];
            if (!fate_data_info.item_list.hasOwnProperty(index)) {
                print("没有此物品");
                return;
            }
            if (fate_data_info.is_check == true) {
                print("已被选择");
                return;
            }
            let item_name = fate_data_info.item_list[index].name;
            level_index = fate_data_info.item_list[index].level_index;
            let attr_list = fate_data_info.item_list[index].attr_list;
            GameRules.RuneSystem.GetRune(player_id , {"item_name" : item_name , select_type : fate_data_info.type } , level_index ,attr_list);
            //根据选择的符文加载额外的属性
            
            GameRules.RuneSystem.GetSelectRuneAttr(player_id ,item_name ,  attr_list);

            GameRules.RuneSystem.player_fate_data_index[player_id]++;
            fate_data_info.check_index = index;
            fate_data_info.is_check = true;
            
            GameRules.RuneSystem.GetRuneSelectData(player_id, params);

            //刷新一次
            if (GameRules.RuneSystem.player_fate_data[player_id].length > GameRules.RuneSystem.player_fate_data_index[player_id]) {
                GameRules.RuneSystem.RefreshShopList(player_id);
            }
        } else {
            print("没有选择的天命");
        }
    }

    // 添加符文和相关效果
    
    UpdateRuneMdf(name: string,hHero:CDOTA_BaseNPC){
        // 更新符文MDF
        let rune_mdf = hHero.FindModifierByName("modifier_rune_effect") as modifier_rune_effect;
        if(rune_mdf){
            let row_rune_data = RuneConfig[name as keyof typeof RuneConfig]
            let AbilityValues = row_rune_data.AbilityValues;
            let InputAbilityValues: AbilityValuesProps = {};
            for(let k in AbilityValues){
                // let run_k = k; //as keyof typeof AbilityValues;
                let value = this.GetKvOfUnit(hHero,name as "rune_2",k as "value")
                // print("rune_info","item_name",name,run_k,"value",value)
                InputAbilityValues[k] = value
            }
            rune_mdf.Rune_InputAbilityValues(name,InputAbilityValues)
        }
    }
    /**
     * 获取符文
     */
    GetRune(player_id: PlayerID , 
        params: { item_name: string; level?: number; charges?: number; item_index?: number; select_type? : number }, 
        level_index: number = 0 ,
        attr_list : {
            [attr_id: string]: number,
        } = {}
    ) {
        let item_name = params.item_name as keyof typeof RuneConfig;
        let rune_index = 0;
        for (let index = 1; index <= 99; index++) {
            if (!this.player_rune_list[player_id].hasOwnProperty(index)) {
                rune_index = index;
                break;
            }
        }
        let RuneData = RuneConfig[item_name as keyof typeof RuneConfig];
        let is_more_level = RuneData.is_item_level == 1 ? true : false;
        let is_level_up = RuneData.is_level_up == 1 ? true : false;
        let is_all = RuneData.is_all;
        let rune_level = RuneData.item_level_section[level_index];
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);

        let item_level_section_length = GameRules.RuneSystem.rune_keyvalue[item_name as keyof typeof GameRules.RuneSystem.rune_keyvalue].item_level_section.length;
        //品质升级
        let is_level_max = false;
        if (level_index >= (item_level_section_length - 1)) {
            is_level_max = true;
        }
        //写入装备信息
        GameRules.RuneSystem.player_rune_list[player_id][rune_index] = {
            name: item_name,
            index: rune_index,
            level: rune_level,
            level_index: level_index,
            is_award: false,
            is_delete: false,
            is_more_level: is_more_level,
            is_level_up: is_level_up,
            is_level_max: is_level_max,
            attr_list : attr_list,
            
        };
        //符文等级信息
        hHero.rune_level_index[item_name] = level_index;
        hHero.rune_trigger_count[item_name] = 0;
        //修改已选择状态
        GameRules.RuneSystem.check_rune_name[player_id].push(item_name);

        GameRules.CMsg.SendCommonMsgToPlayer(
            -1 as PlayerID,
            "#custom_text_player_rune_selected",
            {
                player_id: player_id,
                rune_name: item_name,
                rune_level: rune_level,
            }
        );

        GameRules.RuneSystem.GetPlayerRuneData(player_id, params);
        //获得属性
        GameRules.RuneSystem.GetRuneValues(player_id, item_name, level_index , is_all);
        //增加通过其他符文获取的符文数量
        GameRules.RuneSystem.player_rune_count[player_id] ++;
        

        //需要添加符文属性
        

        //特殊处理符文变化时
        if(GameRules.RuneSystem.check_rune_name[player_id].includes("rune_102")){ // 聚少成多
            let kv_value = GameRules.RuneSystem.GetKvOfUnit_V2(hHero,"rune_102","value");
                //更新数值 
            let rune_count = GameRules.RuneSystem.check_rune_name[player_id].length;
            let value = rune_count * kv_value;
            let attr_count : CustomAttributeTableType = {
                "AttackDamage" : {
                    "BasePercent" : value,
                }
            };
            GameRules.CustomAttribute.SetAttributeInKey(hHero , "rune_102_RuneGetATK" , attr_count)
        }


        let ret_action_string = RuneData.ret_action;
        let param = RuneData.AbilityValues;
        if (ret_action_string != "null") {
            //执行后续处理....
            GameRules.RuneSystem[ret_action_string](player_id, param, item_name);
        }

        if(item_name == "rune_2"){
           GameRules.HeroTalentSystem.PointsChange(player_id); 
        }
        let select_type = 0;
        //发送日志
        if(params.select_type){
            select_type = params.select_type
        }
        GameRules.ServiceInterface.PostLuaLog(player_id , "获得符文:"+ item_name + ";获取方式:"+ select_type);
        // 更新符文MDF
        this.UpdateRuneMdf(item_name,hHero)
    }
    //获得符文属性
    GetRuneValues(player_id: PlayerID, rune_name: string, level_index: number , is_all : number) {
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let ObjectValues = RuneConfig[rune_name as keyof typeof RuneConfig].ObjectValues;
        let attr_count : CustomAttributeTableType = {};
        if(is_all == 1){
            for (const hero of HeroList.GetAllHeroes()) {
                let my_player_id = hero.GetPlayerID();
                for (let Attr in ObjectValues) {
                    // let attr_values = this.GetKVAttr(rune_name, key, level_index);
                    if(!attr_count.hasOwnProperty(Attr)){
                        attr_count[Attr] = {};
                    }
                    for (const AttrType in ObjectValues[Attr]) {
                        if(typeof ObjectValues[Attr][AttrType] == "number"){
                            attr_count[Attr][AttrType] = ObjectValues[Attr][AttrType];
                        }else{
                            let Str = ObjectValues[Attr][AttrType] as string;
                            let Str_List = Str.split(" ");
                            let value = 0;
                            if(Str_List.length <= (level_index + 1)){ // 2  2
                                value = tonumber(Str_List[Str_List.length - 1])
                            }else{
                                value = tonumber(Str_List[level_index])
                            }
                            attr_count[Attr][AttrType] = value;
                        }
                    }
                }
                GameRules.CustomAttribute.SetAttributeInKey(hero , "r_s_" + rune_name + "_"+ player_id + "_" + my_player_id, attr_count)
            }
        }else{
            for (let Attr in ObjectValues) {
                // let attr_values = this.GetKVAttr(rune_name, key, level_index);
                if(!attr_count.hasOwnProperty(Attr)){
                    attr_count[Attr] = {};
                }
                for (const AttrType in ObjectValues[Attr]) {
                    if(typeof ObjectValues[Attr][AttrType] == "number"){
                        attr_count[Attr][AttrType] = ObjectValues[Attr][AttrType];
                    }else{
                        let Str = ObjectValues[Attr][AttrType] as string;
                        let Str_List = Str.split(" ");
                        let value = 0;
                        if(Str_List.length <= (level_index + 1)){ // 2  2
                            value = tonumber(Str_List[Str_List.length - 1])
                        }else{
                            value = tonumber(Str_List[level_index])
                        }
                        attr_count[Attr][AttrType] = value;
                    }
                }
            }
            GameRules.CustomAttribute.SetAttributeInKey(hHero , "r_s_" + rune_name , attr_count)
        }
    } 
    /**
     * 根据选择的符文
     * @param player_id 
     * @param attr_list 
     */
    GetSelectRuneAttr(player_id: PlayerID , rune_name : string, attr_list : {
        [attr_id: string]: number;
    }){
        if(Object.keys(attr_list).length > 0){
            let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
            let attr_count : CustomAttributeTableType = {};
            for (const key in attr_list) {
                let count = attr_list[key];
                let RuneData = RuneAttrConfig[key as keyof typeof RuneAttrConfig];
                let AttrName = RuneData.AttrName;
                let AttrClass = RuneData.AttrClass;
                if(!attr_count.hasOwnProperty(AttrName)){
                    attr_count[AttrName] = {};
                }
                if(!attr_count[AttrName].hasOwnProperty(AttrClass)){
                    attr_count[AttrName][AttrClass] = count;
                }else{
                    attr_count[AttrName][AttrClass] += count;
                }
            }
            GameRules.CustomAttribute.SetAttributeInKey(hHero , "r_s_se_" + rune_name , attr_count)
        }
    }

    //失去符文属性
    LoseRuneValues(player_id: PlayerID, rune_name: string, level_index: number) {
        print("================LoseRuneValues=================");
        print("rune_name", rune_name);
        print("level_index", level_index);
        // let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        // let AttrValues = RuneConfig[rune_name as keyof typeof RuneConfig].AttrValues;
        // DeepPrintTable(AttrValues);
        // for (let key in AttrValues) {
        //     let attr_values = this.GetKVAttr(rune_name, key, level_index);
        //     print("attr_key :", key, " attr_values :", attr_values);
        //     if (attr_values) {
        //         if (GameRules.PlayerHeroAttributeData["rune_attribute"][hHero.GetEntityIndex()].hasOwnProperty(key)) {
        //             GameRules.PlayerHeroAttributeData["rune_attribute"][hHero.GetEntityIndex()][key as CUnitAttributeType] -= attr_values;
        //         } else {
        //             GameRules.PlayerHeroAttributeData["rune_attribute"][hHero.GetEntityIndex()][key as CUnitAttributeType] = - attr_values;
        //         }
        //     }
        // }
    }

    //符文属性降级或升级
    UpgradeRuneValues(player_id: PlayerID, rune_name: string, level_index: number, old_level_index: number) {
        print("================UpgradeRuneValues=================");
        print("rune_name", rune_name);
        print("level_index", level_index);
        print("old_level_index", old_level_index);
        // let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        // let AttrValues = RuneConfig[rune_name as keyof typeof RuneConfig].AttrValues;
        // for (let key in AttrValues) {
        //     let attr_values = this.GetKVAttr(rune_name, key, level_index) - this.GetKVAttr(rune_name, key, old_level_index);
        //     print("attr_key :", key, " attr_values :", attr_values);
        //     if (attr_values) {
        //         if (GameRules.PlayerHeroAttributeData["rune_attribute"][hHero.GetEntityIndex()].hasOwnProperty(key)) {
        //             GameRules.PlayerHeroAttributeData["rune_attribute"][hHero.GetEntityIndex()][key as CUnitAttributeType] += attr_values;
        //         } else {
        //             GameRules.PlayerHeroAttributeData["rune_attribute"][hHero.GetEntityIndex()][key as CUnitAttributeType] = attr_values;
        //         }
        //     }
        // }
    }

    
    /**
     * 快速获取技能值 (如果大于技能等级则返回最高等级 如果小于最低等级则返回最低等级)
     * @param name 符文名
     * @param key 技能键
     * @param level_index 等级下标
     */
    GetTKV<
        Key extends keyof typeof RuneConfig,
        T2 extends typeof RuneConfig[Key],
    >( rune_name: Key, key : keyof T2["AbilityValues"], level_index: number = 0) {
        let value_key = key as string;
        let length = this.rune_ability_values[rune_name][value_key].length;
        if (length > 0) {
            if (level_index < 0) {
                return this.rune_ability_values[rune_name][value_key][0];
            } else if ((level_index + 1) > length) {
                return this.rune_ability_values[rune_name][value_key][length - 1];
            } else {
                return this.rune_ability_values[rune_name][value_key][level_index];
            }
        } else {
            return this.rune_ability_values[rune_name][value_key][level_index];
        }
    }
    /**
     * 符文数据获取
     * @param hUnit 
     * @param hero 
     * @param key 
     * @param ability_key 
     * @param k2 
     * @returns 
     */
    GetKvOfUnit<
        Key extends keyof typeof RuneConfig,
        T2 extends typeof RuneConfig[Key],
    >(hUnit: CDOTA_BaseNPC,rune_name: Key, ability_key : keyof T2["AbilityValues"]) {
        if(IsServer()){
            let level_index = hUnit.rune_level_index[rune_name];
            if (level_index == null) {
                return 0
            } else {
                return this.GetTKV(rune_name, ability_key, level_index)
            }
        } else {
            // let player_id = hUnit.GetPlayerOwnerID();
            // let netdata = CustomNetTables.GetTableValue("hero_rune",`${player_id}`);
            // if(netdata && netdata[index_key]){
            //     let level_index  = netdata[index_key].uc;
            //     if(level_index > 0){
            //         return this.GetTKV(rune_name, ability_key, level_index - 1)
            //     } else {
            //         return 0
            //     }
            // } else {
            //     return 0
            // }
        }
    }


    /**
     * 符文获取 最低都是1级
     * @param hUnit 
     * @param hero 
     * @param key 
     * @param ability_key 
     * @param k2 
     * @returns 
     */
    GetKvOfUnit_V2<
        Key extends keyof typeof RuneConfig,
        T2 extends typeof RuneConfig[Key],
    >(hUnit: CDOTA_BaseNPC,rune_name: Key, ability_key : keyof T2["AbilityValues"] ) {
        let level_index = hUnit.rune_level_index[rune_name] ?? 0
        return this.GetTKV(rune_name, ability_key, level_index);
    }


    /**
     * 随机升级符文或指定升级符文
     * @param player_id 
     * @param rune_index 
     * @param is_max 是否直接提升到最高级
     */
    UpgradeRune(player_id: PlayerID, rune_index: string = "", is_max: boolean = false) {
        if (rune_index == "") {
            let RuneKeys: string[] = [];
            for (const key in this.player_rune_list[player_id]) {
                if (this.player_rune_list[player_id][key].is_level_up
                    && this.player_rune_list[player_id][key].is_delete == false
                    && this.player_rune_list[player_id][key].is_award == false
                    && this.player_rune_list[player_id][key].is_level_max == false
                ) {
                    RuneKeys.push(key);
                }
            }
            if (RuneKeys.length < 1) {
                GameRules.CMsg.SendCommonMsgToPlayer(
                    player_id as PlayerID,
                    "没有可升级的符文"
                );
                return;
            }
            let random_index = RandomInt(0, RuneKeys.length - 1);
            rune_index = RuneKeys[random_index];
        }
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        if (this.player_rune_list[player_id][rune_index].is_more_level
            && this.player_rune_list[player_id][rune_index].is_delete == false
        ) {
            let PlayerRune = this.player_rune_list[player_id][rune_index];
            let _name = PlayerRune.name;
            let item_level_section_length = GameRules.RuneSystem.rune_keyvalue[_name as keyof typeof GameRules.RuneSystem.rune_keyvalue].item_level_section.length;
            if (item_level_section_length > (PlayerRune.level_index + 1)) {
                GameRules.CMsg.SendCommonMsgToPlayer(
                    player_id as PlayerID,
                    "#custom_text_player_rune_up_1",
                    {
                        player_id : player_id, //玩家id
                        rune_name : _name,//符文名字
                    }
                );
                if (is_max) {
                    this.player_rune_list[player_id][rune_index].level =
                        GameRules.RuneSystem.rune_keyvalue[_name as keyof typeof GameRules.RuneSystem.rune_keyvalue].item_level_section[item_level_section_length - 1];
                    this.player_rune_list[player_id][rune_index].level_index = item_level_section_length - 1;
                    //重设等级
                    hHero.rune_level_index[_name] = this.player_rune_list[player_id][rune_index].level_index;
                    //重算属性
                    GameRules.RuneSystem.UpgradeRuneValues(
                        player_id,
                        _name,
                        item_level_section_length - 1,
                        PlayerRune.level_index,
                    );

                } else {
                    this.player_rune_list[player_id][rune_index].level++;
                    this.player_rune_list[player_id][rune_index].level_index++;
                    if ((item_level_section_length - 1) <= this.player_rune_list[player_id][rune_index].level_index) {
                        this.player_rune_list[player_id][rune_index].is_level_max == true;
                    }
                    //重设等级
                    hHero.rune_level_index[_name] = this.player_rune_list[player_id][rune_index].level_index;
                    //重算属性
                    GameRules.RuneSystem.UpgradeRuneValues(
                        player_id,
                        _name,
                        this.player_rune_list[player_id][rune_index].level_index,
                        this.player_rune_list[player_id][rune_index].level_index - 1,
                    );
                }
                //重新发送可升级属性
                GameRules.CMsg.SendCommonMsgToPlayer(
                    player_id as PlayerID,
                    "#custom_text_player_rune_up",
                    {
                        player_id: player_id,
                        rune_name: _name,
                    }
                );
                this.GetPlayerRuneData(player_id, {});
            } else {
                GameRules.CMsg.SendCommonMsgToPlayer(
                    player_id as PlayerID,
                    "#custom_text_player_rune_up_2",
                    {
                        player_id: player_id,
                        rune_name: _name
                    }
                );
            }
        }
    }
    /**
     * 【飞速成长】
     * @param player_id  //玩家名字
     * @param param  //buff名字
     * @param player_id  //参数
     */
    HeroLevelUp(player_id: PlayerID, param: { level: number }, key: string) {
        //更新数值
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let value = param.level;
        for (let i = 0; i < value; i++) {
            hHero.HeroLevelUp(true)
            let level_up_fx = ParticleManager.CreateParticle(
                "particles/econ/events/ti10/hero_levelup_ti10.vpcf",
                ParticleAttachment.ABSORIGIN_FOLLOW,
                hHero
            )
            ParticleManager.ReleaseParticleIndex(level_up_fx)
        }
    }
    /**
     * 【大量灵魂】
     * @param player_id  //玩家名字
     * @param param  //buff名字
     * @param player_id  //参数
     */
    GetSoul(player_id: PlayerID, param: { soul: number }, key: string) {
        //更新数值
        GameRules.ResourceSystem.ModifyResource(player_id, {
            Soul: param.soul
        })
    }
    /**
     * 【聚少成多】
     * @param player_id  //玩家名字
     * @param param  //buff名字
     * @param player_id  //参数
     */
    RuneGetATK(player_id: PlayerID, param: { value: number }, key: string) {
        //更新数值 
        let rune_count = GameRules.RuneSystem.check_rune_name[player_id].length;
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let value = rune_count * param.value;
        let attr_count : CustomAttributeTableType = {
            "AttackDamage" : {
                "BasePercent" : value,
            }
        };
        GameRules.CustomAttribute.SetAttributeInKey(hHero , "rune_102_RuneGetATK" , attr_count)
        
    }
    /**
     * 【独乐乐】如果自身拥有【独乐乐】，则自身获得双倍加成，所有友军获得【独乐乐】加成
     * @param player_id  //玩家名字
     * @param param  //buff名字
     * @param player_id  //参数
     */
    GetExpPro(player_id: PlayerID, param: { value: number }, key: string) {

        let selfhHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let value = param.value;
        //更新数值
        if(GameRules.RuneSystem.check_rune_name[player_id].includes("rune_116")){
            let count = GetPlayerCount();
            for (let index = 0; index < count; index++) {
                if(index == player_id){
                    return ;
                }
                let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
                let attr_count : CustomAttributeTableType = {
                    "SingleExpeIncrease" : {
                        "BasePercent" : value,
                    }
                };
                GameRules.CustomAttribute.SetAttributeInKey(hHero ,  "rune_106_2_" + player_id  , attr_count)
            }
            value = value * 2;
        }
        let attr_count : CustomAttributeTableType = {
            "SingleExpeIncrease" : {
                "BasePercent" : value,
            }
        };
        GameRules.CustomAttribute.SetAttributeInKey(selfhHero , "rune_106_1_" + player_id , attr_count)
    }
    /**
     * 【众乐乐】 如果自身拥有【独乐乐】，则自身获得双倍加成，所有友军获得【独乐乐】加成
     * @param player_id  //玩家名字
     * @param param  //buff名字
     * @param player_id  //参数
     */
    GetExpProALL(player_id: PlayerID, param: { self: number , else: number }, key: string) {
        //更新数值
        let paramself = param.self;
        let paramelse = param.else;
        //更新数值
        if(GameRules.RuneSystem.check_rune_name[player_id].includes("rune_106")){
            let count = GetPlayerCount();
            for (let index = 0; index < count; index++) {
                let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
                if(index == player_id){
                    let attr_count : CustomAttributeTableType = {
                        "SingleExpeIncrease" : {
                            "BasePercent" : paramself,
                        }
                    };
                    GameRules.CustomAttribute.SetAttributeInKey(hHero , "rune_106_1_" + player_id , attr_count)
                }else{
                    let attr_count : CustomAttributeTableType = {
                        "SingleExpeIncrease" : {
                            "BasePercent" : paramelse,
                        }
                    };
                    GameRules.CustomAttribute.SetAttributeInKey(hHero ,  "rune_116_2_" + player_id  , attr_count)
                }
            }
        }
    }
    /**
     * debug 命令
     */
    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if (cmd == "-tjfw") { 
            //添加一个符文
            let select = tonumber(args[0]) ?? 1;
            let level_index = tonumber(args[1]) ?? 0;
            let playerid = tonumber(args[2]) as PlayerID ?? -1;
            GameRules.RuneSystem.GetRune(playerid != -1 ? playerid : player_id, {
                item_name: "rune_" + select
            }, level_index , {});
            
        } else if (cmd == "-fwxz") { //获取一个符文选择机会
            let count = tonumber(args[0]) ?? 1;
            for (let index = 0; index < count; index++) {
                GameRules.RuneSystem.GetRuneSelectToAll();
            }
        }else if (cmd == "-fwxzb") { //获取一个符文选择机会
            let type = tonumber(args[0]) ?? 0;
            GameRules.RuneSystem.GetRuneSelectToPlayer(player_id , type);
        } else if (cmd == "-bwhq") { //获取符文信息
            GameRules.RuneSystem.GetPlayerRuneData(player_id, {});
        } else if (cmd == "-fwsx") {
            let count = tonumber(args[0]) ?? 1;
            this.player_refresh_count[player_id] += count;
            this.GetRuneSelectData(player_id, {});
        }
    }
}



// export function GainRune(player_id: PlayerID, params: { item_name: string; level?: number; charges?: number; item_index?: number; }) {
//     if(NewRuneSystem == null){
//         NewRuneSystem = new RuneSystem();
//     }
//     NewRuneSystem.GainRune(player_id,params)
// }

// //增加一次全玩家选择符文机会
// export function AddRuneSelect(){
//     let NewRuneSystem = this.init() as RuneSystem    
//     NewRuneSystem.GetRuneSelectToAll()
// }
// //对单个玩家增加一次选择符文机会
// export function AddRuneSelectToPlayer(player_id : PlayerID ){
//     let NewRuneSystem = this.init() as RuneSystem
//     NewRuneSystem.GetRuneSelectToPlayer(player_id)
// }
