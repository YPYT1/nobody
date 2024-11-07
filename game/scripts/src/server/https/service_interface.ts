/**
 *  服务接口
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import { reloadable } from '../../utils/tstl-utils';

import * as ServerSkillExp from "../../json/config/server/hero/server_skill_exp.json";
import * as ServerSkillful from "../../json/config/server/hero/server_skillful.json";

import * as PictuerCardData from "../../json/config/server/picture/pictuer_card_data.json";
import * as PictuerFetterConfig from "../../json/config/server/picture/pictuer_fetter_config.json";

@reloadable
export class ServiceInterface extends UIEventRegisterClass{
    
    //玩家地图等级
    player_map_level : number[] = [ 100 , 100 , 100 , 100 , 100 , 100 ];

    constructor() {
        super("ServiceInterface" , true)
        //初始化总等级
        for (let index = 0; index < 6; index++) {   
            this.PlayerServerSkillLevelCount.push({
                level : {}
            })
            this.player_log_data.push("");
        }
        //初始化分支等级
        for (let index = 0; index < 6; index++) {
            this.PlayerServerSkillTypeLevel.push({})
            //英雄星级
            //需要删除
            this.player_hero_star.push({
                6 : 3
            })
        }
    }
    //玩家对应英雄等级
    player_hero_star : {
        [hero_id : string] : number 
    }[] = [];
    //游戏激活状态
    _game_activate = 0;
    //获取游戏是否激活
    GetGameActivate(player_id: PlayerID, params: any, callback?) {  
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
    PlyaerGameActivate(player_id: PlayerID, params: any, callback?) {
        let key:string = params.key;
        GameRules.ArchiveService.VerificationCode(player_id, key);
    }
    //主类型总等级
    PlayerServerSkillLevelCount : PlayerServerSkillLevelCount[] = [];
    //分支等级
    PlayerServerSkillTypeLevel : CGEDServerSkillTypeLevel[] = [];
    
    /**
     * 经验值转等级
     * @param key 
     */
    GetServerSkillfulLevel(key : string , exp : number) : { level : number , cur_exp : number}{
        let exp_equation = ServerSkillExp[key as keyof typeof ServerSkillExp].exp;
        let yyexp = exp;
        let level = 0;
        
        for (let index = 1; index < 30; index++) { 
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
                };
            }
        }
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
        let level_obj : { [ key : string] : number } =  {};
        for (let index = 1; index <= 15; index++) {
            level_obj[index.toString()] = RandomInt(10000 , 920000);
        }
        for (const key in level_obj) {
            let lvdata = this.GetServerSkillfulLevel( key , level_obj[key]);    
            this.PlayerServerSkillLevelCount[player_id].level[key] = {
                "lv" : lvdata.level,
                "exp" : level_obj[key],
                "type" : tonumber(key),
                "cur_exp" : lvdata.cur_exp,
            }
        }
        //加载分支信息
        GameRules.ServiceInterface.LoadSkillTypeLevel(player_id)
    }

    //分支生效等级
    LoadSkillTypeLevel(player_id : PlayerID){
        for (let index = 1; index <= Object.keys(this.PlayerServerSkillLevelCount[player_id].level).length; index++) {
            const PlayerServerSkillLevelCount = this.PlayerServerSkillLevelCount[player_id].level[index.toString()];
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
    }

    //存档天赋系统


    //存档图鉴系统

    //玩家星数
    player_tj_star_max : number[] = [ 10 , 10 , 10 , 10 , 10 , 10];

    
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
                    CustomDeepCopy(GameRules.ServiceData.server_pictuer_fetter_list[player_id]) as Server_PICTUER_FETTER_CONFIG;
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
                //扣除物品 保存至服务器
                if(check_data.count == 1){
                    // delete GameRules.ServiceData.server_monster_package_list[player_id][check_data.index];
                    GameRules.ServiceData.server_monster_package_list[player_id].splice(check_data.index , 1)
                }else{
                    GameRules.ServiceData.server_monster_package_list[player_id][check_data.index].number -- ;
                }
                GameRules.ServiceData.server_pictuer_fetter_list[player_id] = 
                    CustomDeepCopy(server_pictuer_fetter_copy) as Server_PICTUER_FETTER_CONFIG;
                Timers.CreateTimer(1, () => {
                    GameRules.ServiceInterface.GetPlayerCardList(player_id , {})
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:激活成功...");
                });
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
        GameRules.ServiceData.server_player_config_pictuer_fetter[player_id][i] = CustomDeepCopy(
            GameRules.ServiceData.locality_player_config_pictuer_fetter[player_id][i]
        ) 
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
     * 获取图鉴配置信息
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
            }
            //根据合成的等级获取新卡片
            let new_card : number[] = [];
            let new_card_string : string[] = [];
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
                        new_card_string.push(get_item_id.toString());
                    }else{
                        //不进阶
                        let length = GameRules.ServiceData.server_pictuer_card_special[is_pictuer_id].length;
                        let RInt = RandomInt(0 , length - 1);
                        let get_c_id = tostring(GameRules.ServiceData.server_pictuer_card_special[is_pictuer_id][RInt]);
                        let get_item_id = PictuerCardData[get_c_id as keyof typeof PictuerCardData].item_id;
                        new_card.push(get_item_id);
                        new_card_string.push(get_item_id.toString());
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
                        new_card_string.push(get_item_id.toString());
                        //特殊卡片处理
                    }
                }
                
            }

            //扣除物品 保存至服务器
            for (const itemid in consume) {
                if(consume[itemid].d.count <= consume[itemid].c){
                    // GameRules.ServiceData.server_monster_package_list[player_id][].number = 0;
                    GameRules.ServiceData.server_monster_package_list[player_id].splice(consume[itemid].d.index , 1)
                }else{
                    GameRules.ServiceData.server_monster_package_list[player_id][consume[itemid].d.index].number -= consume[itemid].c;
                }
            }
            //增加数量
            for (let index = 0; index < new_card.length; index++) {
                //判断是否有
                let is_ok = false;
                let item_id =  new_card[index]; 
                let plength = GameRules.ServiceData.server_monster_package_list[player_id].length;
                for (let n = 0; n < plength; n++) {
                    if(GameRules.ServiceData.server_monster_package_list[player_id][n].item_id == item_id){
                        GameRules.ServiceData.server_monster_package_list[player_id][n].number ++;
                        is_ok = true;
                        break
                    }
                }
                if(is_ok == false){
                    GameRules.ServiceData.server_monster_package_list[player_id].push({
                        id : tostring(item_id),
                        "class" : 11 , 
                        "lv" : 1,
                        "number" : 1,
                        "customs" : "",
                        item_id : item_id,
                    })
                }
            }
            this.GetPlayerCardList(player_id , {});

            this.GetCompoundCardList(player_id , new_card_string , type);
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
        DeepPrintTable(GameRules.ServiceData.server_monster_package_list[player_id])
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

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if(cmd == "-LoadSkillfulLevel"){
            this.LoadSkillfulLevel(player_id)
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