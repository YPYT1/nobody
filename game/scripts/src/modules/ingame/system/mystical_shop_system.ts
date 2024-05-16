import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from '../../class_extends/ui_event_register_class';
import * as MysteriousShopConfig from "../../../json/config/shop/mysterious_shop_config.json";
import * as ItemsCustom from "../../../json/npc_items_custom.json";
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
    level_max: number = 5;
    /**
     * 玩家商店等级
     */
    player_shop_level: number[] = [];
    /**
     * 玩家商店栏
     */
    shop_field_list: {
        key: string, //物品key
        gold: number, // 需要金币
        wood: number, //需要木材
        is_discount: number, //折扣 1为折扣 0为没打折
        discount_rate: number, // 80%  20% 10 % 1% ----不低于1%
        rarity: number, // 稀有度 1 2 3 4 5
        is_buy: number, // 0 未购买 1 已购买
    }[][] = [];
    /**
     * 物品栏位
     */
    player_shop_field_count: number[] = [];
    //玩家数
    player_count: number = 6;
    //物品栏锁定栏位
    player_shop_field_count_lock: number[] = [];
    //锁定栏位
    shop_field_lock: number = 2;
    // box_type 初始值
    box_type_start: number = 8;
    // 折扣type 初始值
    box_type_discount_start: number = 18;
    //默认最大栏位
    shop_field_max_tuzhi: number = 3; //图纸栏位
    //
    shop_field_max_equip: number = 5; //装备栏位
    //装备配置刷新配置
    shop_equip_pro: number[][] = [
        [0, 50, 30, 20, 0], //第一次刷新
        [0, 30, 35, 30, 0], //第二次刷新
        [0, 15, 30, 40, 0], //第三次刷新
        [0, 0, 30, 45, 0], //第四次刷新
        [0, 0, 10, 55, 0], //第五次刷新 五次以后固定
    ];
    //是否刷新npc
    shop_npc = false;
    //刷新信息
    player_refresh_data: {
        refresh_count: number,
        gold: number,
    }[] = [];
    /**
     * 玩家商店是否锁定
     */
    player_shop_is_lock: boolean[] = [];

    STORE_REFRESHES_GOLD_FORMULA: string = "500+500*count";
    //商店锁定

    //神秘商人
    player_shop_npc_unit: CDOTA_BaseNPC = null;

    /**
     * 玩家神秘商店栏位数量
     */
    constructor() {
        super("MysticalShopSystem");
    }
    Init() {
        this.player_count = this.player_count;
        this.player_shop_level = [];
        this.shop_field_list = [];
        this.player_shop_field_count = [];
        this.item_player_count = [];
        this.item_level_group = [];
        this.item_level_probability_group = [];

        //暂时不做玩家独立概率
        for (let index = 0; index < this.player_count; index++) {
            this.player_shop_level.push(0);
            this.shop_field_list.push([]);
            this.player_shop_field_count.push(this.shop_field_max_tuzhi + this.shop_field_max_equip);
            this.player_shop_field_count_lock.push(this.shop_field_lock);
            this.item_player_count.push({});
            this.player_shop_is_lock.push(false);
        }

        // for (let index = 0; index < this.level_max; index++) {
        //     this.item_level_group.push([])
        //     this.item_level_probability_group.push([]);
        // }
        for (const key in MysteriousShopConfig) {
            const Info = MysteriousShopConfig[key as keyof typeof MysteriousShopConfig];
            // if(Info.global_count > 0){
            //     this.item_global_count[key] = {
            //         buy_count : 0,
            //         buy_max : Info.global_count
            //     }

            // }else if(Info.player_count > 0){
            //     for (let i = 0; i < this.player_count; i++) {
            //         this.item_player_count[i][key] = {
            //             player_count : 0,
            //             player_max : Info.player_count
            //         }
            //     }
            // }else{

            // }
            this.item_level_group.push(key);
            this.item_level_probability_group.push(
                Info.probability
            );
        }

        this.STORE_REFRESHES_GOLD_FORMULA = GameRules.PUBLIC_CONST.STORE_REFRESHES_GOLD_FORMULA;

        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            let eval_param = {
                count: 0,
            };
            // let refresh_gold = math.ceil(LFUN.eval(this.STORE_REFRESHES_GOLD_FORMULA, eval_param));
            // this.player_refresh_data.push({
            //     refresh_count: 0,
            //     gold: refresh_gold,
            // });
            // this.GetShopData(index, {});
        }
    }
    // /**
    //  * 增加商店等级
    //  */
    // AddShopLevel(player_id: PlayerID) {
    //     if (player_id == -1) {
    //         for (let index = 0 as PlayerID; index < this.player_count; index++) {
    //             this.player_shop_level[index]++;
    //         }
    //     } else {
    //         this.player_shop_level[player_id]++;
    //     }
    // }
    // /**
    //  * 创造神秘商店并刷新货物
    //  */
    // CreateMysticalShop() {
    //     //增加商店等级
    //     this.AddShopLevel(-1);
    //     //刷新NPC
    //     this.RefreshMysticalShopItem();
    //     if (this.shop_npc != true) {
    //         let _Vector = Vector(0, 0, 128);
    //         this.player_shop_npc_unit = CreateUnitByName(
    //             "npc_interact_mysterious_shop",
    //             _Vector,
    //             true,
    //             null,
    //             null,
    //             DotaTeam.GOODGUYS
    //         );
    //         this.shop_npc = true;
    //         let npc_entity_index = this.player_shop_npc_unit.GetEntityIndex();
    //         // let Ability = unit.AddAbility("npc_driver_invulnerable");modifier_state_npc_interact
    //         UnitOperation.SetNpcHeadTitle(this.player_shop_npc_unit);
    //         let buff = this.player_shop_npc_unit.AddNewModifier(this.player_shop_npc_unit, null, "modifier_state_npc_interact", {});
    //         CustomNetTables.SetTableValue("game_setting", "interact_mysterious_shop", { entity: npc_entity_index });
    //     } else {
    //         this.player_shop_npc_unit.RemoveModifierByName("modifier_state_hidden")
    //         this.player_shop_npc_unit.RemoveNoDraw();
    //     }
    //     GameRules.CMsg.SendCommonMsgToPlayer(-1, "神秘商人在地图中间刷新");
    // }
    // /**
    //  * 隐藏神秘商店
    //  */
    // HiddenMysticalShop() {
    //     if (this.shop_npc == true) {
    //         this.player_shop_npc_unit.AddNoDraw();
    //         this.player_shop_npc_unit.AddNewModifier(this.player_shop_npc_unit, null, "modifier_state_hidden", {});
    //     }
    // }
    // /**
    //  * 回合结束时刷新所有玩家商店 并重置刷新次数
    //  */
    // RefreshMysticalShopItem() {
    //     for (let index = 0 as PlayerID; index < this.player_count; index++) {
    //         this.player_refresh_data[index].refresh_count = 0;
    //         let eval_param = {
    //             count: this.player_refresh_data[index].refresh_count,
    //         };
    //         let refresh_gold = math.ceil(LFUN.eval(this.STORE_REFRESHES_GOLD_FORMULA, eval_param));
    //         this.player_refresh_data[index].gold = refresh_gold;
    //         if (this.player_shop_is_lock[index] == false) {
    //             this.PlayerShopItem(index);
    //         }
    //     }
    // }
    // /**
    //  * 用钱刷新神秘商店 越刷越贵
    //  * @param player_id 
    //  * @param params 
    //  * @param callback 
    //  */
    // RefreshShopByGold(player_id: PlayerID, params: {}, callback?: string) {
    //     if (this.player_shop_is_lock[player_id] == true) {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "神秘商店 : 神秘商店已锁定 请先解锁");
    //         return;
    //     }
    //     let player_gold = GameRules.PlayerInfo.GetResourcesValue(player_id, "Gold");
    //     let need_gold = this.player_refresh_data[player_id].gold;
    //     if (player_gold >= need_gold) {
    //         GameRules.PlayerInfo.ResourcesModify(player_id, "Gold", -need_gold);
    //         this.player_refresh_data[player_id].refresh_count++;
    //         let eval_param = {
    //             count: this.player_refresh_data[player_id].refresh_count,
    //         };
    //         let refresh_gold = math.ceil(LFUN.eval(this.STORE_REFRESHES_GOLD_FORMULA, eval_param));
    //         this.player_refresh_data[player_id].gold = refresh_gold;
    //         this.PlayerShopItem(player_id);
    //     } else {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "神秘商店 : 金币不足");
    //     }

    // }
    // /**
    //  * 刷新
    //  * @param player_id 
    //  */
    // private PlayerShopItem(player_id: PlayerID) {

    //     //回归池子
    //     // for (const item_data of this.shop_field_list[player_id]) {
    //     //     //回归全局池子
    //     //     if(this.item_global_count.hasOwnProperty(item_data.key)){
    //     //         this.item_global_count[item_data.key].buy_count --;
    //     //     }
    //     //     //回归玩家池子
    //     //     if(this.item_player_count[player_id].hasOwnProperty(item_data.key)){
    //     //         this.item_player_count[player_id][item_data.key].player_count ++;
    //     //     }
    //     // }
    //     let for_max = 3;
    //     if (this.player_shop_field_count[player_id] < (this.shop_field_max_tuzhi + this.player_shop_level[player_id])) {
    //         for_max = this.player_shop_field_count[player_id];
    //     } else {
    //         for_max = this.shop_field_max_tuzhi + this.player_shop_level[player_id];
    //     }
    //     this.shop_field_list[player_id] = [];
    //     for (let index = 0; index < for_max; index++) {
    //         if (index < 0) {
    //             //获取具体物品
    //             let item_index = GetCommonProbability(this.item_level_probability_group);
    //             let item_name = this.item_level_group[item_index];
    //             //是否全局唯一
    //             // let item_info = MysteriousShopConfig[item_name as keyof typeof MysteriousShopConfig];
    //             let ItemsCustomInfo = ItemBlueprint[item_name as "item_blueprint_37"];
    //             let goods_info: {
    //                 key: string, //物品key
    //                 gold: number, // 需要金币
    //                 wood: number, //需要木材
    //                 is_discount: number, //折扣 1为折扣 0为没打折
    //                 discount_rate: number, // 80%  20% 10 % 1% ----不低于1%
    //                 rarity: number, // 稀有度 1 2 3 4 5
    //                 is_buy: number, // 0 未购买 1 已购买
    //             } = {
    //                 key: item_name,
    //                 gold: ItemsCustomInfo.ItemCost,
    //                 wood: ItemsCustomInfo.ItemWood,
    //                 is_discount: 0,
    //                 discount_rate: 100,
    //                 rarity: 1,
    //                 is_buy: 0,
    //             };
    //             //判断折扣
    //             // let is_discount = MysteriousShopConfig[item_name as keyof typeof MysteriousShopConfig].is_discount;
    //             // if(is_discount){
    //             //     let discount_info = GameRules.RandomSystem.GetItemSeniorBoxRandom(this.box_type_discount_start + box_ret.level)
    //             //     if(discount_info.level != 100 && discount_info.level > 0){
    //             //         goods_info.is_discount = 1
    //             //         goods_info.discount_rate = discount_info.level;
    //             //         goods_info.gold = Math.ceil( goods_info.gold * discount_info.level * 0.01 );
    //             //         goods_info.wood = Math.ceil( goods_info.wood * discount_info.level * 0.01 );
    //             //     }
    //             // }
    //             this.shop_field_list[player_id].push(goods_info);
    //         } else {
    //             let level_index = 0;
    //             if (this.player_shop_level[player_id] > this.shop_equip_pro.length) {
    //                 level_index = this.shop_equip_pro.length - 1;
    //             } else {
    //                 level_index = this.player_shop_level[player_id] - 1;
    //             }
    //             print("level_index :", level_index);

    //             //获取具体物品
    //             let item_level = GetCommonProbability(this.shop_equip_pro[level_index]);
    //             let item_index = GetCommonProbability(GameRules.EquipShopSystem.item_level_probability_group[item_level]);
    //             let item_name = GameRules.EquipShopSystem.item_level_group[item_level][item_index];
    //             if (item_name && item_name != "") {
    //                 //是否全局唯一
    //                 // let item_info = MysteriousShopConfig[item_name as keyof typeof MysteriousShopConfig];
    //                 let ItemsCustomInfo = ItemEquipOriginConfig[item_name as "item_equip_origin_1"];
    //                 let goods_info: {
    //                     key: string, //物品key
    //                     gold: number, // 需要金币
    //                     wood: number, //需要木材
    //                     is_discount: number, //折扣 1为折扣 0为没打折
    //                     discount_rate: number, // 80%  20% 10 % 1% ----不低于1%
    //                     rarity: number, // 稀有度 1 2 3 4 5
    //                     is_buy: number, // 0 未购买 1 已购买
    //                 } = {
    //                     key: item_name,
    //                     gold: ItemsCustomInfo.ItemCost,
    //                     wood: ItemsCustomInfo.ItemWood,
    //                     is_discount: 0,
    //                     discount_rate: 100,
    //                     rarity: 1,
    //                     is_buy: 0,
    //                 };
    //                 //判断折扣
    //                 // let is_discount = MysteriousShopConfig[item_name as keyof typeof MysteriousShopConfig].is_discount;
    //                 // if(is_discount){
    //                 //     let discount_info = GameRules.RandomSystem.GetItemSeniorBoxRandom(this.box_type_discount_start + box_ret.level)
    //                 //     if(discount_info.level != 100 && discount_info.level > 0){
    //                 //         goods_info.is_discount = 1
    //                 //         goods_info.discount_rate = discount_info.level;
    //                 //         goods_info.gold = Math.ceil( goods_info.gold * discount_info.level * 0.01 );
    //                 //         goods_info.wood = Math.ceil( goods_info.wood * discount_info.level * 0.01 );
    //                 //     }
    //                 // }
    //                 this.shop_field_list[player_id].push(goods_info);
    //             }
    //         }

    //     }
    //     this.GetShopData(player_id, {});
    // }
    /**
     * 获取玩家商店数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    // GetShopData(player_id: PlayerID, params: {}, callback?: string) {
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "MysticalShopSystem_GetShopData",
    //         {
    //             data: {
    //                 shop_field_list: this.shop_field_list[player_id],
    //                 player_refresh_data: this.player_refresh_data[player_id],
    //             }
    //         }
    //     );
    // }
    // /**
    //  * 购买
    //  * @param player_id 
    //  * @param params 
    //  * @param callback 
    //  */
    // BuyItem(player_id: PlayerID, params: GEFPD["MysticalShopSystem"]["BuyItem"], callback?: string) {
    //     let item_index = params.index;
    //     if (this.shop_field_list[player_id][item_index]) {
    //         let item_info = this.shop_field_list[player_id][item_index];
    //         if (item_info.is_buy == 0) {
    //             let player_wood = GameRules.PlayerInfo.GetResourcesValue(player_id, "Wood");
    //             let player_gold = GameRules.PlayerInfo.GetResourcesValue(player_id, "Gold");
    //             if (player_wood < item_info.wood) {
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "mystical shop : 没有木材");
    //             } else if (player_gold < item_info.gold) {
    //                 GameRules.CMsg.SendErrorMsgToPlayer(player_id, "mystical shop : 没有金币");
    //             } else {
    //                 // 扣除对应木材
    //                 if (item_info.wood > 0) {
    //                     GameRules.PlayerInfo.ResourcesModify(player_id, "Wood", - item_info.wood);
    //                 }
    //                 // 扣除金币
    //                 if (item_info.gold > 0) {
    //                     GameRules.PlayerInfo.ResourcesModify(player_id, "Gold", - item_info.gold);
    //                 }
    //                 GameRules.CMsg.PlaySound("General.Buy", player_id);
    //                 let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
    //                 let hNewItem = CreateItem(item_info.key, null, null);
    //                 hHero.AddItem(hNewItem);
    //                 //标记为出售
    //                 this.shop_field_list[player_id][item_index].is_buy = 1;
    //             }
    //         } else {
    //             GameRules.CMsg.SendErrorMsgToPlayer(player_id, "此物已经被购买");
    //         }

    //     } else {
    //         GameRules.CMsg.SendErrorMsgToPlayer(player_id, "物品不存在");
    //     }
    //     this.GetShopData(player_id, {});
    // }
    // /**
    //  * 商店锁定获解锁
    //  * @param player_id 
    //  * @param params 
    //  * @param callback 
    //  */
    // ShopLock(player_id: PlayerID, params: GEFPD["MysticalShopSystem"]["ShopLock"], callback?: string) {
    //     this.player_shop_is_lock[player_id] = !this.player_shop_is_lock[player_id];
    //     this.GetShopLockDota(player_id, {});
    // }
    // /**
    //  * 获取商店锁定信息
    //  * @param player_id 
    //  * @param params 
    //  * @param callback 
    //  */
    // GetShopLockDota(player_id: PlayerID, params: GEFPD["MysticalShopSystem"]["GetShopLockDota"], callback?: string) {
    //     CustomGameEventManager.Send_ServerToPlayer(
    //         PlayerResource.GetPlayer(player_id),
    //         "MysticalShopSystem_GetShopLockDota",
    //         {
    //             data: {
    //                 state: this.player_shop_is_lock[player_id]
    //             }
    //         }
    //     );
    // }

}