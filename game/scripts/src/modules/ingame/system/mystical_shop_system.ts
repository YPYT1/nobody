import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from '../../class_extends/ui_event_register_class';
import * as MysteriousShopConfig from "../../../json/config/game/shop/mysterious_shop_config.json";
// import * as ItemsCustom from "../../../json/npc_items_custom.json";
// import * as ItemBlueprint from "../../../json/items/item_blueprint.json";
// import * as ItemEquipOriginConfig from "../../../json/Items/item_equip_origin.json";

// ItemCost
@reloadable
export class MysticalShopSystem extends UIEventRegisterClass {

    /**
     * 神秘商店物品列表
     */
    item_level_group: string[] = [];
    /**
     * 神秘商店物品概率
     */
     
    item_level_probability_group: number[] = [];
    /**
     * player_count : number,
     */
    /**
     * 玩家限购
     */
    item_player_count: {
        [item_key: string]: {
            player_count: number,
            player_max: number,
        },
    }[] = [];
    /**
     * 全局限购记录
     */
    item_global_count: {
        [item_key: string]: {
            buy_count: number,
            buy_max: number,
        },
    } = {};
    /**
     * 最大等级
     */
    level_max: number = 10;
    /**
     * 玩家商店等级
     */
    player_shop_level: number[] = [];
    /**
     * 玩家商店栏
     */
    shop_field_list: ShopFieldList[][] = [];
    /**
     * 玩家可用物品栏位
     */
    player_shop_field_count: number[] = [];
    //玩家数
    player_count: number = 6;
    //物品栏锁定栏位
    player_shop_field_count_lock: number[] = [];
    //锁定栏位
    shop_field_lock: number = 2;
    // 折扣type 初始值
    // box_type_discount_start: number = 18;
    //默认最大栏位
    shop_field_max : number = 4; 
    //VIP栏位
    shop_field_max_vip : number = 0; 
    //刷新信息
    player_refresh_data: PlayerRefreshData[] = [];
    //商店装备信息
    shop_state_data : ShopStateData[] = [];
    //售卖状态
    start_buy_state : number = 0;

    STORE_REFRESHES_SOUL_FORMULA: string = "100+200*count";
    //购买结束时间
    countdown_timer : number = 0 ;
    //玩家购买时间
    MYSTICAL_SHOP_BUY_ITEM : number = 60;

