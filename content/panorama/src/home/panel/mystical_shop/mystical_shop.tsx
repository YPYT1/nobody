import { GetTextureSrc } from "../../../common/custom_kv_method";
import { default as MysteriousShopConfig } from "../../../json/config/game/shop/mysterious_shop_config.json";
import { SetLabelDescriptionExtra } from "../../../utils/ability_description";
import { HideCustomTooltip, ShowCustomTextTooltip } from "../../../utils/custom_tooltip";
import { CreateGameComponent, LoadGameComponent } from "../../component/component_manager";

const localPlayer = Game.GetLocalPlayerID();
const SHOP_ITEM_COUNT = 3;
let MainPanel = $.GetContextPanel();
let MysticalShop = $("#MysticalShop");
let ShopItemList = $("#ShopItemList");
let start_buy_state = 0;
let loop_state = false;
let PopupModal = $("#PopupModal");
let PurchaseConfirm = $("#PurchaseConfirm")
let BtnConfirm = $("#BtnConfirm") as Button;

const ExtremePropsList = $("#ExtremePropsList")
const LocalExtremePropsList = $("#LocalExtremePropsList");

const RefreshShopBtn = $("#RefreshShopBtn") as Button;
const GameEventsSubscribeInit = () => {

    GameEvents.Subscribe("MysticalShopSystem_GetShopState", event => {
        let data = event.data;
        start_buy_state = data.start_buy_state;
        // 页面显示
        MainPanel.SetHasClass("Show", start_buy_state == 1);
        // 结束倒计时
        MysticalShop.Data<PanelDataObject>().countdown_timer = data.countdown_timer;
        // 更新玩家状态
        let ReadyList = Object.values(data.shop_state_data);
        let is_ready = ReadyList[localPlayer].is_ready == 1;
        // $.Msg(["ready_state",ready_state])
        let ReadyBtn = $("#ReadyBtn") as Button;
        ReadyBtn.enabled = !is_ready;
        ShopItemList.SetHasClass("IsReady", is_ready);

        // 触发商店时,弹窗
        MysticalShop.SetHasClass("Open", true)
        // @TODO 准备之后无法购买、无法刷新。但可以锁定\取消锁定。

    })

    GameEvents.Subscribe("MysticalShopSystem_GetShopData", event => {
        $.Msg("MysticalShopSystem_GetShopData")
        let data = event.data;
        // 刷新次数和刷新价格
        let shop_info = data.shop_field_list;
        MysticalShop.SetDialogVariableInt("refresh_cost", shop_info.refresh_soul);
        MysticalShop.SetDialogVariableInt("refresh_count", shop_info.refresh_count);
        MysticalShop.SetDialogVariableInt("refresh_max", shop_info.refresh_max);

        let local_vip = data.player_vip_status;
        let has_limit_item: string[] = [];
        // 成长道具
        let list_data = Object.values(event.data.player_shop_buy_ts_data);
        for (let i = 0; i < list_data.length; i++) {
            // $.Msg(ItemPanel)
            let data = list_data[i];
            let item_key = data.item_key;
            let type = data.type;
            let is_vip = data.is_vip == 1
            let ItemPanel = ExtremePropsList.GetChild(i);
            let star = data.count;
            if (ItemPanel) {
                ItemPanel.SetHasClass("IsLock", type == 0);
                ItemPanel.SetHasClass("Null", type != 1);
                ItemPanel.SetHasClass("IsVip", is_vip);
                // let is_vip = data.is_vip;
                let ShopItemComponent = ItemPanel.FindChildTraverse("ShopItemComponent") as GameComponent_PropItem;

                for (let r = 1; r <= 6; r++) {
                    ItemPanel.SetHasClass("rare_" + r, r == (star + 1))
                }
                if (type == 1) {
                    has_limit_item.push(data.item_key)
                    ItemPanel.SetDialogVariable("item_name", $.Localize(`#custom_shopitem_${data.item_key}`));
                    ShopItemComponent._SetConfig({ item_id: data.item_key, rare: star + 1, show_tips: true });
                    // Star
                    let ItemStar = ItemPanel.FindChildTraverse("ItemStar") as GameComponent_PropItemStar;
                    ItemStar._SetStar(star);
                } else {
                    ShopItemComponent._SetConfig({ show_tips: false })
                }
            }


            let NavItemPanel = LocalExtremePropsList.GetChild(i);
            if (NavItemPanel) {
                NavItemPanel.SetHasClass("IsLock", type == 0);
                NavItemPanel.SetHasClass("Null", type != 1);
                NavItemPanel.SetHasClass("IsVip", is_vip);
                // 
                let LimitItem = NavItemPanel.FindChildTraverse("LimitItem") as GameComponent_PropItem;
                if (type == 1) {
                    // ItemPanel.SetDialogVariable("item_name", $.Localize(`#custom_shopitem_${data.item_key}`));
                    LimitItem._SetConfig({ item_id: item_key, rare: star + 1, show_tips: true, state: 1 });
                } else {
                    LimitItem._SetConfig({ show_tips: false, state: 0 })
                }
            }

        }
        
        let shop_list = data.shop_field_list.list;
        for (let k in shop_list) {
            let index = parseInt(k) - 1;
            let row_data = shop_list[k];
            let shop_key = row_data.key;
            // $.Msg(["shop_key",shop_key])
            if (shop_key == "null") { continue }
            // shop_sell_item_list.push(shop_key)
            let item_label = $.Localize(`#custom_shopitem_${row_data.key}`)
            let ShopItem = ShopItemList.GetChild(index)!;
            let is_vip = (local_vip < row_data.is_vip);
            let IsLimit = row_data.type == 2
            // $.Msg(["Item", row_data.type, row_data.rarity, item_label])
            // ShopItem.Data<PanelDataObject>().is_vip = is_vip
            ShopItem.SetHasClass("IsLimit", IsLimit);
            ShopItem.SetHasClass("IsVip", is_vip);
            ShopItem.SetHasClass("IsBuy", row_data.is_buy == 1);
            ShopItem.SetHasClass("IsLock", row_data.is_lock == 1);
            const is_enabled = row_data.is_lock == 0 && local_vip >= row_data.is_vip && row_data.is_buy == 0;
            ShopItem.SetHasClass("Enabled", is_enabled)
            ShopItem.SetDialogVariableInt("cost", row_data.soul);
            // ShopItem.SetDialogVariableInt("refresh_cost", row_data.refresh_soul);
            ShopItem.SetDialogVariable("item_name", $.Localize(`#custom_shopitem_${row_data.key}`));
            const ItemIcon = ShopItem.FindChildTraverse("ItemIcon") as ImagePanel;
            const ShopItemJson = MysteriousShopConfig[shop_key as keyof typeof MysteriousShopConfig];
            const ItemSrc = ShopItemJson ? GetTextureSrc(ShopItemJson.AbilityTextureName) : "";
            ItemIcon.SetImage(ItemSrc)
            const data_r = row_data.rarity
            let show_level = IsLimit ? data_r : 1
            let object_percent = 100;
            if (IsLimit) {
                object_percent = ShopItemJson.star_attr_pro[data_r - 1];
            }


            let item_desc = SetLabelDescriptionExtra(
                $.Localize(`#custom_shopitem_${row_data.key}_Description`),
                show_level,
                ShopItemJson.AbilityValues,
                ShopItemJson.ObjectValues,
                false,
                object_percent,
            )
            // $.Msg(["item_desc",item_desc])
            ShopItem.SetDialogVariable("item_desc", item_desc);


            const ShopItemCard = ShopItem.FindChildTraverse("ShopItemCard")!;
            ShopItemCard.enabled = row_data.is_buy == 0 && row_data.is_lock == 0 && !is_vip;
            ShopItemCard.Data<PanelDataObject>().item_key = row_data.key;

            const LockBtn = ShopItem.FindChildTraverse("LockBtn")!;
            LockBtn.enabled = row_data.is_buy == 0 && !is_vip;

            // 设置品质
            const rarity = row_data.type == 2 ? data_r + 1 : data_r
            for (let r = 1; r <= 7; r++) {
                ShopItem.SetHasClass("rare_" + r, rarity == r)
            }

            // 设置极限道具星级
            if (row_data.type == 2) {
                const LimitStar = ShopItem.FindChildTraverse("LimitStar") as GameComponent_PropItemStar;
                LimitStar._SetStar(data_r)
            }

            // 如果有相同的极限道具
            let same_index = has_limit_item.indexOf(row_data.key);
            ShopItem.SetHasClass("limit_up", same_index != -1)
        }

        //
        
    })

    GameEvents.Subscribe("MysticalShopSystem_GetPlayerShopBuyData", event => {

    })

    GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
        event_name: "GetPlayerShopBuyData",
        params: {}
    })
}


