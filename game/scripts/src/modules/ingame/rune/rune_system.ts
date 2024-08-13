import * as RuneConfig from "../../../json/config/game/rune/rune_config.json";

import { reloadable } from "../../../utils/tstl-utils";
import { UIEventRegisterClass } from "../../class_extends/ui_event_register_class";
//符文系统
@reloadable
export class RuneSystem extends UIEventRegisterClass {
    //每个玩家掉落列表
    drop_list: { key: string[], pro: number[]; }[] = [];
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
        super("RuneSystem");
        for (let index = 0; index < 6 ; index++) {
            this.drop_list.push({
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
    }
    InitPlayerUpgradeStatus( player_id : PlayerID , hero_id : number , hHero: CDOTA_BaseNPC = null) {
        //掉落列表初始化
        //公共物品物品
        let drop_info: { key: string[], pro: number[]; } = {
            key : [],
            pro : [],
        };
        
        for (let key in RuneConfig) {
            const element = RuneConfig[key as keyof typeof RuneConfig];
            if(element.hero_id == 0 || element.hero_id == hero_id){
                drop_info.key.push(key);
                drop_info.pro.push(element.probability);
            }
        }
        this.drop_list[player_id] = drop_info;
        //初始化刷新次数
        this.player_refresh_count[player_id] = this.player_refresh_count_config;
        this.player_fate_data[player_id] = [];
        this.check_rune_name[player_id] = [];
        this.player_check_rune_name[player_id] = [];
        this.player_fate_data_index[player_id] = 0;
        this.player_challenge_number[player_id] = 1;
        this.player_select_rune_max[player_id] = 100;
        //玩家默认最大3次
        this.player_select_amount[player_id] = 3;

        //初始化英雄相关数据
        if(hHero != null){
            hHero.rune_level_index = {};
        }
        // G.PlayerGameData.PulbicRuneData.ComRuneUseMax = 0
    }
    /**
     * 增加一次符文选择
     */
    GetRuneSelectToPlayer(player_id: PlayerID) {
        //解锁
        // GameRules.CMsg.SendScreenParticleToClient("GetRune", player_id);
        //符文商店选择信息

        let fate_dota: CGEDPlayerRuneSelectServerData = {
            is_check: false,
            level: this.player_challenge_number[player_id],
            item_list: {},
            check_index: -1,
            is_refresh: false,
            time : 0,
        };
        this.player_fate_data[player_id].push(fate_dota);
        this.player_challenge_number[player_id]++;
        //推送选择信息
        this.RefreshShopList(player_id, {});
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
     * 增加所有玩家符文选择
     */
    GetRuneSelectToAll() {
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
            };
            this.player_fate_data[index].push(fate_dota);
            this.player_challenge_number[index]++;
            //推送选择信息
            this.RefreshShopList(index, {});
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
        };
        //当有数据才返回
        if (this.player_fate_data[player_id].length > this.player_fate_data_index[player_id]) {
            data.is_new_fate_check = 1;
            data.item_list = this.player_fate_data[player_id][this.player_fate_data_index[player_id]].item_list;
            data.time = this.player_fate_data[player_id][this.player_fate_data_index[player_id]].time
        }
        data.refresh_count = this.player_fate_data[player_id].length - this.player_fate_data_index[player_id];

        DeepPrintTable(data);
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
    GetPlayerRuneData(player_id: PlayerID, params: CGED["RuneSystem"]["ConsumeRefreshCount"], callback?) {
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
    RefreshShopList(player_id: PlayerID, params: any, callback?) {
        if (this.player_fate_data[player_id][this.player_fate_data_index[player_id]].is_refresh == false) {
            let fate_data_info = this.player_fate_data[player_id][this.player_fate_data_index[player_id]];
            //修改已刷新状态
            fate_data_info.is_refresh = true;
            let fate_level = math.min(6, fate_data_info.level);
            //最多几样物品
            let amount = this.player_select_amount[player_id];
            let ret_data: { [key: string]: CGEDPlayerRuneSelectData; } = {};
            let shop_wp_list: string[] = [];
            let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
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
                let key_list = this.drop_list[player_id].key;
                let pro_list = this.drop_list[player_id].pro;
                let item_name = key_list[GetCommonProbability(pro_list)];
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
                ret_data[index] = { name: item_name, level: level_info, level_index: level_index };
                shop_wp_list.push(item_name);
                this.player_check_rune_name[player_id].push(item_name);
            }
            fate_data_info.item_list = ret_data;

            //玩家倒计时

            let count_down_time = GameRules.GetDOTATime(false,false) + this.count_down_time;
            fate_data_info.time = count_down_time;
            let hero = PlayerResource.GetSelectedHeroEntity(player_id);
            hero.StopThink("REFRESH_SHOP_LIST" + "_" + player_id+ "_" + (this.player_fate_data_index[player_id] - 1) );
            hero.SetContextThink("REFRESH_SHOP_LIST" + "_" + player_id+ "_" + this.player_fate_data_index[player_id], () => {
                GameRules.RuneSystem.TimeSelectRune( player_id );
                return null;
            }, this.count_down_time);

            
        }
        this.GetRuneSelectData(player_id, params);
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
            if (fate_data_info.is_refresh == true) { //
                let fate_level = math.min(6, fate_data_info.level);
                //最多几样物品
                let amount = this.player_select_amount[player_id];
                let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
                let ret_data: { [key: string]: { name: string, level: number, level_index: number; }; } = {};
                let shop_wp_list: string[] = [];
                for (let index = 1; index <= amount; index++) {
                    let rune_sub = this.player_select_rune_max[player_id] - this.check_rune_name[player_id].length;
                    if (index > rune_sub) {
                        //补全  
                        // for (let adv_i = index + 1; adv_i <= amount; adv_i++) {
                        // ret_data[adv_i] = { name : null , level : 1};
                        // shop_wp_list.push(item_name);
                        // }
                        break;
                    }
                    let item_level = 1;
                    let key_list = this.drop_list[player_id].key;
                    let pro_list = this.drop_list[player_id].pro;
                    let item_name = key_list[GetCommonProbability(pro_list)];
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
                        //品质升级
                        if (hHero.rune_passive_type["item_rune_null_93_buff_1"]) {
                            if (RollPercentage(15)) {
                                let item_level_section_length = GameRules.RuneSystem.rune_keyvalue[item_name as keyof typeof GameRules.RuneSystem.rune_keyvalue].item_level_section.length;
                                if ((item_level_section_length - 1) > level_index) {
                                    level_info++;
                                    level_index++;
                                }
                            }
                        }
                    }
                    ret_data[index] = { name: item_name, level: level_info, level_index: level_index };
                    shop_wp_list.push(item_name);
                }
                fate_data_info.item_list = ret_data;
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
        let rune_level = 1;
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
            let rune_index = 0;
            for (let i_x = 1; i_x <= 99; i_x++) { //留下一个自动使用位
                if (!GameRules.RuneSystem.player_rune_list[player_id].hasOwnProperty(i_x)) {
                    rune_index = i_x;
                    break;
                }
            }
            let is_more_level = RuneConfig[item_name as keyof typeof RuneConfig].is_item_level == 1 ? true : false;
            let is_level_up = RuneConfig[item_name as keyof typeof RuneConfig].is_level_up == 1 ? true : false;

            rune_level = fate_data_info.item_list[index].level;
            level_index = fate_data_info.item_list[index].level_index;
            let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
            let item_level_section_length = GameRules.RuneSystem.rune_keyvalue[item_name as keyof typeof GameRules.RuneSystem.rune_keyvalue].item_level_section.length;
            
            let is_level_max = false;
            if (level_index >= (item_level_section_length - 1)) {
                is_level_max = true;
            }
            //写入符文信息
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
            };
            //符文等级信息
            hHero.rune_level_index[item_name] = level_index;
            //修改已选择状态
            GameRules.RuneSystem.check_rune_name[player_id].push(item_name);
            
            GameRules.RuneSystem.player_fate_data_index[player_id]++;
            fate_data_info.check_index = index;
            fate_data_info.is_check = true;
            GameRules.CMsg.SendCommonMsgToPlayer(
                -1 as PlayerID,
                "#custom_text_player_rune_selected",
                {
                    player_id: player_id,
                    rune_name: item_name,
                    rune_level: rune_level,
                }
            );
            GameRules.RuneSystem.GetRuneSelectData(player_id, params);
            GameRules.RuneSystem.GetPlayerRuneData(player_id, params);
            //获得属性
            GameRules.RuneSystem.GetRuneValues(player_id, item_name, level_index);
            //刷新一次
            if (GameRules.RuneSystem.player_fate_data[player_id].length > GameRules.RuneSystem.player_fate_data_index[player_id]) {
                GameRules.RuneSystem.RefreshShopList(player_id, {});
            }
            //增加符文数量
            GameRules.RuneSystem.player_rune_count[player_id] ++;
        } else {
            print("没有选择的天命");
        }
    }

