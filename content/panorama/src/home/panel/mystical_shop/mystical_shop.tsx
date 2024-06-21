import { GetTextureSrc } from "../../../common/custom_kv_method";
import { default as MysteriousShopConfig } from "../../../json/config/game/shop/mysterious_shop_config.json";

let MainPanel = $.GetContextPanel();
let MysticalShop = $("#MysticalShop");
let ShopItemList = $("#ShopItemList");
let start_buy_state = 0;
let loop_state = false;

GameEvents.Subscribe("MysticalShopSystem_GetShopState", event => {
    let data = event.data;
    start_buy_state = data.start_buy_state;

    // 页面显示
    MainPanel.SetHasClass("Show", start_buy_state == 1);
    // 结束倒计时
    MysticalShop.Data<PanelDataObject>().countdown_timer = data.countdown_timer;

    // 更新玩家状态
})

GameEvents.Subscribe("MysticalShopSystem_GetShopData", event => {
    // $.Msg(["MysticalShopSystem_GetShopData"])
    let data = event.data;
    const local_vip = 0;//data.player_vip_status;
    // ShopItemList.RemoveAndDeleteChildren();
    let shop_field_list = data.shop_field_list;
    for (let k in shop_field_list) {
        let index = parseInt(k) - 1;
        let row_data = shop_field_list[k];
        let shop_key = row_data.key
        let ShopItem = ShopItemList.GetChild(index)!;
        // ShopItem.BLoadLayoutSnippet("ShopItem")
        ShopItem.SetHasClass("IsVip", row_data.is_vip == 1);
        ShopItem.SetHasClass("IsBuy", row_data.is_buy == 1);
        ShopItem.SetHasClass("IsLock", row_data.is_lock == 1);

        ShopItem.SetDialogVariableInt("cost", row_data.soul);
        ShopItem.SetDialogVariableInt("refresh_cost", row_data.refresh_soul);
        ShopItem.SetDialogVariable("item_name", row_data.key);
        ShopItem.SetDialogVariable("item_desc", row_data.key);

        const is_enabled = row_data.is_lock == 0 && local_vip >= row_data.is_vip && row_data.is_buy == 0;
        // ShopItem.enabled = is_enabled
        const ItemIcon = ShopItem.FindChildTraverse("ItemIcon") as ImagePanel;
        const ShopItemJson = MysteriousShopConfig[shop_key as keyof typeof MysteriousShopConfig];
        // $.Msg(["ShopItemJson",ShopItemJson])
        const ItemSrc = ShopItemJson ? GetTextureSrc(ShopItemJson.AbilityTextureName) : "";
        ItemIcon.SetImage(ItemSrc)
        const PurchaseBtn = ShopItem.FindChildTraverse("PurchaseBtn")!;
        PurchaseBtn.enabled = is_enabled;
        PurchaseBtn.SetPanelEvent("onactivate", () => {
            GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
                event_name: "BuyItem",
                params: {
                    index: parseInt(k) - 1,
                }
            })
        })

        const RefreshBtn = ShopItem.FindChildTraverse("RefreshBtn")!;
        // RefreshBtn.enabled = row_data.is_buy == 1;
        RefreshBtn.SetPanelEvent("onactivate", () => {
            GameEvents.SendCustomGameEventToServer("MysticalShopSystem", {
                event_name: "RefreshOneItemBySoul",
                params: {
                    index: parseInt(k) - 1,
                }
            })
        })

    }

})

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

    let ToggleButton = $("#ToggleButton") as Button;
    ToggleButton.SetPanelEvent("onactivate", () => {
        MysticalShop.ToggleClass("Open")
    })

    let OpenButton = $("#OpenButton");
    OpenButton.SetPanelEvent("onactivate", () => {
        MysticalShop.AddClass("Open")
    })

    // 创建商店页面
    ShopItemList.RemoveAndDeleteChildren()
    for (let i = 0; i < 6; i++) {
        let ShopItem = $.CreatePanel("Button", ShopItemList, "");
        ShopItem.BLoadLayoutSnippet("ShopItem")
        ShopItem.SetDialogVariableInt("cost", 0);
        ShopItem.SetDialogVariableInt("refresh_cost", 0);
        // ShopItem.SetDialogVariable("item_name", "");
        // ShopItem.SetDialogVariable("item_desc", "");
    }
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