    /**
     * 玩家神秘商店栏位数量
     */
    constructor() {
        super("MysticalShopSystem");
        this.player_count = GameRules.PUBLIC_CONST.PLAYER_COUNT;
        for (const key in MysteriousShopConfig) {
            const Info = MysteriousShopConfig[key as keyof typeof MysteriousShopConfig];
            this.item_level_group.push(key);
            this.item_level_probability_group.push(
                Info.probability
            );
        }
        for (let index = 0; index < this.player_count; index++) {
            this.player_shop_level.push(0);
            this.shop_field_list.push([]);
            this.player_shop_field_count.push(this.shop_field_max + this.shop_field_max_vip);
            this.player_shop_field_count_lock.push(this.shop_field_lock);
            this.item_player_count.push({});
            this.shop_state_data.push({
                is_ready : 0,
            });
        }
        //灵魂
        this.STORE_REFRESHES_SOUL_FORMULA = GameRules.PUBLIC_CONST.STORE_REFRESHES_SOUL_FORMULA;
        //购买时间
        this.MYSTICAL_SHOP_BUY_ITEM = GameRules.PUBLIC_CONST.MYSTICAL_SHOP_BUY_ITEM;

        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            let eval_param = {
                count: 0,
            };
            let refresh_gold = math.ceil(eval(this.STORE_REFRESHES_SOUL_FORMULA, eval_param));
            this.player_refresh_data.push({
                refresh_count: 0,
                soul: refresh_gold,
            });
        }
    }
    /**
     * 初始化神秘商店
     */
    InitPlayerUpgradeStatus(player_id : PlayerID) {
        print("MysticalShopSystem InitPlayerUpgradeStatus")
        this.shop_field_list[player_id] = [];
        this.player_shop_field_count[player_id] = this.shop_field_max + this.shop_field_max_vip;
        this.player_shop_field_count_lock[player_id] = this.shop_field_lock;
        this.item_player_count[player_id] = {};

        let eval_param = {
            count: 0,
        };
        let refresh_gold = math.ceil(eval(this.STORE_REFRESHES_SOUL_FORMULA, eval_param));
        this.player_refresh_data[player_id] = {
            refresh_count: 0,
            soul: refresh_gold,
        };
        for (let index = 0; index < this.player_shop_field_count[player_id]; index++) {
            this.shop_field_list[player_id].push({
                key: "null",
                soul: 0,
                is_discount: 0,
                discount_rate: 100,
                rarity: 1,
                is_buy: 0,
                is_lock : 0,
            });
        }
    }
    //刷新神秘商店 并开始售卖
    RefreshMysticalShopItem() {
        this.player_count = GetPlayerCount();
        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            this.player_refresh_data[index].refresh_count = 0;
            let eval_param = {
                count: this.player_refresh_data[index].refresh_count,
            };
            let refresh_soul = math.ceil(eval(this.STORE_REFRESHES_SOUL_FORMULA, eval_param));
            this.player_refresh_data[index].soul = refresh_soul;
            this.shop_state_data[index].is_ready = 0;
        }
        //开始售卖
        this.start_buy_state = 1;
        //完成时间
        this.countdown_timer = GameRules.GetDOTATime(false, false) + this.MYSTICAL_SHOP_BUY_ITEM;
        
        GameRules.MysticalShopSystem.GetShopState(-1 , {});
        //给每个玩家刷新一次商店
        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            GameRules.MysticalShopSystem.PlayerShopItem(index);
            
        }

        GameRules.GetGameModeEntity().SetContextThink("MYSTICAL_SHOP_BUY_ITEM", () => {
            GameRules.MysticalShopSystem.StopShopSystem();
            return null;
        }, 30);
    }
    /**
     * 使用灵魂刷新商店
     * @param player_id 
     * @param params 
     * @param callback 
     */
    RefreshShopByGold(player_id: PlayerID, params: CGED["MysticalShopSystem"]["RefreshShopByGold"], callback?: string) {
        let need_soul = this.player_refresh_data[player_id].soul;
        let player_gold_start = GameRules.ResourceSystem.ModifyResource(player_id, { Soul : - need_soul});
        if (player_gold_start) {
            this.player_refresh_data[player_id].refresh_count++;
            let eval_param = {
                count: this.player_refresh_data[player_id].refresh_count,
            };
            let refresh_soul = math.ceil(eval(this.STORE_REFRESHES_SOUL_FORMULA, eval_param));
            this.player_refresh_data[player_id].soul = refresh_soul;
            this.PlayerShopItem(player_id);
        } else {
            // GameRules.CMsg.SendErrorMsgToPlayer(player_id, "神秘商店 : 灵魂不足");
            print("神秘商店 : 灵魂不足")
        }
    }
    /**
     * 停止商店
     */
    StopShopSystem(){
        GameRules.GetGameModeEntity().StopThink("MYSTICAL_SHOP_BUY_ITEM");

        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            this.shop_field_list[index] = [];
            //重新更新商店
            for (let i = 0; i < this.player_shop_field_count[index]; i++) {
                this.shop_field_list[index].push({
                    key: "null",
                    soul: 0,
                    is_discount: 0,
                    discount_rate: 100,
                    rarity: 1,
                    is_buy: 0,
                    is_lock : 0,
                });
            }
            GameRules.MysticalShopSystem.player_refresh_data[index].refresh_count = 0;
            let eval_param = {
                count: this.player_refresh_data[index].refresh_count,
            };
            let refresh_soul = math.ceil(eval(this.STORE_REFRESHES_SOUL_FORMULA, eval_param));
            GameRules.MysticalShopSystem.player_refresh_data[index].soul = refresh_soul;
            GameRules.MysticalShopSystem.shop_state_data[index].is_ready = 0;
        }
        //停止售卖
        GameRules.MysticalShopSystem.start_buy_state = 0;

        GameRules.MysticalShopSystem.GetShopState(-1 , {})
        //继续游戏
        GameRules.Spawn.StartSpawn()
    }   
    /**
     * 刷新
     * @param player_id 
     */
    private PlayerShopItem(player_id: PlayerID) {
        //回归池子
        for (const item_data of this.shop_field_list[player_id]) {
            //锁定和卖了不会回归池子
            if(item_data.is_lock == 1){
                continue;
            }
            if(item_data.is_buy == 1){
                continue;
            }
            //回归全局池子
            if(this.item_global_count.hasOwnProperty(item_data.key)){
                this.item_global_count[item_data.key].buy_count--;
            }
            //回归玩家池子
            if(this.item_player_count[player_id].hasOwnProperty(item_data.key)){
                this.item_player_count[player_id][item_data.key].player_count--;
            }
        }
        let for_max = this.player_shop_field_count[player_id];

        let shop_wp_list: string[] = [];

        //循环计数器
        let amount_count = 0;
        let amount_max = 50;

        for (let index = 0; index < for_max; index++) {
            amount_count ++;
            if(amount_count > amount_max ){
                break;
            }
            //获取具体物品
            let item_index = GetCommonProbability(this.item_level_probability_group);
            let item_name = this.item_level_group[item_index];

            if(this.shop_field_list[player_id][index].is_lock == 1){
                //保存
                shop_wp_list.push(this.shop_field_list[player_id][index].key);
                continue;
            }

            if (shop_wp_list.includes(item_name)) {
                //跳过本次 
                index--;
                continue;
            }
            if(this.item_player_count[player_id].hasOwnProperty(item_name)){
                if(this.item_player_count[player_id][item_name].player_count >= this.item_player_count[player_id][item_name].player_max){
                    //跳过本次 
                    index--;
                    continue;
                }
            }
            if (item_name && item_name != "") {
                //是否全局唯一
                // let item_info = MysteriousShopConfig[item_name as keyof typeof MysteriousShopConfig];
                let ItemsCustomInfo = MysteriousShopConfig[item_name as "prop_1"];
                
                if(ItemsCustomInfo.buy_count_max > 0){
                    ItemsCustomInfo.buy_count_max 
                }
                let goods_info: ShopFieldList = {
                    key: item_name,
                    soul: ItemsCustomInfo.soul,
                    is_discount: 0,
                    discount_rate: 100,
                    rarity: 1,
                    is_buy: 0,
                    is_lock : 0,
                };
                this.shop_field_list[player_id][index] = goods_info;
            }
            //保存
            shop_wp_list.push(item_name);

        }
        this.GetShopData(player_id, {});
    }
    /**
     * 获取玩家商店数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetShopData(player_id: PlayerID, params: CGED["MysticalShopSystem"]["GetShopData"], callback?: string) {
        print("=========== GetShopData ===========")
        DeepPrintTable({
            shop_field_list: this.shop_field_list[player_id],
            player_refresh_data: this.player_refresh_data[player_id],
        })
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MysticalShopSystem_GetShopData",
            {
                data: {
                    shop_field_list: this.shop_field_list[player_id],
                    player_refresh_data: this.player_refresh_data[player_id],
                }
            }
        );
    }
    /**
     * 发送玩家信息商店是否可以购买
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetShopState(player_id: PlayerID, params: CGED["MysticalShopSystem"]["GetShopState"], callback?: string) {
        print("=========== GetShopState ===========")
        DeepPrintTable({
            shop_state_data : this.shop_state_data,
            start_buy_state : this.start_buy_state,
            countdown_timer : this.countdown_timer,
        })
        if(player_id == -1){
            CustomGameEventManager.Send_ServerToAllClients(
                "MysticalShopSystem_GetShopState",
                {
                    data: {
                        shop_state_data : this.shop_state_data,
                        start_buy_state : this.start_buy_state,
                        countdown_timer : this.countdown_timer,
                    }
                }
            );
        }else{
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MysticalShopSystem_GetShopState",
                {
                    data: {
                        shop_state_data: this.shop_state_data,
                        start_buy_state: this.start_buy_state,
                        countdown_timer : this.countdown_timer,
                    }
                }
            );
        }
    }
    /**
     * 购买
     * @param player_id 
     * @param params 
     * @param callback 
     */
    BuyItem(player_id: PlayerID, params: CGED["MysticalShopSystem"]["BuyItem"], callback?: string) {
        let item_index = params.index;
        if (this.shop_field_list[player_id][item_index]) {
            let item_info = this.shop_field_list[player_id][item_index];
            if (item_info.is_buy == 0) {
                if (3 < 2) {
                    // GameRules.CMsg.SendErrorMsgToPlayer(player_id, "mystical shop : 没有木材");
                } else if (3 < 2) {
                    // GameRules.CMsg.SendErrorMsgToPlayer(player_id, "mystical shop : 没有金币");
                } else {
                    // 扣除灵魂
                    GameRules.ResourceSystem.ModifyResource(player_id, { Soul : 10});
                    let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
                    let hNewItem = CreateItem(item_info.key, null, null);
                    // hHero.AddItem(hNewItem);
                    //标记为出售
                    this.shop_field_list[player_id][item_index].is_buy = 1;

                    this.shop_field_list[player_id][item_index].is_lock = 0;
                }
            } else {
                // GameRules.CMsg.SendErrorMsgToPlayer(player_id, "此物已经被购买");
            }

        } else {
            // GameRules.CMsg.SendErrorMsgToPlayer(player_id, "物品不存在");
        }
        this.GetShopData(player_id, {});
    }
    /**
     * 商店单锁定获解锁
     * @param player_id 
     * @param params 
     * @param callback 
     */
    ShopLock(player_id: PlayerID, params: CGED["MysticalShopSystem"]["ShopLock"], callback?: string) {
        let item_index = params.index
        if(this.shop_field_list[player_id][item_index].is_lock == 0){
            this.shop_field_list[player_id][item_index].is_lock = 1;
        }else{
            this.shop_field_list[player_id][item_index].is_lock = 0;
        }
        this.GetShopData(player_id, {});
    }
    /**
     * 玩家准备
     * @param cmd 
     * @param args 
     * @param player_id 
     */
    PlayerReady(player_id: PlayerID, params: CGED["MysticalShopSystem"]["PlayerReady"], callback?: string) {
        if(this.shop_state_data[player_id].is_ready == 0){
            this.shop_state_data[player_id].is_ready = 1;
        }

        let player_count = GetPlayerCount();
        let all_ready = true;
        for (let index = 0 as PlayerID; index < player_count; index++) {
            let is_ready = this.shop_state_data[index].is_ready;
            if(is_ready == 0){
                all_ready = false;
                break
            }
        }
        if(all_ready){
            GameRules.MysticalShopSystem.StopShopSystem()
        }else{
            GameRules.MysticalShopSystem.GetShopState(-1 , {})
        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        //开始售卖
        if(cmd == "-RefreshMysticalShopItem"){
            this.RefreshMysticalShopItem();
        }
        //没有条件的刷新商店
        if(cmd == "-PlayerShopItem"){
            this.PlayerShopItem(player_id);
        }
        if(cmd == "-BuyItem"){
            this.BuyItem(player_id,{index : 0})
        }

        if(cmd == "-ShopLock"){
            this.ShopLock(player_id,{index : 0})
        }

        if(cmd == "-InitPlayerUpgradeStatus" ){
            this.InitPlayerUpgradeStatus(player_id)
        }

        if(cmd == "-RefreshShopByGold"){
            this.RefreshShopByGold(player_id , {})
        }
        if(cmd == "-StopShopSystem"){
            this.StopShopSystem()
        }
        // if(cmd == "--CreatArmssSelectData"){
        //     let index = args[0] ? parseInt(args[0]) : 0;
        //     this.CreatArmssSelectData(player_id , { index : index})
        // }
        // if(cmd == "--PostSelectArms"){
        //     let index = args[0] ? parseInt(args[0]) : 0;
        //     this.PostSelectArms(player_id , { index : index})
        // }
    }
}