/**
 * 弹窗购物
 * @param item_order 
 */
export const OpenPopupsPurchaseItem = (item_order: number, item_key: string) => {
    // $.Msg(["OpenPopupsPurchaseItem", item_order]);
    PurchaseConfirm.Data<PanelDataObject>().index = item_order;
    PurchaseConfirm.AddClass("Show");
    PurchaseConfirm.SetDialogVariable("item_key", $.Localize(`#custom_shopitem_${item_key}`))

    const ShopItemJson = MysteriousShopConfig[item_key as keyof typeof MysteriousShopConfig];
    const ItemRarity = ShopItemJson.rarity;
    for (let r = 1; r <= 7; r++) {
        PurchaseConfirm.SetHasClass("rare_" + r, r == ItemRarity);

    }

    PopupModal.AddClass("Open");
    BtnConfirm.SetPanelEvent("onactivate", () => {
        ClosedPopups();
        GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
            event_name: "BuyItem",
            params: {
                index: item_order,
            }
        })
    })
}

export const ClosedPopups = () => {
    PopupModal.RemoveClass("Open");
    for (let i = 0; i < PopupModal.GetChildCount(); i++) {
        let RowPopups = PopupModal.GetChild(i)!;
        RowPopups.RemoveClass("Show")
    }
}
export const StartCountdownTimer = () => {
    UpdataCountdownTimer();
    $.Schedule(0.5, StartCountdownTimer)
}

