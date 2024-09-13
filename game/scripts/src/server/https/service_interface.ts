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
                    delete GameRules.ServiceData.server_monster_package_list[player_id][check_data.index];
                }else{
                    GameRules.ServiceData.server_monster_package_list[player_id][check_data.index].number -- ;
                }
                GameRules.ServiceData.server_pictuer_fetter_list[player_id] = 
                    CustomDeepCopy(server_pictuer_fetter_copy) as Server_PICTUER_FETTER_CONFIG;
                    
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:激活成功...");
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
        suit_consume = PictuerFetterConfig[suit_id as keyof typeof PictuerFetterConfig].consume;
        let dataconfig = CustomDeepCopy(GameRules.ServiceData.server_player_config_pictuer_fetter[player_id]) as string[][];
        for (let index = 0; index < dataconfig[i].length; index++) {
            let u_suit_id = dataconfig[i][index];
            use_consume += PictuerFetterConfig[u_suit_id as keyof typeof PictuerFetterConfig].consume;
        }   
        if(use_consume + suit_consume <= consume_max){
            if(!dataconfig[i].includes(suit_id)){
                dataconfig[i].push(suit_id);
                //保存数据
                GameRules.ServiceData.server_player_config_pictuer_fetter[player_id] = CustomDeepCopy(dataconfig) 

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
        let dataconfig = CustomDeepCopy(GameRules.ServiceData.server_player_config_pictuer_fetter[player_id]) as string[][];
        if(dataconfig[i].includes(suit_id)){
            let index = dataconfig[i].indexOf(suit_id);
            dataconfig[i].splice( index , 1);
            //保存数据
            GameRules.ServiceData.server_player_config_pictuer_fetter[player_id] = CustomDeepCopy(dataconfig);
            this.GetConfigPictuerFetter(player_id , {})
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "怪物图鉴:此图鉴不存在...");    
        }
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
                    pictuer : GameRules.ServiceData.server_player_config_pictuer_fetter[player_id],
                }
            }
        );
    }
    /**
     * 卡片合成
     */
    CompoundCard(player_id: PlayerID, params: CGED["ServiceInterface"]["CompoundCard"]){
        let list = params.list as any;
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
            for (const list_key in list_obj) {
                let cid = list_obj[list_key][1];
                let rarity = PictuerCardData[cid as keyof typeof PictuerCardData].rarity;
                if(RollPercentage(13)){
                    rarity = rarity + 2;
                }else{
                    rarity = rarity + 1;
                }
                rarity = math.min( 5 , rarity );
                //普通卡片处理
                let length = GameRules.ServiceData.server_pictuer_card_rarity[rarity].length;
                let RInt = RandomInt(0 , length - 1);
                let get_c_id = GameRules.ServiceData.server_pictuer_card_rarity[rarity][RInt];
                let get_item_id = PictuerCardData[get_c_id as keyof typeof PictuerCardData].item_id;
                new_card.push(get_item_id);
                //特殊卡片处理
            }

            //扣除物品 保存至服务器
            for (const itemid in consume) {
                if(consume[itemid].d.count <= consume[itemid].c){
                    GameRules.ServiceData.server_monster_package_list[player_id][consume[itemid].d.index].number = 0;
                }else{
                    GameRules.ServiceData.server_monster_package_list[player_id][consume[itemid].d.index].number -= consume[itemid].c;
                }
            }
            //增加数量
            for (let index = 0; index < new_card.length; index++) {
                //判断是否有
                let is_ok = false;
                let item_id =  new_card[index]; 
                for (let n = 0; index < GameRules.ServiceData.server_monster_package_list[player_id].length; n++) {
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
                }
            }
        );
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
            this.CompoundCard(player_id , {
                list : list,
            })
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
        //     list : string[][],  //结构 [ [ 3 ,4 ,6] , [ 5 ,7 , 9] ] 为两个合成 最多十个
        // }

        // //获取图鉴信息
        // GetConfigPictuerFetter : {

        // }
        // //获取玩家所有卡片
        // GetPlayerCardList : {

        // }
    }
}