    /**
     * 获取符文
     */
    GetRune(player_id: PlayerID, params: { item_name: string; level?: number; charges?: number; item_index?: number; }, level_index: number = 0) {
        let item_name = params.item_name as keyof typeof RuneConfig;
        let rune_index = 0;
        if (!params.hasOwnProperty("item_index")) {
            for (let index = 1; index <= 99; index++) {
                if (!this.player_rune_list[player_id].hasOwnProperty(index)) {
                    rune_index = index;
                    break;
                }
            }
        } else {
            rune_index = params.item_index;
        }
        let row_rune_data = RuneConfig[item_name]
        let is_more_level = RuneConfig[item_name as keyof typeof RuneConfig].is_item_level == 1 ? true : false;
        let is_level_up = RuneConfig[item_name as keyof typeof RuneConfig].is_level_up == 1 ? true : false;
        if (is_more_level && params.level) {
            if (RuneConfig[item_name as keyof typeof RuneConfig].item_level_section.includes(params.level)) {
                level_index = RuneConfig[item_name as keyof typeof RuneConfig].item_level_section.indexOf(params.level);
            }
        }
        let rune_level = RuneConfig[item_name as keyof typeof RuneConfig].item_level_section[level_index];
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);

        let item_level_section_length = GameRules.RuneSystem.rune_keyvalue[item_name as keyof typeof GameRules.RuneSystem.rune_keyvalue].item_level_section.length;
        //品质升级
        let is_level_max = false;
        if (level_index >= (item_level_section_length - 1)) {
            is_level_max = true;
        }