export const UpdataCountdownTimer = () => {
    let dotatime = Game.GetDOTATime(false, false);
    let countdown_timer = MysticalShop.Data<PanelDataObject>().countdown_timer as number;
    let diff_timer = Math.floor(countdown_timer - dotatime);
    MysticalShop.SetDialogVariable("countdown_timer", `${diff_timer}`)
}

export const CreatePanel = () => {

    ExtremePropsList.RemoveAndDeleteChildren()
    for (let i = 0; i < 6; i++) {
        let extremePropsRows = $.CreatePanel("Panel", ExtremePropsList, "");
        extremePropsRows.BLoadLayoutSnippet("ExtremePropsRows")
        let ShopItemComponent = extremePropsRows.FindChildTraverse("ShopItemComponent")!
        let PropItem = LoadGameComponent(ShopItemComponent, "prop_item");
        PropItem._SetConfig({})
        let ItemStar = extremePropsRows.FindChildTraverse("ItemStar")!;
        let PropItemStar = LoadGameComponent(ItemStar, "prop_item_star");
        PropItemStar._Init(5, 1, 33)
        extremePropsRows.SetDialogVariable("item_name", "")
        extremePropsRows.SetHasClass("Null", true)
    }

    // 右侧极限道具列表
    LocalExtremePropsList.RemoveAndDeleteChildren()
    for (let i = 0; i < 6; i++) {
        let ExtremeProps = $.CreatePanel("Panel", LocalExtremePropsList, "");
        ExtremeProps.BLoadLayoutSnippet("NavLimitItem");
        const LimitItem = ExtremeProps.FindChildTraverse("LimitItem")!
        let PropItem = LoadGameComponent(LimitItem, "prop_item");
        PropItem._SetConfig({ state: 0 })
    }

    // let ToggleButton = $("#ToggleButton") as Button;
    // ToggleButton.SetPanelEvent("onactivate", () => {
    //     MysticalShop.ToggleClass("Open")
    // })

    let OpenButton = $("#OpenButton");
    OpenButton.SetPanelEvent("onactivate", () => {
        MysticalShop.ToggleClass("Open")
    })

    // 创建商店页面
    ShopItemList.RemoveAndDeleteChildren()
    for (let i = 0; i < SHOP_ITEM_COUNT; i++) {
        let ShopItem = $.CreatePanel("Button", ShopItemList, "");
        ShopItem.BLoadLayoutSnippet("ShopItem")
        ShopItem.SetDialogVariableInt("cost", 0);
        ShopItem.SetDialogVariableInt("refresh_cost", 0);
        const LockBtn = ShopItem.FindChildTraverse("LockBtn")!;
        LockBtn.SetPanelEvent("onactivate", () => {
            GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
                event_name: "ShopLock",
                params: {
                    index: i,
                }
            })
        })
        LockBtn.SetPanelEvent("onmouseover", () => {
            ShowCustomTextTooltip(LockBtn, "#custom_text_mystical_shop_lock")
        })

        LockBtn.SetPanelEvent("onmouseout", () => {
            HideCustomTooltip()
        })

        // const RefreshBtn = ShopItem.FindChildTraverse("RefreshBtn")!;
        // RefreshBtn.SetPanelEvent("onactivate", () => {
        //     GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
        //         event_name: "RefreshOneItemBySoul",
        //         params: {
        //             index: i,
        //         }
        //     })
        // })

        // RefreshBtn.SetPanelEvent("onmouseover", () => {
        //     RefreshBtn.SetHasClass("onmouse", true)
        //     ShowCustomTextTooltip(RefreshBtn, "#custom_text_mystical_shop_refresh")
        // })

        // RefreshBtn.SetPanelEvent("onmouseout", () => {
        //     RefreshBtn.SetHasClass("onmouse", false)
        //     HideCustomTooltip()
        // })

        const ShopItemCard = ShopItem.FindChildTraverse("ShopItemCard")!;
        ShopItemCard.SetPanelEvent("onactivate", () => {
            let item_key = ShopItemCard.Data<PanelDataObject>().item_key
            OpenPopupsPurchaseItem(i, item_key);
        })

        const LimitStar = ShopItem.FindChildTraverse("LimitStar")!
        const ItemStar = LoadGameComponent(LimitStar, "prop_item_star")
        ItemStar._Init(5, 0, 31);

    }

    // 弹窗按钮
    let BtnCancel = $("#BtnCancel") as Button;
    BtnCancel.SetPanelEvent("onactivate", () => {
        ClosedPopups();
    })

    // 准备按钮
    let ReadyBtn = $("#ReadyBtn") as Button;
    ReadyBtn.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
            event_name: "PlayerReady",
            params: {}
        })
    })

    // 刷新次数
    RefreshShopBtn.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
            event_name: "RefreshOneItemBySoul",
            params: {
                // index:1
            }
        })
    })
}

export const Init = () => {
    GameEventsSubscribeInit()
    CreatePanel();

    MysticalShop.Data<PanelDataObject>().countdown_timer = 0;
    StartCountdownTimer();

    $.Schedule(0.1, () => {
        GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
            event_name: "GetShopState",
            params: {}
        });

        GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
            event_name: "GetShopData",
            params: {}
        });
    })
}

(function () {
    Init()
})();