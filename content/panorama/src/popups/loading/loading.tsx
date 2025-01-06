
const MainPanel = $.GetContextPanel();

export const Init = () => {

    // GameUI.CustomUIConfig().EventBus.clear("popup_loading");
    GameUI.CustomUIConfig().EventBus.subscribe("popup_loading", event => {
        MainPanel.SetHasClass("Show", event.show)
    })

    GameEvents.Subscribe("ServiceInterface_PulbicLoadClose", event => {
        // $.Msg(["ServiceInterface_PulbicLoadClose"])
        MainPanel.SetHasClass("Show", false)
    })

    if (Game.IsInToolsMode()) {
        MainPanel.SetPanelEvent("onactivate", () => {
            MainPanel.SetHasClass("Show", false)
        })
    }

}

(() => {
    Init()
})();