        //写入装备信息
        this.player_rune_list[player_id][rune_index] = {
            name: item_name,
            index: rune_index,
            level: rune_level,
            level_index: level_index,
            is_award: false,
            is_delete: false,
            is_more_level: is_more_level,
            is_level_up: is_level_up,
            is_level_max: is_level_max
        };
        //符文等级信息
        hHero.rune_level_index[item_name] = level_index;
        //修改已选择状态
        this.check_rune_name[player_id].push(item_name);
        //获得属性
        this.GetRuneValues(player_id, item_name, level_index);
        //移除夏日特惠和秋日特惠内容
        this.GetRuneSelectData(player_id, params);
        this.GetPlayerRuneData(player_id, params);
        // if(hHero.rune_passive_type["item_rune_null_97_buff_1"]){
        //     if(RollPercentage(15)){
        //         GameRules.TreasureSystem.RandomGetTerasure(player_id , 1);
        //     }
        // }
        //增加通过其他符文获取的符文数量
        this.player_rune_count[player_id] ++;

        // 更新符文MDF
        let rune_mdf = hHero.FindModifierByName("modifier_rune_effect");
        if(rune_mdf){
            let AbilityValues = row_rune_data.AbilityValues;
            let InputAbilityValues: AbilityValuesProps = {};
            for(let k in AbilityValues){
                let run_k = k; //as keyof typeof AbilityValues;
                let value = this.GetKvOfUnit(hHero,item_name as "rune_2",run_k as "value")
                InputAbilityValues[run_k] = value
            }
            rune_mdf.Rune_InputAbilityValues(item_name,InputAbilityValues)
        }
    }
    //获得符文属性
    GetRuneValues(player_id: PlayerID, rune_name: string, level_index: number) {
        print("================GetRuneValues=================");
        print("rune_name", rune_name);
        print("level_index", level_index);


        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let ObjectValues = RuneConfig[rune_name as keyof typeof RuneConfig].ObjectValues;
        let attr_count : CustomAttributeTableType = {};
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
        DeepPrintTable(attr_count);
        GameRules.CustomAttribute.SetAttributeInKey(hHero , "r_s_" + rune_name , attr_count)
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
            let level_index = hUnit.rune_level_index[rune_name]
            if (level_index == null) {
                return 0
            } else {
                return this.GetTKV(rune_name, ability_key, level_index - 1)
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
     * debug 命令
     */
    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if (cmd == "-tjfw") { 
            //添加一个符文
            let select = tonumber(args[1]) ?? 1;
            let level_index = tonumber(args[2]) ?? 0;
            let playerid = tonumber(args[2]) as PlayerID ?? -1;
            GameRules.RuneSystem.GetRune(playerid != -1 ? playerid : player_id, {
                item_name: "rune_null_" + select
            }, level_index);
            
        } else if (cmd == "-fwxz") { //获取一个符文选择机会
            let count = tonumber(args[1]) ?? 1;
            for (let index = 0; index < count; index++) {
                GameRules.RuneSystem.GetRuneSelectToAll();
            }
        } else if (cmd == "-bwhq") { //获取符文信息
            GameRules.RuneSystem.GetPlayerRuneData(player_id, {});
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
