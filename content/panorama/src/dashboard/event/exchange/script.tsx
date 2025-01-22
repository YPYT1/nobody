
const GiftCode = $("#GiftCode") as TextEntry;
const GiftCodeBtn = $("#GiftCodeBtn")

export function Init() {


    GiftCodeBtn.SetPanelEvent("onactivate", () => {
        let code = GiftCode.text;
        GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: true })
        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "GameDhm",
            params: {
                key: code
            }
        })
    })
}

(() => {
    Init();
})();