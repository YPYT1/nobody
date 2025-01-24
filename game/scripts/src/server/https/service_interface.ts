/**
 *  服务接口
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import { reloadable } from '../../utils/tstl-utils';

import * as ServerSkillExp from "../../json/config/server/hero/server_skill_exp.json";
import * as ServerSkillful from "../../json/config/server/hero/server_skillful.json";

import * as PictuerCardData from "../../json/config/server/picture/pictuer_card_data.json";
import * as PictuerFetterConfig from "../../json/config/server/picture/pictuer_fetter_config.json";
import * as PictuerFetterAbility from "../../json/config/server/picture/pictuer_fetter_ability.json";
import * as NpcHeroesCustom from "../../json/npc_heroes_custom.json";

import  * as ServerItemList  from "../../json/config/server/item/server_item_list.json";

@reloadable
export class ServiceInterface extends UIEventRegisterClass{
    
    //玩家地图等级
    player_map_level : AM2_Server_Exp_Data[] = [];

    fetter_ability_values: {
        [name: string]: {
            [key: string]: number[];
        };
    } = {};

    player_init_count = 4;

    //总经验
    PlayerServerSkillLevelExp : {
        [skill_key : string] : number
    }[] = []
    //主类型总等级
    PlayerServerSkillLevelCount : PlayerServerSkillLevelCount[] = [];
    //分支等级
    PlayerServerSkillTypeLevel : CGEDServerSkillTypeLevel[] = [];
    //商城限购
    ShoppingLimit : AM2_Server_Shopping_Limit[] = [];
    //玩家抽奖记录
    DrawRecord : AM2_Draw_Lottery_Draw_Record[] = [];

    //玩家通行证记录
    PassRecord : AM2_Draw_Pass_Record[] = [];

    constructor() {
        super("ServiceInterface" , true)
        //初始化总等级
        for (let player_id = 0 as PlayerID; player_id < this.player_init_count; player_id ++) {   
            this.PlayerServerSkillLevelCount.push({
                level : {}
            })
            this.player_log_data.push("");
            this.PlayerServerSkillTypeLevel.push({})
            //需要删除
            this.player_hero_star.push({
                6 : 3
            })
            //玩家技能初始经验
            this.PlayerServerSkillLevelExp.push({});
            //初始化玩家限购信息
            this.ShoppingLimit.push(
                {
                    limit : {},
                    sc : "" ,  //首冲信息
                }
            );
            this.DrawRecord.push({});
            this.PassRecord.push({});
            this.player_map_level.push({
                "cur_exp" : 0 , 
                "is_max" : 0 ,
                "level" : 0 ,
                "level_exp" : 0,
            })
        }
        //初始化技能数据
        for (let i_key in PictuerFetterAbility) {
            let data = PictuerFetterAbility[i_key as keyof typeof PictuerFetterAbility];
            this.fetter_ability_values[i_key] = {};
            //技能数组
            for (const A_key in data.AbilityValues) {
                let str = tostring(data.AbilityValues[A_key]);
                let strlist = str.split(" ");
                let numlist: number[] = [];
                for (let value of strlist) {
                    numlist.push(tonumber(value));
                }
                this.fetter_ability_values[i_key][A_key] = numlist;
            }
        }
        
    }
    //玩家对应英雄等级
    player_hero_star : {
        [hero_id : string] : number 
    }[] = [];
    //游戏激活状态
    _game_activate = 0;
    //获取游戏是否激活
    GetGameActivate(player_id: PlayerID, params: CGED["ServiceInterface"]["GetGameActivate"], callback?) {  
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetGameActivate",
            {
                data: {
                    Activate: GameRules.ServiceInterface._game_activate
                }
            }
        );
    }

    //激活游戏
    PlyaerGameActivate(player_id: PlayerID, params: CGED["ServiceInterface"]["PlyaerGameActivate"], callback?) {
        let key:string = params.key;
        GameRules.ArchiveService.VerificationCode(player_id, key);
    }

    /**
     * 地图经验值转等级
     * @param key 
     */
    GetServerMapLevel(exp : number) : AM2_Server_Exp_Data{
        let exp_equation = "lv*500";
        let max_level =  50;
        let yyexp = exp;
        let level = 0;
        for (let index = 1; index < max_level; index++) { 
            let param = {
                lv : index,
            } 
            let use_exp = LFUN.eval(exp_equation , param )
            if(yyexp >= use_exp){
                level ++;
                yyexp -= use_exp;
            }else{
                return {
                    level : level,
                    cur_exp : yyexp,
                    level_exp : use_exp,
                    is_max : 0,
                };
            }
        }
        return {
            level : max_level,
            cur_exp : -1,
            level_exp : -1,
            is_max : 1,
        };
    }
    /**
     * 地图经验更新时处理
     */
    MapExpUpdate(player_id : PlayerID , exp : number){
        if(exp != GameRules.ServiceData.server_gold_package_list[player_id]["1004"].number){
            let new_player_map_level = GameRules.ServiceInterface.GetServerMapLevel(exp);
            let is_up_soul_and_talent = false;
            //是否产生了升级
            if(new_player_map_level.level > GameRules.ServiceInterface.player_map_level[player_id].level){ 
                is_up_soul_and_talent = true;
            }
            GameRules.ServiceInterface.player_map_level[player_id] = new_player_map_level;
            if(is_up_soul_and_talent){
                print("is_up_soul_and_talent true")
            }else{
                print("is_up_soul_and_talent false")
            }
            
            if(is_up_soul_and_talent){
                let map_level = GameRules.ServiceInterface.player_map_level[player_id].level;
                print("map_level : " , map_level)
                //重新发送魂石信息
                GameRules.ServiceSoul.GetPlayerServerSoulData(player_id , {});
                //重新修改天赋点
                for (const key in NpcHeroesCustom) {
                    let hero = NpcHeroesCustom[key as keyof typeof NpcHeroesCustom];
                    let hero_id_str = tostring(hero.HeroID);
                    if(GameRules.ServiceTalent.player_server_talent_list[player_id].hasOwnProperty(hero_id_str)){
                        //如果有 就进行处理
                        for (let x = 0; x < GameRules.ServiceTalent.index_count; x++) {
                            if(GameRules.ServiceTalent.player_server_talent_list[player_id][hero_id_str][x]){
                                let c = GameRules.ServiceTalent.player_talent_list[player_id][hero_id_str][x].u + 
                                    GameRules.ServiceTalent.player_talent_list[player_id][hero_id_str][x].y;
                                if(map_level > c){
                                    let chazhi = map_level - c;
                                    GameRules.ServiceTalent.player_talent_list[player_id][hero_id_str][x].y += chazhi;
                                    GameRules.ServiceTalent.player_server_talent_list[player_id][hero_id_str][x].y += chazhi;
                                }
                            }
                        }
                    }
                }
                //重新推送天赋信息
                GameRules.ServiceTalent.GetPlayerServerTalent(player_id , {});
            }

            GameRules.ServiceInterface.GetPlayerMapLevel(player_id , {});

        }
    }

    /**
     * 技能经验值转等级
     * @param key 
     */
    GetServerSkillfulLevel(key : string , exp : number) : { level : number , cur_exp : number , level_exp : number , is_max : number}{
        let exp_equation = ServerSkillExp[key as keyof typeof ServerSkillExp].exp;
        let max_level =  ServerSkillExp[key as keyof typeof ServerSkillExp].max_level;
        let yyexp = exp;
        let level = 0;
        for (let index = 1; index < max_level; index++) { 
            let param = {
                lv : index,
            } 
            let use_exp = LFUN.eval(exp_equation , param )
            if(yyexp >= use_exp){
                level ++;
                yyexp -= use_exp;
            }else{
                return {
                    level : level,
                    cur_exp : yyexp,
                    level_exp : use_exp,
                    is_max : 0,
                };
            }
        }
        return {
            level : max_level,
            cur_exp : -1,
            level_exp : -1,
            is_max : 1,
        };
    }
    /**
     * 加载存档技能等级
     * @param player_id 
     */
    LoadSkillfulLevelInit(player_id : PlayerID){
        let sse_length = Object.keys(ServerSkillExp);
        for (const element of sse_length) {
            this.PlayerServerSkillLevelExp[player_id][element] = 0
        }
        this.LoadSkillfulLevel(player_id);
    }
    /**
     * 加载存档技能等级
     * @param player_id 
     */
    LoadSkillfulLevel(player_id : PlayerID){
        this.PlayerServerSkillLevelCount[player_id] = {
            level : {}
        }
        this.PlayerServerSkillTypeLevel[player_id] = {};
        let obj_exp = this.PlayerServerSkillLevelExp[player_id];
        //加载主技能经验等级
        for (const key in obj_exp) {
            this.GenerateSkillLevel(player_id, key , obj_exp[key])
        }
        //加载分支信息
        for (const key in this.PlayerServerSkillLevelCount[player_id].level) {
            this.GenerateSkillTypeLevel(player_id , key);
        }
        this.GetPlayerServerSkillData(player_id , {});
    }
    /**
     * 等级预处理
     */
    GenerateSkillLevel(player_id : PlayerID , key : string  , skill_exp : number){
        let is_advanced =  ServerSkillExp[key as keyof typeof ServerSkillExp].is_advanced;
        if(is_advanced == 0){ //不是高级
            let lvdata = this.GetServerSkillfulLevel( key , skill_exp);
            let need_number = lvdata.level_exp - lvdata.cur_exp;
            let need_number_list : { [item_id : number] : number} = {
                1293 : need_number,
            };
            this.PlayerServerSkillLevelCount[player_id].level[key] = {
                "lv" : lvdata.level,
                "exp" : skill_exp,
                "type" : tonumber(key),
                "cur_exp" : lvdata.cur_exp,
                "level_exp" : lvdata.level_exp,
                "is_max" : lvdata.is_max,
                "need_item" : need_number_list,
                "is_adv" : 0,
            }
        }else{
            let max_level =  ServerSkillExp[key as keyof typeof ServerSkillExp].max_level;
            let is_max = 0;
            if(skill_exp >= max_level){
                is_max = 1;
            }
            let need_number_list : { [item_id : number] : number} = {
                1292 : 1,
            };
            this.PlayerServerSkillLevelCount[player_id].level[key] = {
                "lv" : skill_exp,
                "exp" : skill_exp,
                "type" : tonumber(key),
                "cur_exp" : 0,
                "level_exp" : 1,
                "is_max" : is_max,
                "need_item" : need_number_list,
                "is_adv" : 1,
            }
        }
    }

    //分支生效等级 下标
    GenerateSkillTypeLevel(player_id : PlayerID , key : string ){
        const PlayerServerSkillLevelCount = this.PlayerServerSkillLevelCount[player_id].level[key];
        for (const key in ServerSkillful) {
            let ServerSkillfulData = ServerSkillful[key as keyof typeof ServerSkillful];
            //初始化
            if(ServerSkillfulData.type == PlayerServerSkillLevelCount.type){
                //计算等级
                if(ServerSkillfulData.is_lock == 1){ //处理特殊解锁
                    if(PlayerServerSkillLevelCount.lv >= ServerSkillfulData.min_level){
                        this.PlayerServerSkillTypeLevel[player_id][key] = {
                            lv : 1,
                        }
                    }else{
                        this.PlayerServerSkillTypeLevel[player_id][key] = {
                            lv : 0,
                        }
                    }
                }else{
                    if(PlayerServerSkillLevelCount.lv >= ServerSkillfulData.max_level ){
                        this.PlayerServerSkillTypeLevel[player_id][key] = {
                            lv : ServerSkillfulData.max_level - ServerSkillfulData.min_level + 1,
                        }
                    }else{
                        let skill_level = PlayerServerSkillLevelCount.lv - (ServerSkillfulData.min_level - 1)
                        if(skill_level > 0){
                            this.PlayerServerSkillTypeLevel[player_id][key] = {
                                lv : skill_level,
                            }
                        }else{
                            this.PlayerServerSkillTypeLevel[player_id][key] = {
                                lv : 0,
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * 技能升级功能
     * @param player_id 
     * @param params 
     * @param callback 
     */
    ServerSkillUp(player_id: PlayerID, params: CGED["ServiceInterface"]["ServerSkillUp"]) {
        let skill_key = params.key;
        if(this.PlayerServerSkillLevelCount[player_id].level.hasOwnProperty(skill_key)){
            let data = this.PlayerServerSkillLevelCount[player_id].level[skill_key];    
            let max_level =  ServerSkillExp[skill_key as keyof typeof ServerSkillExp].max_level
            let is_advanced =  ServerSkillExp[skill_key as keyof typeof ServerSkillExp].is_advanced
            if(data.lv < max_level){
                let up_exp = 0;
                // itemid_number,itemid_number
                let red_item_str = "";
                
                for (const key in data.need_item) {
                    let item_id_number = tonumber(key);
                    let number = data.need_item[key];

                    if(red_item_str == ""){
                        red_item_str = tostring(item_id_number) + "_" + tostring(number)
                    }else{
                        red_item_str += "," + tostring(item_id_number) + "_" + tostring(number);
                    }
                    let item_ret = GameRules.ServiceData.VerifyPackageItem(player_id , item_id_number , number);
                    if(item_ret.is_verify == false){
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id, "技能升级:材料不足");
                        return ;
                    }
                    if(is_advanced == 1){
                        up_exp = number;
                    }else{
                        up_exp = number;
                    }
                }

                let skill_data = CustomDeepCopy(GameRules.ServiceInterface.PlayerServerSkillLevelExp[player_id]) as {
                    [skill_key : string] : number
                };
                skill_data[skill_key] += up_exp;
                let skill_key_str = JSON.encode(skill_data);
                let zz_exp = this.PlayerServerSkillLevelCount[player_id].level[skill_key].exp + up_exp;

                //此处要修改...
                GameRules.ArchiveService.SkillDataUp(player_id , skill_key_str , red_item_str   , zz_exp , skill_key);
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "技能升级:技能已满级..");
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "技能升级:未找到该技能");
        }
    }
    /**
     * 
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerServerSkillData(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerServerSkillData"], callback?) {  
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerServerSkillData",
            {   
                data: {
                    SkillLevel : GameRules.ServiceInterface.PlayerServerSkillLevelCount[player_id],
                    SkillTypeLevel : GameRules.ServiceInterface.PlayerServerSkillTypeLevel[player_id],
                }
            }
        );
    }
    //玩家星数
    player_tj_star_max : number[] = [ 10 , 10 , 10 , 10 , 10 , 10];

    /**
     * 获取服务器时间 主要用于做限时购买
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetServerTime(player_id: PlayerID, params: CGED["ServiceInterface"]["GetServerTime"], callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetServerTime",
            {
                data: {
                    time : GameRules.ArchiveService._game_t,
                    time_string:GetCustomSystemTime(),
                }
            }
        );
    }

    
    /**
     * 消耗卡片解锁图鉴羁绊
     * @param player_id 
     * @param params 
     * @param callback 
     * @returns 
     */
    PlayerConsumeCard(player_id: PlayerID, params: CGED["ServiceInterface"]["PlayerConsumeCard"], callback?){
        let suit_id =  params.suit_id;
        let card_id =  tonumber(params.card_id);
        let PictuerFetterData = PictuerFetterConfig[suit_id as keyof typeof PictuerFetterConfig];   
        if(PictuerFetterData.card_ids.includes(card_id)){
            //物品id
            let item_id = PictuerCardData[params.card_id as keyof typeof PictuerCardData].item_id;
            let check_data = GameRules.ServiceData.GetMonsterPackageIndexAndCount(player_id , item_id);
            if(check_data.index >= 0 && check_data.count > 0){
                //copy一份数据
                let server_pictuer_fetter_copy = 
                    CustomDeepCopy(GameRules.ServiceData.server_pictuer_fetter_list[player_id]) as ServerPlayerConfigPictuerFetter;
                if(server_pictuer_fetter_copy.hasOwnProperty(suit_id)){
                    if(!server_pictuer_fetter_copy[suit_id].includes(card_id)){
                        server_pictuer_fetter_copy[suit_id].push(card_id);
                    }else{
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:此位置已激活...");
                        return ;
                    }
                }else{
                    server_pictuer_fetter_copy[suit_id] = [card_id];
                }
                let pictuer_data = json.encode(server_pictuer_fetter_copy);
                let red_item_str = item_id + "_1";
                GameRules.ArchiveService.PictuerSave(player_id , pictuer_data , "" , red_item_str , check_data)
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:卡片不足...");
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:配置错误...");
        }
    }
    /**
     * 配置图鉴
     */
    ConfigPictuerFetter(player_id: PlayerID, params: CGED["ServiceInterface"]["ConfigPictuerFetter"], callback?){
        let i = params.index;
        let suit_id = params.suit_id;
        
        if(GameRules.ServiceData.server_pictuer_fetter_list[player_id].hasOwnProperty(suit_id)){
            if(GameRules.ServiceData.server_pictuer_fetter_list[player_id][suit_id].length <= 0){
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:此羁绊未激活...");
                return ;
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:此羁绊未激活...");
            return ;
            
        }
        let use_consume = 0;    
        let suit_consume = 0;
        let consume_max = 10;
        if(GameRules.ServiceData.player_pictuer_vip[player_id] == 1){
            consume_max = 15;
        }
        suit_consume = PictuerFetterConfig[suit_id as keyof typeof PictuerFetterConfig].consume;
        for (let index = 0; index < GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i].length; index++) {
            let u_suit_id = GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i][index];
            use_consume += PictuerFetterConfig[u_suit_id as keyof typeof PictuerFetterConfig].consume;
        }   
        if(use_consume + suit_consume <= consume_max){
            if(!GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i].includes(suit_id)){
                GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i].push(suit_id);
                this.GetConfigPictuerFetter(player_id , {})
            }else{
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:已装备相同羁绊...");    
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:超过最大消耗...");
        }
    }

    /**
     * 卸载图鉴
     */
    UninstallPictuerFetter(player_id: PlayerID, params: CGED["ServiceInterface"]["UninstallPictuerFetter"], callback?){
        let i = params.index;
        let suit_id = params.suit_id;
        if(GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i].includes(suit_id)){
            let index = GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i].indexOf(suit_id);
            GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i].splice( index , 1);
            this.GetConfigPictuerFetter(player_id , {})
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:此图鉴不存在...");
        }
    }

    //保存图鉴配置
    SavePictuerFetter(player_id: PlayerID, params: CGED["ServiceInterface"]["SavePictuerFetter"], callback?){
        let i = params.index;
        //保存数据
        let pictuer_config = json.encode(GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id]);
        GameRules.ArchiveService.PictuerSave(player_id , "" , pictuer_config , "" , null , 2)

        this.GetConfigPictuerFetter(player_id , {})
    }
    //还原图鉴配置
    RestorePictuerFetter(player_id: PlayerID, params: CGED["ServiceInterface"]["RestorePictuerFetter"], callback?){
        let i = params.index;
        //保存数据
        GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i] = CustomDeepCopy(
            GameRules.ServiceData.server_player_config_pictuer_fetter[player_id][i]
        ) 
        this.GetConfigPictuerFetter(player_id , {})
    }

    /**
     * 获取图鉴配置信息
     * @param player_id 
     * @param params 
     */
    GetConfigPictuerFetter(player_id: PlayerID, params: CGED["ServiceInterface"]["GetConfigPictuerFetter"]){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetConfigPictuerFetter",
            {
                data: {
                    server : GameRules.ServiceData.server_player_config_pictuer_fetter[player_id],
                    locality: GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id],
                    is_vip : GameRules.ServiceData.player_pictuer_vip[player_id],
                }
            }
        );
    }

    /**
     * 强制关闭图鉴加载弹窗
     * @param player_id 
     * @param params 
     */
    PictuerLoadClose(player_id: PlayerID){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_PictuerLoadClose",
            {
                data: {
                }
            }
        );
    }

    /**
     * 强制关闭通用加载弹窗
     * @param player_id 
     * @param params 
     */
    PulbicLoadClose(player_id: PlayerID){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_PulbicLoadClose",
            {
                data: {
                }
            }
        );
    }
    /**
     * 卡片合成
     */
    CompoundCard(player_id: PlayerID, params: CGED["ServiceInterface"]["CompoundCard"]){
        let list = params.list as any;
        let type = params.type;
        let list_obj = list as {
            [index : string] : {
                [index : string] : string
            }
        }
        if(Object.keys(list_obj).length <= 8){
            //记录消耗数量 
            let consume : { [id : string ] : {
                c : number,
                d : {
                    count : number;
                    index : number;
                },
            } } = {};
            //检查品质是否一致
            for (const list_key in list_obj) {
                let r = -1;
                for(const d_key in list_obj[list_key]){
                    //品质检测
                    let card_id = list_obj[list_key][d_key];
                    let rarity = PictuerCardData[card_id as keyof typeof PictuerCardData].rarity;
                    if(r == -1){
                        r = rarity;
                    }else{
                        if(r != rarity){
                            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:合成卡片的品质必须相同....");
                            return
                        }
                    }
                    //记录数量
                    let item_id = PictuerCardData[card_id as keyof typeof PictuerCardData].item_id;
                    if(consume.hasOwnProperty(item_id)){
                        consume[item_id].c ++ ;
                    }else{
                        consume[item_id] = {
                            c : 1,
                            d : { count : -1 , index : -1}
                        };
                    }
                }
            }
            let red_item_str = "";
            //检查数量是否足够
            for (const itemid in consume) {
                consume[itemid].d = GameRules.ServiceData.GetMonsterPackageIndexAndCount(player_id , tonumber(itemid))
                if(consume[itemid].d.index < 0){
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:卡片不足...");
                    return ;
                }
                if(consume[itemid].d.count < consume[itemid].c){
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:卡片不足...");
                    return ;
                }
                let need_item_count = consume[itemid].c;
                if(red_item_str == ""){
                    red_item_str = itemid + "_" + need_item_count;
                }else{
                    red_item_str += "," + itemid + "_" + need_item_count;
                }
            }
            //根据合成的等级获取新卡片
            let new_card : number[] = [];
            for (const list_key in list_obj) {
                //特殊卡处理
                let cz_ts = false;
                let is_ts = false;
                let is_pictuer_id = "";
                //先查找是否满足
                for (const spcs_key in GameRules.ServiceData.server_pictuer_card_special) {
                    let ts_list = GameRules.ServiceData.server_pictuer_card_special[spcs_key];
                    for (const ts_key in list_obj[list_key]) {
                        let cid_num = tonumber(list_obj[list_key][ts_key]);
                        if(ts_list.includes(cid_num)){
                            is_pictuer_id = spcs_key;
                            cz_ts = true;
                            is_ts = true;
                            continue; //继续
                        }
                    }
                }
                //是否每个都满足
                if(cz_ts){
                    let ts_list = GameRules.ServiceData.server_pictuer_card_special[is_pictuer_id];
                    for (const ts_key in list_obj[list_key]) {
                        let cid_num = tonumber(list_obj[list_key][ts_key]);
                        if(!ts_list.includes(cid_num)){
                            is_ts = false;
                            continue; //继续
                        }
                    }

                }
                //判断是否为特殊组合
                if(is_ts){
                    if(RollPercentage(13)){
                        //进阶为特殊卡片
                        let get_c_id = is_pictuer_id;
                        let get_item_id = PictuerCardData[get_c_id as keyof typeof PictuerCardData].item_id;
                        new_card.push(get_item_id);
                    }else{
                        //不进阶
                        let length = GameRules.ServiceData.server_pictuer_card_special[is_pictuer_id].length;
                        let RInt = RandomInt(0 , length - 1);
                        let get_c_id = tostring(GameRules.ServiceData.server_pictuer_card_special[is_pictuer_id][RInt]);
                        let get_item_id = PictuerCardData[get_c_id as keyof typeof PictuerCardData].item_id;
                        new_card.push(get_item_id);
                    }
                }else{
                    if(list_obj[list_key].hasOwnProperty("0")){
                        let cid = list_obj[list_key]["0"];        
                        let rarity = PictuerCardData[cid as keyof typeof PictuerCardData].rarity;
                        if(rarity <= 3){
                            if(RollPercentage(13)){
                                rarity = rarity + 1;
                            }else{
                                rarity = rarity ;
                            }
                        }
                        //普通卡片处理
                        let length = GameRules.ServiceData.server_pictuer_card_rarity[rarity].length;
                        let RInt = RandomInt(0 , length - 1);
                        let get_c_id = GameRules.ServiceData.server_pictuer_card_rarity[rarity][RInt];
                        let get_item_id = PictuerCardData[get_c_id as keyof typeof PictuerCardData].item_id;
                        new_card.push(get_item_id);
                        //特殊卡片处理
                    }
                }
            }
            //增加数量
            let add_item_str = "";
            for (let index = 0; index < new_card.length; index++) {
                //判断是否有
                let item_id =  new_card[index]; 
                if(add_item_str == ""){
                    add_item_str = item_id + "_" + 1;
                }else{
                    add_item_str += "," + item_id + "_" + 1;
                }
            }
            GameRules.ArchiveService.PulbicItemAddDel(player_id , red_item_str , add_item_str , 1 , type)
            // this.GetPlayerCardList(player_id , {});

            // this.GetCompoundCardList(player_id , new_card_string , type);
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:卡片合成最大不能超过8个...");
        }
    }
    /**
     * 获取图鉴信息
     * @param player_id 
     * @param params 
     */
    GetPlayerCardList(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerCardList"]){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerCardList",
            {
                data: {
                    card : GameRules.ServiceData.server_monster_package_list[player_id],
                    pictuer_list : GameRules.ServiceData.server_pictuer_fetter_list[player_id],
                }
            }
        );
    }

    /**
     * 通过合成获得新卡片
     * @param player_id 
     * @param params 
     */
    GetCompoundCardList(player_id: PlayerID , cardlist : string[] , type : number = 1){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetCompoundCardList",
            {
                data: {
                    card : cardlist, //卡片id
                    type : type , //  0 背对显示 1 正常显示 
                }
            }
        );
    }
    /**
     * 玩家日志log
     */
    player_log_data : string[] = [];

    /**
     * 获取背包数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerServerPackageData(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerServerPackageData"], callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerServerPackageData",
            {
                data: GameRules.ServiceData.server_package_list[player_id]
            }
        );
    };
    /**
     * 获取货币相关数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerServerGoldPackageData(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerServerPackageData"], callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerServerGoldPackageData",
            {
                data: GameRules.ServiceData.server_gold_package_list[player_id]
            }
        );
    };

    /**
     * 获取地图经验
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerMapLevel(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerMapLevel"], callback?){
        
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerMapLevel",
            {
                data : GameRules.ServiceInterface.player_map_level[player_id],
            }
        );
    };
    /**
     * 获取数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetServerItemPopUp(player_id: PlayerID, add_items : AM2_Server_Backpack[] , callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetServerItemPopUp",
            {
                data : {
                    items : add_items
                }
            }
        );
    };


    /**
     * 获取数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    RechargeOrderData(player_id: PlayerID, pay_order : string , pay_m : string){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_RechargeOrderData",
            {
                data : {
                    pay_order : pay_order, //订单编号
                    pay_m : pay_m, //订单支付秘钥
                }
            }
        );
    };

    /**
     * 获取抽奖结果
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerServerDrawLottery(player_id: PlayerID , lottery_data : AM2_Draw_Lottery_Data[] ){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerServerDrawLottery",
            {
                data: lottery_data
            }
        );
    };

    
    /**
     * 获取抽奖记录
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerServerDrawLotteryDrawRecord(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerServerDrawLotteryDrawRecord"], callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerServerDrawLotteryDrawRecord",
            {
                data: GameRules.ServiceInterface.DrawRecord[player_id]
            }
        );
    };

    /**
     * 成长礼记录
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerServerPassRecord(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerServerDrawLotteryDrawRecord"], callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerServerPassRecord",
            {
                data: GameRules.ServiceInterface.PassRecord[player_id]
            }
        );
    };




    /**
     * 限购数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerShoppingLimit(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerShoppingLimit"], callback?){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerShoppingLimit",
            {
                data : GameRules.ServiceInterface.ShoppingLimit[player_id],
            }
        );
    };
    


    /**
     * 月卡 vip功能
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerVipData(player_id: PlayerID, params: CGED["ServiceInterface"]["GetPlayerVipData"], callback?){

        let d : {
            [shop_id : string] : {
                item_id : string,
                t : number,
            }
        } = {
            "1" : {
                item_id : "20000",
                t : GameRules.ServiceData.player_vip_data[player_id].vip_times,
            },
            "2" : {
                item_id : "20001",
                t : GameRules.ServiceData.player_vip_data[player_id].vip_zs == 1 ? -1 : 0,
            },
        }
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_GetPlayerVipData",
            {
                data : d,
            }
        );
    };
    

    /**
     * 更新背包物品
     * @param player_id 
     * @param params 
     * @param callback 
     */
    PackageDataUpdate(player_id: PlayerID, ServerBackpackUpdate: AM2_Server_Backpack_Update[]){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceInterface_PackageDataUpdate",
            {
                data : ServerBackpackUpdate
            }
        );
    };

    /**
     * 日志系统
     * @param msg 
     * @param player_id -1为全部玩家
     */
    PostLuaLog(player_id: PlayerID ,  msg : string){
        let gametime = math.floor(GameRules.GetDOTATime(false, false) - GameRules.GameInformation.play_game_time);
        let gametimegsh = "";
        let hour_str = "00";
        let minute_str = "00";
        let second_str = "00";
        
        if(gametime > 3600 ){
            let gametime_int = math.floor(gametime/3600);
            if(gametime_int < 10){
                hour_str = "0" + gametime_int;
            }else{
                hour_str = gametime_int.toString();
            }
        }
        if(gametime > 60){
            let minute_int = math.floor((gametime%3600) / 60);
            if(minute_int < 10){
                minute_str = "0" + minute_int;
            }else{
                minute_str = minute_int.toString();
            }
        }
        if(gametime > 1){
            let second_int = (gametime%60);
            if(second_int < 10){
                second_str = "0" + second_int;
            }else{
                second_str = second_int.toString();
            }

        }
        gametimegsh = hour_str + ":" + minute_str + ":" + second_str;

        if(player_id == -1){
            let player_count = GetPlayerCount();
            for (let index = 0; index < player_count; index++) {
                this.player_log_data[index] += gametimegsh + msg + "\n";
            }
        }else{
            this.player_log_data[player_id] += gametimegsh + msg + "\n";
        }
    } 
    /**
     * 发送日志 并清空数据
     * @param cmd 
     * @param args 
     * @param player_id 
     */
    SendLuaLog(player_id: PlayerID){
        let send_obj : { [sid: string]: string; } = {}
        if(player_id == -1){
            let player_count = GetPlayerCount();
            for (let index = 0 as PlayerID; index < player_count; index++) {
                if(this.player_log_data[index] != ""){
                    let Hero = PlayerResource.GetSelectedHeroEntity(index);
                    let steam_id = PlayerResource.GetSteamAccountID(index).toString();
                    let hero_level = Hero.GetLevel();
                    send_obj[steam_id] =  "第"+  GameRules.MapChapter.game_count  +"次游戏:" 
                        + ";当前波数:" + GameRules.Spawn._round_index + ";" 
                        + ";英雄等级:" + hero_level + ";" 
                        + "\n" +this.player_log_data[index];
                    this.player_log_data[index] = "";
                }
            }
        }else{
            if(this.player_log_data[player_id] != ""){
                let Hero = PlayerResource.GetSelectedHeroEntity(player_id);
                let steam_id = PlayerResource.GetSteamAccountID(player_id).toString();
                let hero_level = Hero.GetLevel();
                send_obj[steam_id] =  "第"+  GameRules.MapChapter.game_count + "次游戏" 
                    + ";当前波数:" + GameRules.Spawn._round_index 
                    + ";英雄等级:" + hero_level + ";" 
                    + "\n" +this.player_log_data[player_id];
                this.player_log_data[player_id] = "";
            }
        }
        
        if(Object.keys(send_obj).length > 0){
            GameRules.ArchiveService.PostLuaLog(player_id , send_obj);
        }
    }

    /**
     * 商店购买
     * @param player_id 
     * @param params 
     * @param callback 
     */
    ShoppingBuy(player_id: PlayerID, params: CGED["ServiceInterface"]["ShoppingBuy"], callback?){
        let shop_id = tonumber(params.shop_id);
        let count = tonumber(params.count);
        GameRules.ArchiveService.ShoppingBuy(player_id , shop_id , count);
    };
    /**
     * 抽奖
     */
    DrawLottery(player_id: PlayerID, params: CGED["ServiceInterface"]["DrawLottery"], callback?){
        let paramstype = params.type;
        let count = params.count;
        GameRules.ArchiveService.DrawLottery(player_id , paramstype , count);
    }
    /**
     * 物品使用
     */
    UseItem(player_id: PlayerID, params: CGED["ServiceInterface"]["UseItem"], callback?){
        let use_item_id  = params.use_item_id;
        let count = params.count;
        GameRules.ArchiveService.UseItem(player_id , use_item_id  , count);
    }
    /**
     * 累抽领取
     */
    GetServerDrawAcc(player_id: PlayerID, params: CGED["ServiceInterface"]["GetServerDrawAcc"], callback?){
        let paramstype = params.type;
        let count = params.count;
        GameRules.ArchiveService.GetServerDrawAcc(player_id , paramstype , count);
    }
    /**
     * 累抽领取
     */
    GetServerPass(player_id: PlayerID, params: CGED["ServiceInterface"]["GetServerPass"], callback?){
        let paramstype = params.type;
        let count = params.count;
        let get_type = params.get_type;
        GameRules.ArchiveService.GetServerPass(player_id , paramstype , count , get_type);
    }

    /**
     * 兑换码
     */
    GameDhm(player_id: PlayerID, params: CGED["ServiceInterface"]["GameDhm"], callback?){
        let key = params.key;
        GameRules.ArchiveService.GameDhm(player_id , key );
    }


    /**
     * 生成支付订单
     */
    RechargeOrder(player_id: PlayerID, params: CGED["ServiceInterface"]["RechargeOrder"], callback?){
        let from = params.from;
        let count = params.count;
        let shop_id = params.shop_id;
        GameRules.ArchiveService.RechargeOrder(player_id , from , count , shop_id);
    }
    /**
     * 查询订单
     */
    GetOrderItem(player_id: PlayerID, params: CGED["ServiceInterface"]["GetOrderItem"], callback?){
        let pay_order = params.pay_order;
        GameRules.ArchiveService.GetOrderItem(player_id , pay_order );
    }
    
    /**
     * 快速获取技能值 (如果大于技能等级则返回最高等级 如果小于最低等级则返回最低等级)
     * @param name 符文名
     * @param key 技能键
     * @param level_index 等级下标
     */
    GetTKVOfFa<
        Key extends keyof typeof PictuerFetterAbility,
        T2 extends typeof PictuerFetterAbility[Key],
    >(prop_name: Key, key: keyof T2["AbilityValues"], level_index: number = 0) {
        let value_key = key as string;
        //因为只有 1级 所以全部返回 0 的下标
        // return this.prop_ability_values[prop_name][value_key][0];
        let length = this.fetter_ability_values[prop_name][value_key].length;
        if (length > 0) {
            if (level_index < 0) {
                return this.fetter_ability_values[prop_name][value_key][0];
            } else if ((level_index + 1) > length) {
                return this.fetter_ability_values[prop_name][value_key][length - 1];
            } else {
                return this.fetter_ability_values[prop_name][value_key][level_index];
            }
        } else {
            return this.fetter_ability_values[prop_name][value_key][level_index];
        }
    }
    /**
     * 图鉴Ability数据获取 ----> GameRules.ServiceInterface.GetKvOfUnit
     * @param hUnit // 英雄实体
     * @param prop_name // 图鉴
     * @param ability_key //道具ability key
     * @returns 
     */
    GetKvOfUnit<
        Key extends keyof typeof PictuerFetterAbility,
        T2 extends typeof PictuerFetterAbility[Key],
    >(hUnit: CDOTA_BaseNPC, prop_name: Key, ability_key: keyof T2["AbilityValues"]) {
        if (IsServer()) {
            let prop_count = hUnit.pictuer_ability_name[prop_name];
            if (prop_count == null) {
                return 0
            } else {
                return this.GetTKVOfFa(prop_name, ability_key, prop_count) 
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

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if(cmd == "-LoadSkillfulLevelInit"){
            this.LoadSkillfulLevelInit(player_id)
        }
        if(cmd == "-PlayerConsumeCard"){
            let suit_id = args[0];
            let card_id = args[1];
            this.PlayerConsumeCard(player_id,{
                suit_id : suit_id,
                card_id : card_id,
            })
        }
        if(cmd == "-ConfigPictuerFetter"){
            let index = tonumber(args[0]);
            let suit_id = args[1];
            this.ConfigPictuerFetter(player_id , {
                index : index,
                "suit_id" : suit_id,
            })
        }
        if(cmd == "-UninstallPictuerFetter"){
            let index = tonumber(args[0]);
            let suit_id = args[1];
            this.UninstallPictuerFetter(player_id , {
                index : index,
                "suit_id" : suit_id,
            })
        }
        if(cmd == "!CC"){
            let list = [[ args[0]  ,args[1]  , args[2]]];
            // this.CompoundCard(player_id , {
            //     list : list,

            // })
        }
        if(cmd == "-SendLuaLog"){
            this.SendLuaLog(-1)
        }

        if(cmd == "-DrawLottery"){
            this.DrawLottery(player_id , {"count" : 10 , "type" : 1});
        }

        // //解锁图鉴
        // PlayerConsumeCard : {
        //     suit_id : string ,
        //     card_id : string ,
        // }
        // //装备图鉴
        // ConfigPictuerFetter : {
        //     index : number , //装备栏位
        //     suit_id : string , //图鉴id
        // }
        // //卸载图鉴
        // UninstallPictuerFetter : {
        //     index : number , //装备栏位
        //     suit_id : string , //图鉴id
        // }
        // //卡片合成
        // CompoundCard : {
        //     list : string[][],  //结构 [ [ 3 ,4 ,6] , [ 5 ,7 , 9] ] 为两个合成 最多八个
        // }

        // //获取图鉴信息
        // GetConfigPictuerFetter : {

        // }
        // //获取玩家所有卡片
        // GetPlayerCardList : {

        // }
    }
}