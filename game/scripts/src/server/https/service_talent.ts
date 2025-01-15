/**
 *  服务接口
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import { reloadable } from '../../utils/tstl-utils';

import * as ServerTalentData from "../../json/config/server/hero/server_talent_data.json";
import * as NpcHeroesCustom from "../../json/npc_heroes_custom.json";

@reloadable
export class ServiceTalent extends UIEventRegisterClass{

    //玩家数量
    player_count = 4;
    //存档天赋保存的天赋(临时数据)
    player_talent_list: {
        [hero_id: string] : CGEDGetTalentListInfo[];
    }[] = [];
    //存档天赋保存的天赋
    player_server_talent_list: {
        [hero_id: string]: CGEDGetTalentListInfo[];
    }[] = [];

    //英雄  层数 节点 对应key
    player_talent_node_config : {
        [hero_id: number] : {
            [tier_number : number ] : {
                [parent_node : number] : string //最终key
            }
        }
    } = {}

    //基础解锁所需投入点
    basic_input = 5;
    //其他层可点天赋 3
    or_input = 3;
    //最终可点天赋 
    count_input = 30;
    //初始化栏位
    index_count = 3;

    constructor() {
        super("ServiceTalent" , true)
        // this.Init();
        //初始化总等级
        for (let index = 0; index < this.player_count; index++) { 
            //根据英雄初始化
            this.player_talent_list.push({

            })
            //
            this.player_server_talent_list.push({
                
            });
        }

        //初始化可以点的天赋
        for (const key in NpcHeroesCustom) {
            let hero = NpcHeroesCustom[key as keyof typeof NpcHeroesCustom];
            //初始化可以点的天赋
            for( const Tkey in ServerTalentData){
                let TalentData  = ServerTalentData[Tkey as keyof typeof ServerTalentData];
                let hero_id_str = tostring(hero.HeroID);
                if(tostring(TalentData.hero_id) == hero_id_str){
                    //第一个玩家才加载
                    if(!this.player_talent_node_config.hasOwnProperty(hero_id_str)){
                        this.player_talent_node_config[hero_id_str] = {};
                    }
                    if(!this.player_talent_node_config[hero_id_str].hasOwnProperty(TalentData.tier_number)){
                        this.player_talent_node_config[hero_id_str][TalentData.tier_number] = {};
                    }
                    this.player_talent_node_config[hero_id_str][TalentData.tier_number][TalentData.parent_node] = Tkey;
                }
            }
        }
    }
    /**
     * 通过玩家id初始化
     * @param player_id 
     * @param map_level 
     * @param data_json 
     */
    ServiceTalentInitByPlayerId(player_id : PlayerID , map_level : number , data_json : string = ""){
        if(data_json != ""){
            this.player_talent_list[player_id] = JSON.decode(data_json) as {
                [hero_id: number]: CGEDGetTalentListInfo[];
            };
            this.player_server_talent_list[player_id] = JSON.decode(data_json) as {
                [hero_id: number]: CGEDGetTalentListInfo[];
            };
        }else{
            this.player_talent_list[player_id] = {};
            this.player_server_talent_list[player_id] = {};
        }
            
        //进行数据补充
        for (const key in NpcHeroesCustom) {
            let hero = NpcHeroesCustom[key as keyof typeof NpcHeroesCustom];
            let hero_id_str = tostring(hero.HeroID);
            if(this.player_server_talent_list[player_id].hasOwnProperty(hero_id_str)){
                //如果有 就进行处理
                for (let x = 0; x < this.index_count; x++) {
                    if(this.player_server_talent_list[player_id][hero_id_str][x]){
                        let c = this.player_talent_list[player_id][hero_id_str][x].u + this.player_talent_list[player_id][hero_id_str][x].y;
                        if(map_level > c){
                            let chazhi = map_level - c;
                            this.player_talent_list[player_id][hero_id_str][x].y += chazhi;
                            this.player_server_talent_list[player_id][hero_id_str][x].y += chazhi;
                        }
                    }else{
                        this.player_talent_list[player_id][hero_id_str].push({
                            u : 0 , //总投入点 用于反算可以使用的点
                            y : map_level , //可用天赋点
                            i : {} ,
                        })
                        this.player_server_talent_list[player_id][hero_id_str].push({
                            u : 0 , //总投入点 用于反算可以使用的点
                            y : map_level , //可用天赋点
                            i : {} ,
                        })
                        //初始化可以点的天赋
                        for( const Tkey in ServerTalentData){
                            let TalentData  = ServerTalentData[Tkey as keyof typeof ServerTalentData];
                            if(tostring(TalentData.hero_id) == hero_id_str){
                                if(TalentData.tier_number == 0 && TalentData.parent_node == 0){
                                    this.player_talent_list[player_id][hero_id_str][x].i[tostring(TalentData.tier_number)] = {
                                        c : 0,
                                        k : {
                                            [Tkey] : {
                                                uc : 0,
                                            }
                                        }
                                    }
                                    this.player_server_talent_list[player_id][hero_id_str][x].i[tostring(TalentData.tier_number)] = {
                                        c : 0,
                                        k : {
                                            [Tkey] : {
                                                uc : 0 ,
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }else{
                this.player_talent_list[player_id][hero_id_str] = [];
                this.player_server_talent_list[player_id][hero_id_str] = [];
                for (let x = 0; x < this.index_count; x++) {
                    this.player_talent_list[player_id][hero_id_str].push({
                        u : 0 , //总投入点 用于反算可以使用的点
                        y : map_level , //可用天赋点
                        i : {} ,
                    })
                    this.player_server_talent_list[player_id][hero_id_str].push({
                        u : 0 , //总投入点 用于反算可以使用的点
                        y : map_level , //可用天赋点
                        i : {} ,
                    })
                }
                //初始化可以点的天赋
                for( const Tkey in ServerTalentData){
                    let TalentData  = ServerTalentData[Tkey as keyof typeof ServerTalentData];
                    if(tostring(TalentData.hero_id) == hero_id_str){
                        if(TalentData.tier_number == 0 && TalentData.parent_node == 0){
                            for (let y = 0; y < this.index_count; y++) {
                                this.player_talent_list[player_id][hero_id_str][y].i[tostring(TalentData.tier_number)] = {
                                    c : 0,
                                    k : {
                                        [Tkey] : {
                                            uc : 0,
                                        }
                                    }
                                }
                                this.player_server_talent_list[player_id][hero_id_str][y].i[tostring(TalentData.tier_number)] = {
                                    c : 0,
                                    k : {
                                        [Tkey] : {
                                            uc : 0 ,
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    //初始化！
    Init(){
        
    }
    //获取玩家装备配置
    GetPlayerServerTalent(player_id: PlayerID, params: CGED["ServiceTalent"]["GetPlayerServerTalent"], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceTalent_GetPlayerServerTalent",
            {
                data: {
                    server: this.player_server_talent_list[player_id],
                    local: this.player_talent_list[player_id]
                }
            }
        );
    }
    /**
     * 获取存档天赋by英雄和配置id
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerServerTalentByHero(player_id: PlayerID, params: CGED["ServiceTalent"]["GetPlayerServerTalentByHero"], callback?){
        let hero_id = params.hero_id;
        let index = params.index;
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceTalent_GetPlayerServerTalentByHero",
            {
                data: {
                    server: this.player_server_talent_list[player_id][hero_id][index],
                    local: this.player_talent_list[player_id][hero_id][index]
                }
            }
        );
    }
    //加载服务器配置
    LoadPlayerServerTalent(player_id : PlayerID , Data : { [hero_id : number] : string}){
        let player_map_level = GameRules.ServiceInterface.player_map_level[player_id];
        for (const key in Data) {
            let hero_id : number = tonumber(key);
            if(Data[hero_id] != ""){
                this.player_server_talent_list[player_id][hero_id] = JSON.decode(Data[hero_id]) as CGEDGetTalentListInfo[];
                this.player_talent_list[player_id][hero_id] = JSON.decode(Data[hero_id]) as CGEDGetTalentListInfo[];
            }
        }
        for (const key in this.player_server_talent_list[player_id]) {
            let hero_id : number = tonumber(key);
            this.player_server_talent_list[player_id][hero_id][0].y  = player_map_level - this.player_server_talent_list[player_id][hero_id][0].u;
            this.player_talent_list[player_id][hero_id][0].y  = player_map_level - this.player_server_talent_list[player_id][hero_id][0].u;
        }
    }
    
    /**
     * 点天赋
     * @param player_id 
     * @param params 
     * @param callback 
     */
    ClickTalent(player_id: PlayerID, params: CGED["ServiceTalent"]["ClickTalent"], callback?) {
        let key = params.key;
        let ti = params.index;
        let TalentData = ServerTalentData[key as keyof typeof ServerTalentData];
        let hero_id = tostring(TalentData.hero_id);
        let tier = TalentData.tier_number;
        let tier_str = tostring(TalentData.tier_number)
        let parent_node = TalentData.parent_node;
        let max = TalentData.max_number; //最多点几点
        if(this.player_talent_list[player_id][hero_id][ti].y > 0){
            if(this.player_talent_list[player_id][hero_id][ti].i.hasOwnProperty(tier_str)){
                if(this.player_talent_list[player_id][hero_id][ti].i[tier_str].k.hasOwnProperty(key)){
                    if(this.player_talent_list[player_id][hero_id][ti].i[tier_str].k[key].uc < max){
                        //查看是否满足解锁条件 三种类型

                        //修改数据
                        this.player_talent_list[player_id][hero_id][ti].i[tier_str].k[key].uc ++;
                        this.player_talent_list[player_id][hero_id][ti].y --;
                        this.player_talent_list[player_id][hero_id][ti].u ++;
                        this.player_talent_list[player_id][hero_id][ti].i[tier_str].c ++;
                        if(tier == 0){ //基础层
                            if(this.player_talent_list[player_id][hero_id][ti].i[tier_str].k[key].uc >= this.basic_input){
                                let letcount = Object.keys(this.player_talent_node_config[hero_id]).length;
                                for (let key_tier_number = 0; key_tier_number < letcount; key_tier_number++) {
                                    let key_tier_str = tostring(key_tier_number);
                                    if(key_tier_number != 0){
                                        let us_key = this.player_talent_node_config[hero_id][key_tier_number][1];
                                        if(!this.player_talent_list[player_id][hero_id][ti].i.hasOwnProperty(key_tier_str)){
                                            this.player_talent_list[player_id][hero_id][ti].i[key_tier_str] = {
                                                c : 0 ,
                                                k : {},
                                            }
                                        }
                                        if(!this.player_talent_list[player_id][hero_id][ti].i[key_tier_str].k.hasOwnProperty(us_key)){
                                            this.player_talent_list[player_id][hero_id][ti].i[key_tier_str].k[us_key] = {
                                                uc : 0  
                                            }
                                        }
                                    }
                                }
                            }
                        }else if(tier > 0 && parent_node > 0 && parent_node < 8){ //中间层 下层解锁
                            if(this.player_talent_list[player_id][hero_id][ti].i[tier_str].k[key].uc == this.or_input){
                                let us_key = this.player_talent_node_config[hero_id][tier][parent_node + 1];
                                if(!this.player_talent_list[player_id][hero_id][ti].i[tier_str].k.hasOwnProperty(us_key)){
                                    this.player_talent_list[player_id][hero_id][ti].i[tier_str].k[us_key] = {
                                        uc : 0
                                    }
                                }
                            }
                        }
                        //最后层
                        if(this.player_talent_list[player_id][hero_id][ti].i[tier_str].c == this.count_input){
                            let us_key = this.player_talent_node_config[hero_id][tier][9];
                            if(!this.player_talent_list[player_id][hero_id][ti].i[tier_str].k.hasOwnProperty(us_key)){
                                this.player_talent_list[player_id][hero_id][ti].i[tier_str].k[us_key] = {
                                    uc : 0
                                }
                            }
                        }
                        //反馈给前端
                    }else{
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前天赋已升至满级！");    
                    }
                }else{
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前天赋未解锁...");
                }
            }else {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "当前层未解锁...");
            }
        }else{
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "天赋点不足...");
        }
        this.GetPlayerServerTalent(player_id, {});
    }
    //保存天赋
    SaveTalentConfig(player_id: PlayerID, params: CGED["ServiceTalent"]["SaveTalentConfig"], callback?) {
        // this.player_server_talent_list[player_id][hero_id][ti] = CustomDeepCopy(this.player_talent_list[player_id][hero_id][ti]) as CGEDGetTalentListInfo;
        // DeepPrintTable(this.player_talent_list[player_id]);
        let bcdata = JSON.encode(this.player_talent_list[player_id]);
        GameRules.ArchiveService.PlayerTalentSave(player_id , bcdata)
    }
    //还原天赋
    RestoreTalentConfig(player_id: PlayerID, params: CGED["ServiceTalent"]["RestoreTalentConfig"], callback?) {
        let hero_id = tostring(params.hero_id);
        let ti = params.index;
        if (!this.player_talent_list[player_id][hero_id]) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "还原天赋:未找到英雄...");
        } else {
            this.player_talent_list[player_id][hero_id][ti] = CustomDeepCopy(this.player_server_talent_list[player_id][hero_id][ti]) as CGEDGetTalentListInfo;
        }
        this.EmptyTalentOfPlayer(player_id , ti , tonumber(hero_id));
        this.GetPlayerServerTalent(player_id, {});
    }
    //重置天赋
    ResetTalentConfig(player_id: PlayerID, params: CGED["ServiceTalent"]["ResetTalentConfig"], callback?) {
        let hero_id = tostring(params.hero_id); 
        let ti = params.index;
        if (!this.player_talent_list[player_id][hero_id]) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "还原天赋:未找到英雄...");
        } else {
            //初始化可以点的天赋
            this.player_talent_list[player_id][hero_id][ti] = {
                u : 0,
                y : GameRules.ServiceInterface.player_map_level[player_id],
                i : {}
            };
            for( const Tkey in ServerTalentData){
                let TalentData  = ServerTalentData[Tkey as keyof typeof ServerTalentData];
                if(tostring(TalentData.hero_id) == hero_id){
                    if(TalentData.tier_number == 0 && TalentData.parent_node == 0){
                        this.player_talent_list[player_id][hero_id][ti].i[tostring(TalentData.tier_number)] = {
                            c : 0,
                            k : {
                                [Tkey] : {
                                    uc : 0 ,
                                }
                            }
                        }
                    }
                }
            }
        }

        this.EmptyTalentOfPlayer(player_id , ti , tonumber(hero_id));
        this.GetPlayerServerTalent(player_id, {});
    }

    //获取玩家装备配置
    EmptyTalentOfPlayer(player_id: PlayerID , index : number , hero_id : number) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceTalent_EmptyTalentOfPlayer",
            {
                data: {
                    index: index,
                    hero_id: hero_id,
                }
            }
        );
    }
    /**
     * 获取英雄天赋到英雄
     */
    select_talent_index : number = 0;
    /**
     * 获取选择的天赋
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetSelectTalentIndex(player_id: PlayerID, params: CGED["ServiceTalent"]["GetSelectTalentIndex"], callback?) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "ServiceTalent_GetSelectTalentIndex",
            {
                data: {
                    index: this.select_talent_index,
                }
            }
        );
        
    }

    /**
     * 
     * @param player_id 
     * @param params 
     * @param callback 
     */
    SetSelectTalentIndex(player_id: PlayerID, params: CGED["ServiceTalent"]["SetSelectTalentIndex"], callback?) {
        let index = params.index;
        if(index >= this.index_count){
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "启用天赋:超过限制...");
        }
        this.select_talent_index = index;
    }
    
    //存档天赋系统
    Debug(cmd: string, args: string[], player_id: PlayerID) {
        if(cmd == "-LoadPlayerServerTalent"){
            this.LoadPlayerServerTalent(player_id , {})
        }
        if(cmd == "-ClickTalent"){
            let key =  args[0];
            this.ClickTalent(player_id , { key : key  , index : 0})
        }

        if(cmd == "-SaveTalentConfig"){
            let hero_id =  tonumber(args[0]);
            this.SaveTalentConfig(player_id , { hero_id : hero_id , index : 0})
        }
        if(cmd == "-RestoreTalentConfig"){
            let hero_id =  tonumber(args[0]);
            this.RestoreTalentConfig(player_id , { hero_id : hero_id , index : 0})
        }
        if(cmd == "-ResetTalentConfig"){
            let hero_id =  tonumber(args[0]);
            this.ResetTalentConfig(player_id , { hero_id : hero_id , index : 0})
        }
        if(cmd == "-talInit"){
            this.Init();
        }
    }
}