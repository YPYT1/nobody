
const MainPanel = $.GetContextPanel();

export const Init = () => {

    GameUI.CustomUIConfig().EventBus.subscribe("popup_loading", event => {
        MainPanel.SetHasClass("Show", true)
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