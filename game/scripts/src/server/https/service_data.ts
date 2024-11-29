/**
 * 存档数据
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import * as PictuerCardData from "../../json/config/server/picture/pictuer_card_data.json";
import * as PictuerFetterConfig from "../../json/config/server/picture/pictuer_fetter_config.json";
import * as ServerTalentData from "../../json/config/server/hero/server_talent_data.json";
import { reloadable } from '../../utils/tstl-utils';

import  * as ServerItemList  from "../../json/config/server/item/server_item_list.json";

@reloadable
export class ServiceData extends UIEventRegisterClass {
    
    //整个游戏的game_id 用于API通信 在初始化的时候获取
    _game_id : string = null
    //服务器时间
    _game_t : number = 9703764246

    //普通背包数据
    server_package_list : AM2_Server_Backpack[][] = [];     

    //怪物卡片背包
    server_monster_package_list : AM2_Server_Backpack[][] = [];

    //玩家卡片收集信息  
    server_pictuer_fetter_list : Server_PICTUER_FETTER_CONFIG[] = [];
    //卡片分类
    server_pictuer_card_rarity : { [ rarity : number] : string[] } = {};
    //特殊合成分类
    server_pictuer_card_special : { [ card_id : string ] : number[] } = {};
    //玩家图鉴配置 // 层级关系  player_id-配置栏-羁绊id 服务器
    server_player_config_pictuer_fetter : string[][][] = [];
    //玩家图鉴配置 // 层级关系  player_id-配置栏-羁绊id 本地
    locality_player_config_pictuer_fetter : string[][][] = [];
    //是否为图鉴vip
    player_pictuer_vip : number[] = [];
    constructor(){
        super("ServiceData" , true);
        //随机添加100张卡片
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
        }
        //假数据
        this.server_package_list[0].push({
            id : "123451" , //系统内唯一id
            item_id: 1201,	//物品表唯一id
            number: 30,	//物品数量
            customs: "", //自定义字段
        });
        this.server_package_list[0].push({
            id : "123442",	//系统内唯一id
            item_id: 1202,	//物品表唯一id
            number: 40,	//物品数量
            customs: "", //自定义字段
        });
        this.server_package_list[0].push({
            id : "123443",	//系统内唯一id
            item_id: 1203,	//物品表唯一id
            number: 645,	//物品数量
            customs: "", //自定义字段
        });
        this.server_package_list[0].push({
            id : "123444",	//系统内唯一id
            item_id: 1282,	//物品表唯一id
            number: 231,	//物品数量
            customs: "", //自定义字段
        });
        this.server_package_list[0].push({
            id : "123445",	//系统内唯一id
            item_id: 3203,	//物品表唯一id
            number: 324,	//物品数量
            customs: "", //自定义字段
        });
        this.server_package_list[0].push({
            id : "12344526",	//系统内唯一id
            item_id: 1292,	//物品表唯一id
            number: 324,	//物品数量
            customs: "", //自定义字段
        });
        this.server_package_list[0].push({
            id : "123445154",	//系统内唯一id
            item_id: 1293,	//物品表唯一id
            number: 15226,	//物品数量
            customs: "", //自定义字段
        });
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
     * 对本地背包进行数据写入 (不进行数据同步)
     * @param player_id 
     * @param item_id 
     * @returns 
     */
    AddPackageItem(player_id : PlayerID , id : string , item_id : number , customs : string , count : number ){
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


    //统一加载玩家存档属性
    LoadPlayerServerAttr(player_id : PlayerID){
        let selfhHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let attr_count :  CustomAttributeTableType  = {
            
        };
        //加载天赋属性
        let select_talent_index = GameRules.ServiceTalent.select_talent_index;
        let hero_id = 6;
        let talent_data = GameRules.ServiceTalent.player_server_talent_list[player_id][hero_id][select_talent_index].i;
        for (let index = 0; index < 6; index++) {
            if(talent_data.hasOwnProperty(index)){
                for (const key in talent_data[index].k) {
                    if(talent_data[index].k[key].uc > 0 ){
                        let attr = ServerTalentData[key as keyof typeof ServerTalentData].ObjectValues as CustomAttributeTableType;
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
            }
        }
        //加载图鉴属性
        let pictuer_count =  GameRules.ServiceData.server_player_config_pictuer_fetter[player_id][0];
        for (const count_id of pictuer_count) {
            let length = GameRules.ServiceData.server_pictuer_fetter_list[player_id][count_id].length;  
            let ListValues = PictuerFetterConfig[count_id as keyof typeof PictuerFetterConfig].ListValues as { [key: string]: CustomAttributeTableType };
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
            
            for (let index = 1; index <= 50; index++) {
                let tos = tonumber(args[0]);
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
    }
}