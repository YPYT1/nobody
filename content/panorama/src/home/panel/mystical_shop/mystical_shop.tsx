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
    $.Msg(["MysticalShopSystem_GetShopData"])
    let data = event.data;
    ShopItemList.RemoveAndDeleteChildren();

    for (let i = 0; i < 6; i++) {
        let ShopItem = $.CreatePanel("Button", ShopItemList, "");
        ShopItem.BLoadLayoutSnippet("ShopItem")
        ShopItem.SetDialogVariableInt("cost", 9999);
        const is_enabled = i < 4;
        ShopItem.enabled = is_enabled
        // ShopItem.SetHasClass("Vip", i > 3);
        ShopItem.SetDialogVariable("item_name","物品名字");
        ShopItem.SetDialogVariable("item_desc","物品的描述,总之很长很长的接口sad价款拉伸快点948阶段看来事件发送");

        const PurchaseBtn = ShopItem.FindChildTraverse("PurchaseBtn")!;
        PurchaseBtn.enabled = is_enabled;
    }

    let shop_field_list = data.shop_field_list;
    for (let k in shop_field_list) {
        let row_data = shop_field_list[k];
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