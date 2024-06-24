import { GetTextureSrc } from "../../../common/custom_kv_method";
import { default as MysteriousShopConfig } from "../../../json/config/game/shop/mysterious_shop_config.json";

const localPlayer = Game.GetLocalPlayerID();
const SHOP_ITEM_COUNT = 6;
let MainPanel = $.GetContextPanel();
let MysticalShop = $("#MysticalShop");
let ShopItemList = $("#ShopItemList");
let start_buy_state = 0;
let loop_state = false;
let PopupModal = $("#PopupModal");
let PurchaseConfirm = $("#PurchaseConfirm")
let BtnConfirm = $("#BtnConfirm") as Button;

GameEvents.Subscribe("MysticalShopSystem_GetShopState", event => {
    let data = event.data;
    start_buy_state = data.start_buy_state;
    // $.Msg(["data", data])
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
    // @TODO 准备之后无法购买、无法刷新。但可以锁定\取消锁定。

    // if (is_ready) {
    //     for (let i = 0; i < SHOP_ITEM_COUNT; i++) {
    //         let ShopItem = ShopItemList.GetChild(i)!;
    //         const RefreshBtn = ShopItem.FindChildTraverse("RefreshBtn")!;
    //         RefreshBtn.enabled = false;
    //         const ShopItemCard = ShopItem.FindChildTraverse("ShopItemCard")!;
    //         ShopItemCard.enabled = false;
    //         const is_vip = ShopItem.BHasClass("IsVip")
    //         const is_lock = ShopItem.BHasClass("IsLock")
    //         const LockBtn = ShopItem.FindChildTraverse("LockBtn")!;
    //         LockBtn.enabled
    //     }
    // }

})

GameEvents.Subscribe("MysticalShopSystem_GetShopData", event => {
    let data = event.data;
    // $.Msg(["MysticalShopSystem_GetShopData", data])
    const local_vip = 0;// data.player_vip_status;
    // ShopItemList.RemoveAndDeleteChildren();
    let shop_field_list = data.shop_field_list;
    for (let k in shop_field_list) {
        let index = parseInt(k) - 1;
        let row_data = shop_field_list[k];
        // $.Msg(["row_data", row_data])
        let shop_key = row_data.key
        let ShopItem = ShopItemList.GetChild(index)!;
        // ShopItem.BLoadLayoutSnippet("ShopItem")
        let is_vip = (local_vip < row_data.is_vip);
        ShopItem.Data<PanelDataObject>().is_vip = is_vip
        // ShopItem.Data<PanelDataObject>().is_buy = vip_row_data.is_buy == 1lock
        ShopItem.SetHasClass("IsVip", is_vip);
        ShopItem.SetHasClass("IsBuy", row_data.is_buy == 1);
        ShopItem.SetHasClass("IsLock", row_data.is_lock == 1);
        const is_enabled = row_data.is_lock == 0 && local_vip >= row_data.is_vip && row_data.is_buy == 0;
        ShopItem.SetHasClass("Enabled", is_enabled)

        ShopItem.SetDialogVariableInt("cost", row_data.soul);
        ShopItem.SetDialogVariableInt("refresh_cost", row_data.refresh_soul);
        ShopItem.SetDialogVariable("item_name", row_data.key);
        ShopItem.SetDialogVariable("item_desc", row_data.key);



        const ItemIcon = ShopItem.FindChildTraverse("ItemIcon") as ImagePanel;
        const ShopItemJson = MysteriousShopConfig[shop_key as keyof typeof MysteriousShopConfig];
        const ItemSrc = ShopItemJson ? GetTextureSrc(ShopItemJson.AbilityTextureName) : "";
        ItemIcon.SetImage(ItemSrc)

        const ShopItemCard = ShopItem.FindChildTraverse("ShopItemCard")!;
        ShopItemCard.enabled = row_data.is_buy == 0 && row_data.is_lock == 0 && !is_vip;

        const LockBtn = ShopItem.FindChildTraverse("LockBtn")!;
        LockBtn.enabled = row_data.is_buy == 0 && !is_vip;

        const RefreshBtn = ShopItem.FindChildTraverse("RefreshBtn")!;
        RefreshBtn.enabled = row_data.is_lock == 0 && !is_vip;
    }

})

/**
 * 弹窗购物
 * @param item_order 
 */
export const OpenPopupsPurchaseItem = (item_order: number, item_key?: string) => {
    // $.Msg(["OpenPopupsPurchaseItem", item_order]);
    PurchaseConfirm.Data<PanelDataObject>().index = item_order;
    // PurchaseConfirm.SetDialogVariable("item_key", item_key);
    PurchaseConfirm.AddClass("Show");
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
        // ShopItem.SetDialogVariable("item_name", "");
        // ShopItem.SetDialogVariable("item_desc", "");
        const LockBtn = ShopItem.FindChildTraverse("LockBtn")!;
        LockBtn.SetPanelEvent("onactivate", () => {
            GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
                event_name: "ShopLock",
                params: {
                    index: i,
                }
            })
        })

        const RefreshBtn = ShopItem.FindChildTraverse("RefreshBtn")!;
        RefreshBtn.SetPanelEvent("onactivate", () => {
            GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
                event_name: "RefreshOneItemBySoul",
                params: {
                    index: i,
                }
            })
        })

        const ShopItemCard = ShopItem.FindChildTraverse("ShopItemCard")!;
        ShopItemCard.SetPanelEvent("onactivate", () => {
            OpenPopupsPurchaseItem(i);
        })
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
}

export const Init = () => {
    CreatePanel();
    MysticalShop.Data<PanelDataObject>().countdown_timer = 0;
    GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
        event_name: "GetShopState",
        params: {}
    });

    GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
        event_name: "GetShopData",
        params: {}
    });

    StartCountdownTimer();
}

(function () {
    Init()
})();