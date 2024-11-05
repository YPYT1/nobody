/**
 * 存档数据
 */
import { UIEventRegisterClass } from '../../modules/class_extends/ui_event_register_class';
import * as PictuerCardData from "../../json/config/server/picture/pictuer_card_data.json";
import { reloadable } from '../../utils/tstl-utils';

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

    constructor(){
        super("ServiceData" , true);
        //随机添加100张卡片
        for (let index = 0; index < 6; index++) {
            this.server_monster_package_list.push([])
            this.server_pictuer_fetter_list.push({});
            this.server_player_config_pictuer_fetter.push([
                [],[],[],[]
            ]);
        }
        let CardDataList = Object.keys(PictuerCardData);
            
        for (let index = 1; index <= 600; index++) {
            let is_ok = false;
            let item_id = tonumber(CardDataList[RandomInt(0 , CardDataList.length - 1)]);
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
                    "class" : 23 , 
                    "lv" : 1,
                    "number" : 1,
                    "customs" : "",
                    item_id : item_id,
                })
            }
        }
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
                        "class" : 23 , 
                        "lv" : 1,
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
    }
}