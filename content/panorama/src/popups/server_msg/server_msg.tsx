
const MainPanel = $.GetContextPanel();
const ConfirmButton = $("#ConfirmButton");

export const Init = () => {

    GameEvents.Subscribe("CMsg_SendServerMsgToPlayer", SendServerMsgToPlayer)

    ConfirmButton.SetPanelEvent("onactivate", () => {
        MainPanel.SetHasClass("Show", false)
    })


    // SendServerMsgToPlayer({
    //     code: 200,
    //     message: "tes111t",
    //     type: 1,
    // })
}

function SendServerMsgToPlayer(event: NetworkedData<CustomGameEventDeclarations["CMsg_SendServerMsgToPlayer"]>) {
    GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: false })
    if (event.type == 1) {
        // 弹窗
        MainPanel.SetHasClass("Show", true);
        MainPanel.SetDialogVariableInt("code", event.code);
        MainPanel.SetDialogVariable("message", event.message);
    } else {
        // 默认消息
        let eventData = { reason: 80, message: event.message, sequenceNumber: 0 };
        GameEvents.SendEventClientSide("dota_hud_error_message", eventData);
    }
}

(() => {
    Init()
})();