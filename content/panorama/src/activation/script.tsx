const MainPanel = $.GetContextPanel();
const InputCode = $("#InputCode") as TextEntry;
const CodeInputBtn = $("#CodeInputBtn") as Button;


export const Init = () => {
    const playerInfo = Game.GetPlayerInfo(Players.GetLocalPlayer())
    MainPanel.SetHasClass("IsHost", playerInfo.player_has_host_privileges)


    CodeInputBtn.SetPanelEvent("onactivate", () => {
        CodeInputBtn.enabled = false
        let code = InputCode.text.replaceAll("\"", "").replaceAll(" ", "").replaceAll("'", "").trim();
        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "PlyaerGameActivate",
            params: {
                key: code
            }
        })
    })



    GameEvents.Subscribe("ServiceInterface_GetGameActivate", event => {
        let data = event.data;
        // $.Msg(["Data", data])
        let Activate = data.Activate;
        if (Activate == 0) {
            $.Schedule(1, () => { CodeInputBtn.enabled = true })
        } else if (Activate == 1) {
            // $.Msg(["add ok"])
            MainPanel.AddClass("ok")
        }
    })

    $.Schedule(0.1, () => {
        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "GetGameActivate",
            params: {}
        })
    })

}

(() => {
    Init();
})();