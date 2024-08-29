import { reloadable } from '../../../utils/tstl-utils';
import { UIEventRegisterClass } from '../../class_extends/ui_event_register_class';
import * as MysteriousShopConfig from "../../../json/config/game/shop/mysterious_shop_config.json";
import { modifier_prop_effect } from '../../../modifier/prop_effect/modifier_prop_effect';
// import * as ItemsCustom from "../../../json/npc_items_custom.json";
// import * as ItemBlueprint from "../../../json/items/item_blueprint.json";
// import * as ItemEquipOriginConfig from "../../../json/Items/item_equip_origin.json";

// ItemCost
/**商店 */
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
    shop_field_max: number = 5;
    //VIP栏位
    shop_field_max_vip: number = 1;
    //刷新信息
    player_refresh_data: PlayerRefreshData[] = [];
    //商店准备信息
    shop_state_data: ShopStateData[] = [];
    //售卖状态
    start_buy_state: number = 0;
    //玩家vip状态
    player_vip_status: number[] = [];

    //购买结束时间
    countdown_timer: number = 0;
    //玩家购买时间
    MYSTICAL_SHOP_BUY_ITEM: number = 90;
    //最终等待时间
    MYSTICAL_SHOP_AWAIT: number = 3;

    //玩家折扣率
    player_shop_discount: number[] = [];
    //获得灵魂概率 双倍产出概率 
    player_get_soul_double_pro: number[] = [];

    /**
     * 玩家购买记录
     */
    player_shop_buy_data : { [item_key: string]: number }[] = []; //购买的物品

    /**
     * 玩家购买记录
     */
    player_shop_buy_client : { item_key: string , count : number }[][] = [];//购买的物品
    /**
     * 初始灵魂刷新价格
     */
    initial_refresh_price: number = 100;
    /**
     * 1-5次增加价格 
     */
    refresh_price_1_5: number = 50;
    /**
     * 5次后增加价格
     */
    refresh_price_6: number = 100;
    /**
     * 刷新次数上限
     */
    refresh_limit: number = 10;
    //玩家灵魂消耗率

    prop_ability_values: {
        [name: string]: {
            [key: string]: number[];
        };
    } = {};

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
            this.player_shop_level  .push(0);
            this.shop_field_list.push([]);
            this.player_shop_field_count.push(this.shop_field_max + this.shop_field_max_vip);
            this.player_shop_field_count_lock.push(this.shop_field_lock);
            this.item_player_count.push({});
            this.shop_state_data.push({
                is_ready: 0,
            });
            this.player_shop_discount.push(100);
            this.player_get_soul_double_pro.push(0);
            //玩家商店已购买的数据  
            this.player_shop_buy_data.push({});
            //
            this.player_shop_buy_client.push([]);
            //玩家vip状态
            this.player_vip_status.push(0);
        }
        //购买时间
        this.MYSTICAL_SHOP_BUY_ITEM = GameRules.PUBLIC_CONST.MYSTICAL_SHOP_BUY_ITEM;

        //初始化
        for (let i_key in MysteriousShopConfig) {
            let data = MysteriousShopConfig[i_key as keyof typeof MysteriousShopConfig];
            this.prop_ability_values[i_key] = {};
            //技能数组
            for (const A_key in data.AbilityValues) {
                let str = tostring(data.AbilityValues[A_key]);
                let strlist = str.split(" ");
                let numlist: number[] = [];
                for (let value of strlist) {
                    numlist.push(tonumber(value));
                }
                this.prop_ability_values[i_key][A_key] = numlist;
            }
        }

        //整体刷新价格
        // for (let index = 0 as PlayerID; index < this.player_count; index++) {
        //     let eval_param = {
        //         count: 0,
        //     };
        //     let refresh_soul = math.ceil(eval(this.STORE_REFRESHES_SOUL_FORMULA, eval_param));
        //     this.player_refresh_data.push({
        //         refresh_count: 0,
        //         soul: refresh_soul,
        //     });
        // }
    }
    /**
     * 初始化神秘商店
     */
    InitPlayerUpgradeStatus(player_id: PlayerID) {
        print("MysticalShopSystem InitPlayerUpgradeStatus")
        this.shop_field_list[player_id] = [];
        this.player_shop_buy_data[player_id] = {};
        this.player_shop_buy_client[player_id] = []
        this.player_shop_discount[player_id] = 100;
        this.player_get_soul_double_pro[player_id] = 0;
        this.player_shop_field_count[player_id] = this.shop_field_max + this.shop_field_max_vip;
        this.player_shop_field_count_lock[player_id] = this.shop_field_lock;
        this.item_player_count[player_id] = {};

        let eval_param = {
            count: 0,
        };
        let refresh_soul = GameRules.MysticalShopSystem.initial_refresh_price;
        for (let index = 0; index < this.player_shop_field_count[player_id]; index++) {
            let is_vip = 0;
            if (index >= this.shop_field_max) {
                is_vip = 1;
            }
            this.shop_field_list[player_id].push({
                key: "null",
                soul: 0,
                is_discount: 0,
                discount_rate: 100,
                rarity: 1,
                is_buy: 0,
                is_lock: 0,
                is_vip: is_vip,
                refresh_count: 0, //刷新次数
                refresh_soul: refresh_soul, //刷新价格
            });
        }
    }
    //刷新神秘商店 并开始售卖
    RefreshMysticalShopItem() {
        this.player_count = GetPlayerCount();
        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            // this.player_refresh_data[index].refresh_count = 0;
            // let eval_param = {
            //     count: this.player_refresh_data[index].refresh_count, 
            // };
            // let refresh_soul = math.ceil(eval(this.STORE_REFRESHES_SOUL_FORMULA, eval_param));
            // this.player_refresh_data[index].soul = refresh_soul;
            this.shop_state_data[index].is_ready = 0;
        }
        //开始售卖
        this.start_buy_state = 1;
        //完成时间
        this.countdown_timer = GameRules.GetDOTATime(false, false) + this.MYSTICAL_SHOP_BUY_ITEM;

        GameRules.MysticalShopSystem.GetShopState(-1, {});
        //给每个玩家刷新一次商店
        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            GameRules.MysticalShopSystem.PlayerShopItem(index);
        }

        GameRules.GetGameModeEntity().SetContextThink("MYSTICAL_SHOP_BUY_ITEM", () => {
            GameRules.MysticalShopSystem.StopShopSystem();
            return null;
        }, this.MYSTICAL_SHOP_BUY_ITEM);
    }
    /**
     * 使用灵魂刷新单个物品 
     * @param player_id 
     * @param params 
     * @param callback 
     */
    RefreshOneItemBySoul(player_id: PlayerID, params: CGED["MysticalShopSystem"]["RefreshOneItemBySoul"], callback?: string) {
        let index = params.index;
        if (this.shop_state_data[player_id].is_ready == 0) {
            let refresh_count = this.shop_field_list[player_id][index].refresh_count;

            if (refresh_count >= GameRules.MysticalShopSystem.refresh_limit) {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "神秘商店 : 刷新超过上限!");
                return
            }

            let refresh_soul = this.shop_field_list[player_id][index].refresh_soul;

            let player_gold_start = GameRules.ResourceSystem.ModifyResource(player_id, { Soul: - refresh_soul });

            if (player_gold_start.status) {
                GameRules.MysticalShopSystem.OneItemRefresh(player_id, index)
            } else {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "神秘商店 : !" + player_gold_start.msg);
            }
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "神秘商店 : 准备后无法刷新!");
        }
    }
    /**
     * 停止商店
     */
    StopShopSystem() {
        // GameRules.BuffManager.AddGeneralDebuff("")
        GameRules.GetGameModeEntity().StopThink("MYSTICAL_SHOP_BUY_ITEM");

        for (let hHero of HeroList.GetAllHeroes()) {

        }


        let refresh_soul = GameRules.MysticalShopSystem.initial_refresh_price;
        for (let index = 0 as PlayerID; index < this.player_count; index++) {
            //重新更新商店
            for (let i = 0; i < this.player_shop_field_count[index]; i++) {
                let is_vip = 0;
                if (i >= this.shop_field_max) {
                    is_vip = 1;
                }
                if (this.shop_field_list[index][i].is_lock == 0) {
                    this.shop_field_list[index][i] = {
                        key: "null",
                        soul: 0,
                        is_discount: 0,
                        discount_rate: 100,
                        rarity: 1,
                        is_buy: 0,
                        is_lock: 0,
                        is_vip: is_vip,
                        refresh_count: 0, //刷新次数
                        refresh_soul: refresh_soul, //刷新价格
                    };
                } else {
                    this.shop_field_list[index][i].refresh_count = 0;
                    this.shop_field_list[index][i].refresh_soul = refresh_soul;
                }
            }
            GameRules.MysticalShopSystem.shop_state_data[index].is_ready = 0;
        }
        //停止售卖
        GameRules.MysticalShopSystem.start_buy_state = 0;

        GameRules.MysticalShopSystem.GetShopState(-1, {})

        if (GameRules.MapChapter._game_select_phase == 3) {
            // GameRules.CMsg.SendCommonMsgToPlayer(
            //     -1 as PlayerID,
            //     "他们又来了，他们更强了……",
            //     {}
            // );
            GameRules.CMsg.SendMsgToAll(CGMessageEventType.MESSAGE6);
            //继续游戏
            GameRules.GetGameModeEntity().SetContextThink("StartSpawnControlStartSpawnControl", () => {
                GameRules.Spawn.StartSpawnControl()
                return null;
            }, this.MYSTICAL_SHOP_AWAIT);
            
        }
    }
    /**
     * 刷新
     * @param player_id 
     */
    private PlayerShopItem(player_id: PlayerID) {
        //回归池子
        for (const item_data of this.shop_field_list[player_id]) {
            //锁定和卖了不会回归池子
            if (item_data.is_lock == 1) {
                continue;
            }
            if (item_data.is_buy == 1) {
                continue;
            }
            //回归全局池子
            if (this.item_global_count.hasOwnProperty(item_data.key)) {
                this.item_global_count[item_data.key].buy_count--;
            }
            //回归玩家池子
            if (this.item_player_count[player_id].hasOwnProperty(item_data.key)) {
                this.item_player_count[player_id][item_data.key].player_count--;
            }
        }
        let for_max = this.player_shop_field_count[player_id];

        let shop_wp_list: string[] = [];

        //循环计数器
        let amount_count = 0;
        let amount_max = 50;

        for (let index = 0; index < for_max; index++) {
            amount_count++;
            if (amount_count > amount_max) {
                break;
            }

            //获取具体物品
            let item_index = GetCommonProbability(this.item_level_probability_group);
            let item_name = this.item_level_group[item_index];

            if (this.shop_field_list[player_id][index].is_lock == 1) {
                //保存
                shop_wp_list.push(this.shop_field_list[player_id][index].key);
                continue;
            }
            if (shop_wp_list.includes(item_name)) {
                //跳过本次 
                index--;
                continue;
            }
            if (this.item_player_count[player_id].hasOwnProperty(item_name)) {
                if (this.item_player_count[player_id][item_name].player_count >= this.item_player_count[player_id][item_name].player_max) {
                    //跳过本次 
                    index--;
                    continue;
                }
            }
            if (item_name && item_name != "") {
                //是否全局唯一
                let ItemsCustomInfo = MysteriousShopConfig[item_name as "prop_1"];
                if(ItemsCustomInfo.buy_count_max >= 1){//大于0的特殊购买
                    if (this.player_shop_buy_data[player_id].hasOwnProperty(item_name)) {
                        if(this.player_shop_buy_data[player_id][item_name] >= ItemsCustomInfo.buy_count_max){
                            index--;
                            continue;
                        }
                    }
                }
                let buysoul = math.ceil(ItemsCustomInfo.soul * (this.player_shop_discount[player_id]) / 100);
                this.shop_field_list[player_id][index].key = item_name;
                this.shop_field_list[player_id][index].soul = buysoul;
                this.shop_field_list[player_id][index].rarity = ItemsCustomInfo.rarity;
                this.shop_field_list[player_id][index].is_buy = 0;
                this.shop_field_list[player_id][index].is_lock = 0;
            } else {
                index--;
                continue;
            }
            //保存
            shop_wp_list.push(item_name);
        }
        this.GetShopData(player_id, {});
    }


    /**
     * 单个位置道具刷新
     * @param player_id 
     * @param index     
     */
    private OneItemRefresh(player_id: PlayerID, index: number) {
        let shop_wp_list: string[] = [];
        //回归池子
        for (let it = 0; it < this.player_shop_field_count[player_id]; it++) {
            if(it == index){
                if (this.shop_field_list[player_id][index]) {
                    let item_data = this.shop_field_list[player_id][index];
                    shop_wp_list.push(item_data.key);
                    //卖了不会回归池子
                    if (item_data.is_buy == 1) {
                        
                    } else {
                        //回归全局池子
                        if (this.item_global_count.hasOwnProperty(item_data.key)) {
                            this.item_global_count[item_data.key].buy_count--;
                        }
                        //回归玩家池子
                        if (this.item_player_count[player_id].hasOwnProperty(item_data.key)) {
                            this.item_player_count[player_id][item_data.key].player_count--;
                        }
                    }
                }
            }else{
                let item_data = this.shop_field_list[player_id][it];
                shop_wp_list.push(item_data.key);
            }
            
        }
        
        //循环计数器
        let amount_count = 0;
        let amount_max = 50;

        for (let i = 0; i < 1; i++) {
            amount_count++;
            if (amount_count > amount_max) {
                break;
            }
            print("amount_count :" , amount_count);

            //获取具体物品
            let item_index = GetCommonProbability(this.item_level_probability_group);
            let item_name = this.item_level_group[item_index];


            if (shop_wp_list.includes(item_name)) {
                //跳过本次 
                i--;
                continue;
            }
            if (this.item_player_count[player_id].hasOwnProperty(item_name)) {
                if (this.item_player_count[player_id][item_name].player_count >= this.item_player_count[player_id][item_name].player_max) {
                    //跳过本次 
                    i--;
                    continue;
                }
            }
            if (item_name && item_name != "") {
                //是否全局唯一
                let ItemsCustomInfo = MysteriousShopConfig[item_name as "prop_1"];
                if(ItemsCustomInfo.buy_count_max >= 1){//大于0的特殊购买
                    if (this.player_shop_buy_data[player_id].hasOwnProperty(item_name)) {
                        if(this.player_shop_buy_data[player_id][item_name] >= ItemsCustomInfo.buy_count_max){
                            i--;
                            continue;
                        }
                    }
                }
                let buysoul = math.ceil(ItemsCustomInfo.soul * (this.player_shop_discount[player_id]) / 100);
                this.shop_field_list[player_id][index].key = item_name;
                this.shop_field_list[player_id][index].soul = buysoul;
                this.shop_field_list[player_id][index].rarity = ItemsCustomInfo.rarity;
                this.shop_field_list[player_id][index].is_buy = 0;
                this.shop_field_list[player_id][index].is_lock = 0;
                this.shop_field_list[player_id][index].refresh_count = this.shop_field_list[player_id][index].refresh_count + 1;
                //刷新价格增加
                let refresh_soul = GameRules.MysticalShopSystem.GetSXPrice(this.shop_field_list[player_id][index].refresh_count);
                this.shop_field_list[player_id][index].refresh_soul = refresh_soul;
            } else {
                i--;
                continue;
            }
            //保存
            shop_wp_list.push(item_name);
        }
        this.GetShopData(player_id, {});
    }

    /**
     * 刷新价格获得方法
     * @param count 刷新次数
     */

    GetSXPrice(count: number): number {
        let initial_refresh_price = GameRules.MysticalShopSystem.initial_refresh_price;
        let refresh_price = initial_refresh_price
        if (count > 5) {
            refresh_price += (GameRules.MysticalShopSystem.refresh_price_1_5 * 5) + (GameRules.MysticalShopSystem.refresh_price_6 * (count - 5))
        } else {
            refresh_price += GameRules.MysticalShopSystem.refresh_price_1_5 * count
        }
        return refresh_price;
    }
    /**
     * 获取玩家商店数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetShopData(player_id: PlayerID, params: CGED["MysticalShopSystem"]["GetShopData"], callback?: string) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MysticalShopSystem_GetShopData",
            {
                data: {
                    shop_field_list: this.shop_field_list[player_id],
                    player_refresh_data: this.player_refresh_data[player_id],
                    player_vip_status: this.player_vip_status[player_id]
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
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "MysticalShopSystem_GetShopState",
                {
                    data: {
                        shop_state_data: this.shop_state_data,
                        start_buy_state: this.start_buy_state,
                        countdown_timer: this.countdown_timer,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MysticalShopSystem_GetShopState",
                {
                    data: {
                        shop_state_data: this.shop_state_data,
                        start_buy_state: this.start_buy_state,
                        countdown_timer: this.countdown_timer,
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
        if (this.shop_state_data[player_id].is_ready == 0) {
            let item_index = params.index;
            if (this.shop_field_list[player_id][item_index]) {
                let item_info = this.shop_field_list[player_id][item_index];
                if (item_info.is_buy == 0) {
                    //扣除资源
                    let ModifyResource = GameRules.ResourceSystem.ModifyResource(player_id, { Soul: - item_info.soul });

                    if (ModifyResource.status) {
                        let name = item_info.key;
                        //标记为出售
                        this.shop_field_list[player_id][item_index].is_buy = 1;
                        this.shop_field_list[player_id][item_index].is_lock = 0;
                        this.AddPropAttribute(player_id, name)
                    } else {
                        GameRules.CMsg.SendErrorMsgToPlayer(player_id, "mystical shop : " + ModifyResource.msg);
                    }
                } else {
                    GameRules.CMsg.SendErrorMsgToPlayer(player_id, "此物已经被购买");
                }

            } else {
                GameRules.CMsg.SendErrorMsgToPlayer(player_id, "物品不存在");
            }
            this.GetShopData(player_id, {});
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "玩家准备后无法购买.");
        }
    }

    /** 添加商店物品数据 */
    AddPropAttribute(player_id: PlayerID, prop_name: string) {
        if (this.player_shop_buy_data[player_id].hasOwnProperty(prop_name)) {
            this.player_shop_buy_data[player_id][prop_name]++;
        } else {
            this.player_shop_buy_data[player_id][prop_name] = 1;
        }
        //循环查找有没有相同名字
        let item_is_add = false
        for (let it = 0; it < this.player_shop_buy_client[player_id].length; it++) {
            if(this.player_shop_buy_client[player_id][it].item_key == prop_name){
                item_is_add = true;
                this.player_shop_buy_client[player_id][it].count ++;
            }
        }
        if(item_is_add == false)[
            this.player_shop_buy_client[player_id].push({
                "count" : 1,
                "item_key" : prop_name,
            })
        ]
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        hHero.prop_level_index[prop_name] = 0;
        let prop_buff = hHero.FindModifierByName("modifier_prop_effect") as modifier_prop_effect
        let ItemData = MysteriousShopConfig[prop_name as keyof typeof MysteriousShopConfig];
        if (prop_buff) {
            let AbilityValues = ItemData.AbilityValues;
            prop_buff.Prop_InputAbilityValues(prop_name, AbilityValues)
        }

        let ObjectValues = ItemData.ObjectValues as CustomAttributeTableType;
        let attr_key = "attr_" + prop_name + GameRules.GetDOTATime(false , false);
        // print("SetAttributeInKey",attr_key)
        GameRules.CustomAttribute.SetAttributeInKey(hHero, attr_key, ObjectValues);


        let ret_action_string = ItemData.ret_action;
        let param = ItemData.AbilityValues;
        if (ret_action_string != "Null" && ret_action_string != 1) {
            //执行后续处理....
            GameRules.MysticalShopSystem[ret_action_string](player_id, param, prop_name);
        }
        //发送信息
        this.GetPlayerShopBuyData(player_id , {})
    }

    /**
     * 获取玩家玩家神秘商店购买数据
     * @param player_id 
     * @param params 
     * @param callback 
     */
    GetPlayerShopBuyData(player_id: PlayerID, params: CGED["MysticalShopSystem"]["GetPlayerShopBuyData"], callback?: string) {
        DeepPrintTable( this.player_shop_buy_client[player_id])
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MysticalShopSystem_GetPlayerShopBuyData",
            {
                data: {
                    player_shop_buy_data: this.player_shop_buy_client[player_id],
                }
            }
        );
    }
    /**
     * 商店单锁定获解锁
     * @param player_id 
     * @param params 
     * @param callback 
     */
    ShopLock(player_id: PlayerID, params: CGED["MysticalShopSystem"]["ShopLock"], callback?: string) {
        let item_index = params.index;
        if (this.shop_field_list[player_id][item_index].is_buy == 1) {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "已购买的物品无法锁定!!!!");
        }
        if (this.shop_field_list[player_id][item_index].is_lock == 0) {
            this.shop_field_list[player_id][item_index].is_lock = 1;
        } else {
            this.shop_field_list[player_id][item_index].is_lock = 0;
        }
        this.GetShopData(player_id, {});
    }
    /**
     * 【常客优惠I】 【常客优惠II】
     * @param player_id  //玩家名字
     * @param buffname  //buff名字
     * @param player_id  //参数
     */
    LowerConsume(player_id: PlayerID, param: { value: number }, key: string) {
        //更新数值
        GameRules.MysticalShopSystem.player_shop_discount[player_id] -= param.value;
        //更新商店正在售卖物品的价格
        let length = this.shop_field_list[player_id].length;
        for (let index = 0; index < length; index++) {
            //没有被卖出的物品都更新价格
            if (GameRules.MysticalShopSystem.shop_field_list[player_id][index].is_buy == 0) {
                let ItemsCustomInfo = MysteriousShopConfig[GameRules.MysticalShopSystem.shop_field_list[player_id][index].key as "prop_1"];
                let buysoul = math.ceil(ItemsCustomInfo.soul * (this.player_shop_discount[player_id]) / 100);
                GameRules.MysticalShopSystem.shop_field_list[player_id][index].soul = buysoul;
            }

        }
        this.GetShopData(player_id, {});
    }

    /**
     * 【双倍灵魂】
     * @param player_id  //玩家名字
     * @param buffname  //buff名字
     * @param player_id  //参数
     */
    GetDoubleSoulPro(player_id: PlayerID, param: { value: number, max: number }, key: string) {
        //更新数值
        if (GameRules.MysticalShopSystem.player_get_soul_double_pro[player_id] < param.max) {
            GameRules.MysticalShopSystem.player_get_soul_double_pro[player_id] += param.value;
        }
    }

    /**
     * 【火元素·I】 【雷元素·I】 【冰元素·I】 【风元素·I】
     * @param player_id  //玩家名字
     * @param buffname  //buff名字
     * @param player_id  //参数
     */
    AddElement(player_id: PlayerID, param: { element_number: ElementTypeEnum, count: number }, key: string) {
        //更新数值
        GameRules.NewArmsEvolution.SetElementBondDate(player_id, param.element_number, param.count, 2)
    }
    /**
     * 增加具体buff
     * @param player_id 
     * @param buffname 
     * @param param 
     */
    AddBuff(player_id: PlayerID, param: { [key: string]: string | number }, key: string) {
        let unit = PlayerResource.GetSelectedHeroEntity(player_id);
        let shopdata = MysteriousShopConfig[key as keyof typeof MysteriousShopConfig]
        if (unit) {
            // 技能
            let custom_datadriven_ability = unit.FindAbilityByName("custom_datadriven_ability")
            GameRules.CustomAttribute.AddHeroModifier(
                unit,
                custom_datadriven_ability,
                shopdata.BuffName,
                shopdata.Drive as "Driven" | "Script",
            )
        }
    }
    /**
     * 对全体玩家增加buff
     */
    AddBuffOfAll(player_id: PlayerID, param: { [key: string]: string | number }, key: string) {
        let playercount = GetPlayerCount()
        let shopdata = MysteriousShopConfig[key as keyof typeof MysteriousShopConfig]
        for (let index = 0 as PlayerID; index < playercount; index++) {
            let unit = PlayerResource.GetSelectedHeroEntity(index);
            if (unit) {
                // 技能
                let custom_datadriven_ability = unit.FindAbilityByName("custom_datadriven_ability")
                GameRules.CustomAttribute.AddHeroModifier(
                    unit,
                    custom_datadriven_ability,
                    shopdata.BuffName,
                    shopdata.Drive as "Driven" | "Script",
                )
            }
        }
    }
    /**
     * 增加Ability
     * @param player_id 
     * @param param 
     * @param key 
     */
    AddAbility(player_id: PlayerID, param: { [key: string]: string | number }, key: string){
        let unit = PlayerResource.GetSelectedHeroEntity(player_id);
        let shopdata = MysteriousShopConfig[key as keyof typeof MysteriousShopConfig]
        if (unit) {
            // 技能
            let ability = unit.AddAbility(shopdata.BuffName);
        }
    }
    /**
     * 圣剑
     * @param player_id 
     * @param param 
     * @param key 
     */
    SaintSword(player_id: PlayerID, param: { AttackBasePer :  number }, key: string){
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let count = param.AttackBasePer * this.player_shop_buy_data[player_id]["prop_14"];
        let attr_key = "prop_14_SaintSword";
        let ObjectValues = {
            "AttackDamage": {
              "BasePercent": count
            }
        }   
        GameRules.CustomAttribute.SetAttributeInKey(hHero, attr_key, ObjectValues);
    }
    /**
     * 给全队蓝
     */
    AddAttrOfAll(player_id: PlayerID, param: { ManaRegenBase :  number }, key: string){
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let TeamPropCount = this.GetTeamPropCount("prop_35")
        let count = param.ManaRegenBase * TeamPropCount;
        let attr_key = "prop_35_aoshuzhihuan";
        let ObjectValues = {
            "ManaRegen": {
              "Base": count
            }
        }   
        GameRules.CustomAttribute.SetAttributeInKey(hHero, attr_key, ObjectValues);
    }
    /**
     * 重置天赋
     * @param player_id 
     * @param param 
     * @param key 
     */
    ResetSkill(player_id: PlayerID, param: { ManaRegenBase :  number }, key: string){
        let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        GameRules.HeroTalentSystem.RegisterHeroTalent(hHero , true)
    }
    /**
     * 增加属性
     * @param player_id 
     * @param buffname 
     * @param param 
     */
    AddAttr(player_id: PlayerID, param: { [key: string]: number }, key: string) {
        let unit = PlayerResource.GetSelectedHeroEntity(player_id);
        if (unit) {
            let attr_list: CustomAttributeTableType = {};
            for (const key in param) {
                if (key.includes("|")) {
                    let attrnamelist = key.split("|");
                    if (!attr_list.hasOwnProperty(attrnamelist[0])) {
                        attr_list[attrnamelist[0]] = {};
                    }
                    if (!attr_list[attrnamelist[0]].hasOwnProperty(attrnamelist[1])) {
                        attr_list[attrnamelist[0]][attrnamelist[1]] = param[key];
                    } else {
                        attr_list[attrnamelist[0]][attrnamelist[1]] += param[key];
                    }
                }
            }
            // 技能
            GameRules.CustomAttribute.ModifyAttribute(unit, attr_list)
        }
    }

    /**
     * 增加玩家生命数
     * @param player_id 
     * @param buffname 
     * @param param 
     */
    AddPlayerLife(player_id: PlayerID, param: { count: number }, key: string) {
        // GameRules.GameInformation.AddPlayerLife(player_id, param.count);
    }
    /**
     * 玩家准备
     * @param cmd 
     * @param args 
     * @param player_id 
     */
    PlayerReady(player_id: PlayerID, params: CGED["MysticalShopSystem"]["PlayerReady"], callback?: string) {
        if (this.shop_state_data[player_id].is_ready == 0) {
            this.shop_state_data[player_id].is_ready = 1;
        } else {
            GameRules.CMsg.SendErrorMsgToPlayer(player_id, "你已准备好了!");
            GameRules.MysticalShopSystem.GetShopState(-1, {})
            return
        }
        let player_count = GetPlayerCount();
        let all_ready = true;
        for (let index = 0 as PlayerID; index < player_count; index++) {
            let is_ready = this.shop_state_data[index].is_ready;
            if (is_ready == 0) {
                all_ready = false;
                break
            }
        }
        if (all_ready) {
            let itme = GameRules.GetDOTATime(false, false)

            if ((this.countdown_timer - itme) > 3) {
                //完成时间
                this.countdown_timer = GameRules.GetDOTATime(false, false) + this.MYSTICAL_SHOP_AWAIT;

                GameRules.GetGameModeEntity().StopThink("MYSTICAL_SHOP_BUY_ITEM");

                GameRules.GetGameModeEntity().SetContextThink("MYSTICAL_SHOP_BUY_ITEM", () => {
                    GameRules.MysticalShopSystem.StopShopSystem();
                    return null;
                }, this.MYSTICAL_SHOP_AWAIT);

                GameRules.MysticalShopSystem.GetShopState(-1, {});
            }
        } else {
            GameRules.MysticalShopSystem.GetShopState(-1, {})
        }
    }

    /**
     * 快速获取技能值 (如果大于技能等级则返回最高等级 如果小于最低等级则返回最低等级)
     * @param name 符文名
     * @param key 技能键
     * @param level_index 等级下标
     */
    GetTKV<
        Key extends keyof typeof MysteriousShopConfig,
        T2 extends typeof MysteriousShopConfig[Key],
    >(prop_name: Key, key: keyof T2["AbilityValues"], level_index: number = 0) {
        let value_key = key as string;

        //因为只有 1级 所以全部返回 0 的下标
        return this.prop_ability_values[prop_name][value_key][0];


        let length = this.prop_ability_values[prop_name][value_key].length;
        if (length > 0) {
            if (level_index < 0) {
                return this.prop_ability_values[prop_name][value_key][0];
            } else if ((level_index + 1) > length) {
                return this.prop_ability_values[prop_name][value_key][length - 1];
            } else {
                return this.prop_ability_values[prop_name][value_key][level_index];
            }
        } else {
            return this.prop_ability_values[prop_name][value_key][level_index];

        }
    }
    /**
     * 商店Ability数据获取 ----> GameRules.MysticalShopSystem.GetKvOfUnit
     * @param hUnit // 英雄实体
     * @param prop_name // 道具名
     * @param ability_key //道具ability key
     * @returns 
     */
    GetKvOfUnit<
        Key extends keyof typeof MysteriousShopConfig,
        T2 extends typeof MysteriousShopConfig[Key],
    >(hUnit: CDOTA_BaseNPC, prop_name: Key, ability_key: keyof T2["AbilityValues"]) {
        if (IsServer()) {
            let level_index = hUnit.prop_level_index[prop_name]
            if (level_index == null) {
                return 0
            } else {
                return this.GetTKV(prop_name, ability_key, level_index - 1)
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
     * 获取团队物品数量
     * @param prop_name 
     */
    GetTeamPropCount<Key extends keyof typeof MysteriousShopConfig>(prop_name: Key) {
        let count = 0;
        for (let player_id = 0 as PlayerID; player_id < 4; player_id++) {
            let hHero = PlayerResource.GetSelectedHeroEntity(player_id);
            if(hHero && hHero.prop_level_index[prop_name]){
                count += this.player_shop_buy_data[player_id][prop_name]
            }
        }
        return count
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
        Key extends keyof typeof MysteriousShopConfig,
        T2 extends typeof MysteriousShopConfig[Key],
    >(hUnit: CDOTA_BaseNPC, prop_name: Key, ability_key: keyof T2["AbilityValues"]) {
        let level_index = hUnit.prop_level_index[prop_name] ?? 0
        return this.GetTKV(prop_name, ability_key, level_index);
    }


    Debug(cmd: string, args: string[], player_id: PlayerID) {
        //开始售卖
        if (cmd == "-RefreshMysticalShopItem") {
            this.RefreshMysticalShopItem();
        }
        //没有条件的刷新整个商店 
        if (cmd == "-PlayerShopItem") {
            this.PlayerShopItem(player_id);
        }
        //购买第1个位置的物品
        if (cmd == "-BuyItem") {
            this.BuyItem(player_id, { index: 0 })
        }
        //锁住第一个商店的物品
        if (cmd == "-ShopLock") {
            this.ShopLock(player_id, { index: 0 })
        }
        //神秘商店初始化
        if (cmd == "-InitPlayerUpgradeStatus") {
            this.InitPlayerUpgradeStatus(player_id)
        }

        if (cmd == "-RefreshOneItemBySoul") {
            this.RefreshOneItemBySoul(player_id, { index: 0 })
        }
        //直接停止神秘商店  
        if (cmd == "-StopShopSystem") {
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