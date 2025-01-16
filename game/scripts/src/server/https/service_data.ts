/**
 * 存档数据
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import * as PictuerCardData from "../../json/config/server/picture/pictuer_card_data.json";
import * as PictuerFetterConfig from "../../json/config/server/picture/pictuer_fetter_config.json";
import * as ServerTalentData from "../../json/config/server/hero/server_talent_data.json";
import * as ServerSoulAttr from "../../json/config/server/soul/server_soul_attr.json";
import { reloadable } from '../../utils/tstl-utils';

import  * as ServerItemList  from "../../json/config/server/item/server_item_list.json";

@reloadable
export class ServiceData extends UIEventRegisterClass {
    
    //整个游戏的game_id 用于API通信 在初始化的时候获取
    _game_id : string = null
    //服务器时间
    _game_t : number = 9703764246
    //特殊背包数据->货币 经验
    server_gold_package_list : {
        [item_id : string] : AM2_Server_Backpack
    }[] = [];     
    //普通背包数据
    server_package_list : AM2_Server_Backpack[][] = [];
    //怪物卡片背包
    server_monster_package_list : AM2_Server_Backpack[][] = [];
    //玩家卡片收集信息  
    server_pictuer_fetter_list : ServerPlayerConfigPictuerFetter[] = [];
    //卡片分类
    server_pictuer_card_rarity : { [ rarity : number] : string[] } = {};
    //特殊合成分类
    server_pictuer_card_special : { [ card_id : string ] : number[] } = {};
    //玩家图鉴配置 // 层级关系  player_id-配置栏-羁绊id 服务器 []
    server_player_config_pictuer_fetter : string[][][] = [];
    //玩家图鉴配置 // 层级关系  player_id-配置栏-羁绊id 本地
    locality_player_config_pictuer_fetter : string[][][] = [];
    //是否为图鉴vip
    player_pictuer_vip : number[] = [];
    //player vip data
    player_vip_data : ServerPlayerVipData[] = [];
    constructor(){
        super("ServiceData" , true);
        for (let index = 0; index < 6; index++) {
            this.server_monster_package_list.push([])
            this.server_pictuer_fetter_list.push({});
            this.server_player_config_pictuer_fetter.push([ 
                [],[],[],[]
            ]);
            this.locality_player_config_pictuer_fetter.push([
                [],[],[],[]
            ]);
            this.player_pictuer_vip.push(0);
            this.server_package_list.push([]);
            this.server_gold_package_list.push({});
            
            this.player_vip_data.push({
                "vip_times" : 0,
                "vip_zs" : 0 ,
            });

            for (let i_n = 1; i_n <= 5; i_n++) { //初始化空数据
                let item_id = 1000 + i_n;
                let item_id_str = tostring(item_id);
                this.server_gold_package_list[index][item_id_str] = {
                    id : "",	//系统内唯一id
                    item_id : item_id,	//物品表唯一id
                    number : 0,	//物品数量
                }
            }
        }
        //初始化结构
        for(let key in PictuerCardData){
            let CardData = PictuerCardData[key as keyof typeof PictuerCardData];
            if(CardData.rarity == 5){
                if(!this.server_pictuer_card_rarity.hasOwnProperty(CardData.rarity)){
                    this.server_pictuer_card_rarity[CardData.rarity] = [];
                }   
                this.server_pictuer_card_rarity[CardData.rarity].push(key)
            }
            if(CardData.compound_type == 1){
                if(!this.server_pictuer_card_rarity.hasOwnProperty(CardData.rarity)){
                    this.server_pictuer_card_rarity[CardData.rarity] = [];
                }
                this.server_pictuer_card_rarity[CardData.rarity].push(key)
            }else if(CardData.compound_type == 2){
                this.server_pictuer_card_special[key] = CardData.special_compound;
            }
        }
        
    }
    /**
     * 快速查找背包里面卡片的物品数量和下标
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    GetMonsterPackageIndexAndCount(player_id : PlayerID , item_id : number) : {count : number , index : number}{
        let ret : {count : number , index : number} = {
            count : 0 ,
            index : -1,
        }
        //检查卡片是否充足
        let monster_package = GameRules.ServiceData.server_monster_package_list[player_id];
        for (let index = 0; index < monster_package.length; index++) {
            const package_item_id = monster_package[index].item_id;
            if(package_item_id == item_id){
                ret.index = index;
                ret.count = monster_package[index].number;
                break;
            }
        }
        return ret;
    }

    /**
     * 对本地怪物卡片背包进行数据写入
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    AddPackageMonsterItem(player_id : PlayerID , id : string , item_id : number , customs : string , count : number ) : boolean{
        let check = this.GetMonsterPackageIndexAndCount(player_id , item_id);
        if(check.index != -1){
            GameRules.ServiceData.server_monster_package_list[player_id][check.index].number += count;
        }else{
            GameRules.ServiceData.server_monster_package_list[player_id].push({
                "id" : id,
                "item_id" : item_id,
                "number" : count , 
                "customs" : ""
            })
        }
        return true
    }

    /**
     * 对本地背包进行数据扣除 (不进行数据同步) 返回false时需要同步服务器数据
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    DeletePackageMonsterItemServer(player_id : PlayerID ,item_id : number  , count : number , id ?: string) : boolean {
        let c_index = -1;
        let item_package = GameRules.ServiceData.server_monster_package_list[player_id];
        for (let index = 0; index < item_package.length; index++) {
            const package_item_id = item_package[index].item_id;
            if(package_item_id == item_id){
                if(count){
                    if(item_package[index].number >= count){
                        c_index = index;
                    }
                }else{
                    c_index = index;
                }
            }
        }
        if(c_index != -1){
            if(GameRules.ServiceData.server_monster_package_list[player_id][c_index].number > count){
                GameRules.ServiceData.server_monster_package_list[player_id][c_index].number -= count;
                return true;
            }else if(GameRules.ServiceData.server_monster_package_list[player_id][c_index].number = count){
                GameRules.ServiceData.server_monster_package_list[player_id].splice(c_index , 1);
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }


    /**
     * 对本地背包进行数据写入 (不进行数据同步)
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    AddPackageItem(player_id : PlayerID , id : string , item_id : number , customs : string , count : number ) : boolean{
        let item_id_string = tostring(item_id);
        let merge = ServerItemList[item_id_string as keyof typeof ServerItemList].merge;
        if(merge != 1){
            let check = this.VerifyPackageItem(player_id , item_id);
            if(check.is_verify == true){
                GameRules.ServiceData.server_package_list[player_id][check.index].number += count;
            }else{
                GameRules.ServiceData.server_package_list[player_id].push({
                    "id" : id,
                    "item_id" : item_id,
                    "number" : count , 
                    "customs" : ""
                })
            }
        }else{
            GameRules.ServiceData.server_package_list[player_id].push({
                "id" : id,
                "item_id" : item_id,
                "number" : 1 , 
                "customs" : customs
            })
        }
        return true
    }
    /**
     * 验证本地背包数量 /或是否拥有
     * @param player_id 
     */
    VerifyPackageItem(player_id : PlayerID  , item_id : number  , count ? : number , id ?: string) : { is_verify : boolean , index : number} {
        //检查卡片是否充足
        let ret : { is_verify : boolean , index : number} = {
            is_verify : false, 
            index : -1,
        }
        let item_package = GameRules.ServiceData.server_package_list[player_id];
        let item_id_string = tostring(item_id);
        let merge = ServerItemList[item_id_string as keyof typeof ServerItemList].merge;
        if(merge != 1){
            for (let index = 0; index < item_package.length; index++) {
                const package_item_id = item_package[index].item_id;
                if(package_item_id == item_id){
                    if(count){
                        if(item_package[index].number >= count){
                            ret.is_verify = true;
                            ret.index = index;
                        }
                    }else{
                        ret.is_verify = true;
                        ret.index = index;
                    }
                    return ret;
                }
            }
        }else{
            for (let index = 0; index < item_package.length; index++) {
                const package_id = item_package[index].id;
                if(package_id == id){
                    ret.is_verify = true;
                    ret.index = index;
                    return ret;
                }
            }
        }
        return ret;
    }
    /**
     * 验证本地背包数量 /或是否拥有
     * @param player_id 
     */
    GoldVerifyPackageItem(player_id : PlayerID  , item_id : number  , count ? : number , id ?: string) : { is_verify : boolean , index : number} {
        //检查是否充足
        let ret : { is_verify : boolean , index : number} = {
            is_verify : false, 
            index : -1,
        }
        let item_package = GameRules.ServiceData.server_gold_package_list[player_id];
        let item_id_string = tostring(item_id);
        if(item_package[item_id_string]){
            if(item_package[item_id_string].number > count){
                ret.is_verify = true;
            }
        }
        return ret;
    }

    /**
     * 选择性检测
     * @param player_id 
     * @param item_id 
     * @param count 
     * @param id 
     * @returns 
     */
    SelectVerifyPackageItem(player_id : PlayerID  , item_id : number  , count ? : number , id ?: string) : { is_verify : boolean , index : number}{
        if(item_id <= 1199){
            return this.GoldVerifyPackageItem(player_id , item_id  , count)
        }else{
            return this.VerifyPackageItem(player_id , item_id  , count , id );
        }
    }

    /**
     * 对本地背包进行数据扣除 (不进行数据同步)
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    DeletePackageItem(player_id : PlayerID , index : number , count : number ) :  boolean {
        if(GameRules.ServiceData.server_package_list[player_id][index].number > count){
            GameRules.ServiceData.server_package_list[player_id][index].number -= count;
            return true;
        }else if(GameRules.ServiceData.server_package_list[player_id][index].number = count){
            GameRules.ServiceData.server_package_list[player_id].splice(index , 1);
            return true;
        }else{
            return false;
        }
    }
    /**
     * 对本地背包进行数据扣除 (不进行数据同步) 返回false时需要同步服务器数据
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    DeletePackageItemOfServer(player_id : PlayerID ,item_id : number  , count : number , id ?: string) : boolean {
        let c_index = -1;
        let item_package = GameRules.ServiceData.server_package_list[player_id];
        let item_id_string = tostring(item_id);
        let merge = ServerItemList[item_id_string as keyof typeof ServerItemList].merge;
        if(merge != 1){
            for (let index = 0; index < item_package.length; index++) {
                const package_item_id = item_package[index].item_id;
                if(package_item_id == item_id){
                    if(count){
                        if(item_package[index].number >= count){
                            c_index = index;
                        }
                    }else{
                        c_index = index;
                    }
                }
            }
        }else{
            for (let index = 0; index < item_package.length; index++) {
                const package_id = item_package[index].id;
                if(package_id == id){
                    c_index = index;
                }
            }
        }
        if(c_index != -1){
            if(GameRules.ServiceData.server_package_list[player_id][c_index].number > count){
                GameRules.ServiceData.server_package_list[player_id][c_index].number -= count;
                return true;
            }else if(GameRules.ServiceData.server_package_list[player_id][c_index].number = count){
                GameRules.ServiceData.server_package_list[player_id].splice(c_index , 1);
                return true;
            }else{
                return false;
            }
        }else{
            return false;
        }
    }



    /**
     * 对金币等数据更新
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    GoldPackageUpData(player_id : PlayerID ,item_id : number , count : number ) : boolean{
        let item_package = GameRules.ServiceData.server_gold_package_list[player_id];
        let item_id_string = tostring(item_id);
        if(item_id == 1004){
            //更新经验相关的数据 必须优先更新
            let new_exp = GameRules.ServiceData.server_gold_package_list[player_id][item_id_string].number + count;
            GameRules.ServiceInterface.MapExpUpdate(player_id , new_exp);
        }
        if(item_package.hasOwnProperty(item_id_string)){
            GameRules.ServiceData.server_gold_package_list[player_id][item_id_string].number += count;

        }
        return true;
    }
    /**
     * 数据背包删除修改分支
     * @param player_id 
     */
    DeletePackageItemSelect(player_id : PlayerID ,item_id : number  , count : number , id ?: string) :  boolean{
        if(item_id <= 1199){
            return GameRules.ServiceData.GoldPackageUpData(player_id , item_id , - count );
        }else if( 2000 <= item_id  && item_id < 3500){
            return GameRules.ServiceData.DeletePackageMonsterItemServer(player_id , item_id , count );
        }else{
            return GameRules.ServiceData.DeletePackageItemOfServer(player_id , item_id , count , id);
        }
    }

    /**
     * 数据背包新增修改分支
     * @param player_id 
     */
    AddPackageItemSelect(player_id : PlayerID , id : string , item_id : number , customs : string , count : number ) :  boolean{
        if(item_id <= 1199){
            return GameRules.ServiceData.GoldPackageUpData(player_id , item_id , count );
        }else if(2000 <= item_id && item_id < 3500){
            return GameRules.ServiceData.AddPackageMonsterItem(player_id , id  , item_id , customs , count );
        }else{
            return GameRules.ServiceData.AddPackageItem(player_id , id  , item_id , customs , count )
        }
    }

    //统一加载玩家存档属性
    LoadPlayerServerAttr(player_id : PlayerID){
        let selfhHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let attr_count :  CustomAttributeTableType  = {
            
        };
        let hero_id = selfhHero.GetHeroID();
        let hero_id_str = tostring(hero_id);
        //加载天赋属性
        let select_talent_index = GameRules.ServiceTalent.select_talent_index;
        let talent_data = GameRules.ServiceTalent.player_server_talent_list[player_id][hero_id_str][select_talent_index].i;
        for (let index = 0; index < 6; index++) {
            let index_str = tostring(index)
            if(talent_data.hasOwnProperty(index_str)){
                for (const key in talent_data[index_str].k) {
                    if(talent_data[index_str].k[key].uc > 0){
                        let attr = ServerTalentData[key as keyof typeof ServerTalentData].ObjectValues as CustomAttributeTableType;
                        for (const key1 in attr) {
                            for (const key2 in attr[key1]) {
                                if(!attr_count.hasOwnProperty(key1)){
                                    attr_count[key1] = {};
                                }
                                if(attr_count[key1].hasOwnProperty(key2)){
                                    attr_count[key1][key2] += attr[key1][key2] * talent_data[index_str].k[key].uc;
                                }else{
                                    attr_count[key1][key2] = attr[key1][key2] * talent_data[index_str].k[key].uc;
                                }
                            }
                        }
                    }
                }
            }
        }
        //加载图鉴属性
        let pictuer_count =  GameRules.ServiceData.server_player_config_pictuer_fetter[player_id][0];
        for (const count_id of pictuer_count) {
            let length = GameRules.ServiceData.server_pictuer_fetter_list[player_id][count_id].length;
            //属性值
            let ListValues = PictuerFetterConfig[count_id as keyof typeof PictuerFetterConfig].ListValues as { [key: string]: CustomAttributeTableType };
            //消耗
            let consume = PictuerFetterConfig[count_id as keyof typeof PictuerFetterConfig].consume;
            if(length == consume){
                let ability_id_list = PictuerFetterConfig[count_id as keyof typeof PictuerFetterConfig].ability_id;
                for (const element of ability_id_list) {
                    if(element != "null"){
                        let le = element.split("_");
                        let ab_key = tonumber(le[0]);
                        let ab_level = tonumber(le[1]);
                        if(selfhHero.pictuer_ability_name.hasOwnProperty(ab_key)){
                            if(selfhHero.pictuer_ability_name[ab_key] < ab_level){
                                selfhHero.pictuer_ability_name[ab_key] = ab_level;
                            }
                        }else{
                            selfhHero.pictuer_ability_name[ab_key] = ab_level;
                        }
                    }
                }
            }
            for (let index = 1; index <= length; index++) {
                let attr = ListValues[index.toString()];
                for (const key1 in attr) {
                    for (const key2 in attr[key1]) {
                        if(!attr_count.hasOwnProperty(key1)){
                            attr_count[key1] = {};
                        }
                        if(attr_count[key1].hasOwnProperty(key2)){
                            attr_count[key1][key2] += attr[key1][key2];
                        }else{
                            attr_count[key1][key2] = attr[key1][key2];
                        }
                    }
                }
            }
        }
        //加载装备属性

        //加载魂石属性
        let SoulList = GameRules.ServiceSoul.soul_list[player_id].i;
        for (const s_key in SoulList) { 
            for (const d_data of SoulList[s_key].d) {
                let soul_key = d_data.k;
                let soul_value = d_data.v;
                let MainProperty = ServerSoulAttr[soul_key as keyof typeof ServerSoulAttr].MainProperty;
                let TypeProperty = ServerSoulAttr[soul_key as keyof typeof ServerSoulAttr].TypeProperty;
                if(!attr_count.hasOwnProperty(MainProperty)){
                    attr_count[MainProperty] = {};
                }
                if(attr_count[MainProperty].hasOwnProperty(TypeProperty)){
                    attr_count[MainProperty][TypeProperty] += soul_value;
                }else{
                    attr_count[MainProperty][TypeProperty] = soul_value;
                }
            }
        }
        


        //商城道具属性
        GameRules.CustomAttribute.SetAttributeInKey(selfhHero , "attr_server_" + player_id , attr_count)
    }
    /**
     * 初始化
     */
    Init(){
        this.server_monster_package_list = [];
        //随机添加100张卡片
        for (let index = 0; index < 6; index++) {
            this.server_monster_package_list.push([])
        }
        for (let index = 0; index < 10; index++) {
            //判断是否有
            let is_ok = false;
            for (let i = 1; i <= 88; i++) {
                let item_id = 1000 + i;
                for (let n = 0; n < this.server_monster_package_list[0].length; n++) {
                    if(this.server_monster_package_list[0][n].item_id == item_id){
                        this.server_monster_package_list[0][n].number ++;
                        is_ok = true;
                        break
                    }
                }
                if(is_ok == false){
                    this.server_monster_package_list[0].push({
                        id : tostring(item_id),
                        "number" : 1,
                        "customs" : "",
                        item_id : item_id,
                    })
                }
            }
        }
    }
    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if(cmd == "!SDI"){
            this.Init();
        }
        if(cmd == "-openvip"){
            this.player_pictuer_vip[player_id] = 1;
        }
        if(cmd == "!!dg"){
            let CardDataList = Object.keys(PictuerCardData);
            let count = tonumber(args[0] ?? "50")
            for (let index = 1; index <= count; index++) {
                let i = RandomInt( 0 , CardDataList.length - 1);
                let tos = 0;
                if(args[1]){
                    tos = tonumber(args[1]);
                }else{
                    tos = tonumber(CardDataList[i]);
                }
                let is_ok = false;
                let item_id = tos;
                //;
                for (let index = 0; index < this.server_monster_package_list[0].length; index++) {
                    if(this.server_monster_package_list[0][index].item_id == item_id){
                        this.server_monster_package_list[0][index].number ++;
                        is_ok = true;
                        break
                    }
                }
                if(is_ok == false){
                    this.server_monster_package_list[0].push({
                        id : tostring(item_id),
                        "number" : 1,
                        "customs" : "",
                        item_id : item_id,
                    })
                }
            }
            GameRules.ServiceInterface.GetPlayerCardList(player_id , {});
        }
        // if(cmd == "!PDA"){
        //     let selfhHero = PlayerResource.GetSelectedHeroEntity(player_id);
        //     let count_id = args[0] ?? "1"; 
        //     let ability_id_list = PictuerFetterConfig[count_id as keyof typeof PictuerFetterConfig].ability_id;
        //     for (const element of ability_id_list) {
        //         if(element != "null"){
        //             let le = element.split("_");
        //             let ab_key = tonumber(le[0]);
        //             let ab_level = tonumber(le[1]);
        //             if(selfhHero.pictuer_ability_name.hasOwnProperty(ab_key)){
        //                 if(selfhHero.pictuer_ability_name[ab_key] < ab_level){
        //                     selfhHero.pictuer_ability_name[ab_key] = ab_level;
        //                 }
        //             }else{
        //                 selfhHero.pictuer_ability_name[ab_key] = ab_level;
        //             }
        //         }
        //     }
        // }
        // if(cmd == "!PFDA"){
        //     let selfhHero = PlayerResource.GetSelectedHeroEntity(player_id);
        //     let aid = args[0] ?? "1"; 
        //     let level = args[0] ?? "1"; 
        //     let ab_key = tonumber(aid);
        //     let ab_level = tonumber(level);
        //     if(selfhHero.pictuer_ability_name.hasOwnProperty(ab_key)){
        //         if(selfhHero.pictuer_ability_name[ab_key] < ab_level){
        //             selfhHero.pictuer_ability_name[ab_key] = ab_level;
        //         }
        //     }else{
        //         selfhHero.pictuer_ability_name[ab_key] = ab_level;
        //     }
        // }
    }
}