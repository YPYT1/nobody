const MainPanel = $.GetContextPanel();

export const Init = ()=>{
    MainPanel.SetPanelEvent("onactivate",()=>{
        $.Msg(["onactivate"])
    })
}

(function () {
    Init()
})();