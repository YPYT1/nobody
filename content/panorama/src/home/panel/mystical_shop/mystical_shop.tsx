let MainPanel = $.GetContextPanel();
let start_buy_state = 0;
let loop_state = false;
GameEvents.Subscribe("MysticalShopSystem_GetShopState", event => {
    let data = event.data;
    start_buy_state = data.start_buy_state;

    // 页面显示
    MainPanel.SetHasClass("Show", start_buy_state == 1);
    // 结束倒计时
    MainPanel.Data<PanelDataObject>().countdown_timer = data.countdown_timer;

    // 更新玩家状态
})

GameEvents.Subscribe("MysticalShopSystem_GetShopData", event => {
    $.Msg(["MysticalShopSystem_GetShopData", event])
    let data = event.data;

})

const StartCountdownTimer = () => {
    UpdataCountdownTimer();
    $.Schedule(0.5, StartCountdownTimer)
}

const UpdataCountdownTimer = () => {
    let dotatime = Game.GetDOTATime(false, false);
    let countdown_timer = MainPanel.Data<PanelDataObject>().countdown_timer as number;
    let diff_timer = Math.floor(countdown_timer - dotatime);
    MainPanel.SetDialogVariable("countdown_timer", `${diff_timer}`)
}

export const Init = () => {

    MainPanel.Data<PanelDataObject>().countdown_timer = 0;
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