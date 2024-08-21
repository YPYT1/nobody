
const player_id = Players.GetLocalPlayer();
const NpcInteract_GameRestart = $("#NpcInteract_GameRestart");
const GameRestartVote = $("#GameRestartVote")


const InitPanel = () => {
    SetPanel_GameRestartVote()
    SetPanel_NpcInteract_GameRestart();
}

const SetPanel_GameRestartVote = () => {
    // GameRestartVote
    GameRestartVote.RemoveAndDeleteChildren();
    GameRestartVote.BLoadLayoutSnippet("ConfirmWindow");
    GameRestartVote.AddClass("CountdownTimer");
    GameRestartVote.SetDialogVariable("timer", "99");
    GameRestartVote.SetDialogVariable("btn_text_confirm", "是");
    GameRestartVote.SetDialogVariable("btn_text_cancel", "否");
    GameRestartVote.SetDialogVariable("confirm_title", `是否开始新的游戏`);
    let BtnConfirm = GameRestartVote.FindChildTraverse("BtnConfirm") as Button;
    let BtnCancel = GameRestartVote.FindChildTraverse("BtnCancel") as Button;
    BtnConfirm.SetPanelEvent("onactivate", () => {
        GameRestartVote.RemoveClass("Show");
        GameEvents.SendCustomGameEventToServer("MapChapter", {
            event_name: "PlayerVote",
            params: {
                vote: 1,
            }
        })
    })

    BtnCancel.SetPanelEvent("onactivate", () => {
        GameRestartVote.RemoveClass("Show");
        GameEvents.SendCustomGameEventToServer("MapChapter", {
            event_name: "PlayerVote",
            params: {
                vote: 0,
            }
        })
    })
}

const GameRestartVoteTimer = () => {
    let game_time = Game.GetDOTATime(false, false);
    let vote_time = GameRestartVote.Data<PanelDataObject>().time as number;
    let time_diff = Math.floor(vote_time - game_time);
    GameRestartVote.SetDialogVariable("timer", `${time_diff}`);
    // $.Msg(["game_time", game_time, "vote_time", vote_time])
    if (time_diff > 0) {
        $.Schedule(0.5, GameRestartVoteTimer)
    }

}
const SetPanel_NpcInteract_GameRestart = () => {
    // NpcInteract_GameRestart
    NpcInteract_GameRestart.RemoveAndDeleteChildren();
    // NpcInteract_GameRestart.SetHasClass("IsHost", player_id == 0);
    NpcInteract_GameRestart.BLoadLayoutSnippet("ConfirmWindow");
    NpcInteract_GameRestart.SetDialogVariable("confirm_title", `投票开启新游戏`);
    NpcInteract_GameRestart.SetDialogVariable("btn_text_confirm", "是");
    NpcInteract_GameRestart.SetDialogVariable("btn_text_cancel", "否");
    let BtnConfirm = NpcInteract_GameRestart.FindChildTraverse("BtnConfirm") as Button;
    let BtnCancel = NpcInteract_GameRestart.FindChildTraverse("BtnCancel") as Button;

    BtnConfirm.SetPanelEvent("onactivate", () => {
        NpcInteract_GameRestart.RemoveClass("Show");
        GameEvents.SendCustomGameEventToServer("MapChapter", {
            event_name: "OpenReopenVote",
            params: {}
        })
    })

    BtnCancel.SetPanelEvent("onactivate", () => {
        NpcInteract_GameRestart.RemoveClass("Show");
    })
}
const UpdateSelectUnit = () => {
    let queryUnit = Players.GetLocalPlayerPortraitUnit();
    let unit_name = Entities.GetUnitName(queryUnit)

    NpcInteract_GameRestart.SetHasClass("Show", unit_name == "npc_interact_game_restart" && player_id == 0)

}

const CustomGameEventsSubscribe = () => {

    GameEvents.Subscribe('MapChapter_GetPlayerVoteData', event => {
        // $.Msg(["MapChapter_GetPlayerVoteData", event])
        let vote_data = event.data.vote_data;
        let state = vote_data.state;
        let playervote = Object.values(vote_data.playervote);
        let localPlayerState = playervote[player_id] == -1
        // $.Msg([state == 1, localPlayerState])
        NpcInteract_GameRestart.SetHasClass("VoteState", state == 1)
        if (state == 1 && localPlayerState) {
            GameRestartVote.AddClass("Show");
            GameRestartVote.Data<PanelDataObject>().time = vote_data.vote_time;
            GameRestartVoteTimer()
        } else {
            GameRestartVote.RemoveClass("Show");
        }
    })
}
export const Init = () => {

    InitPanel()
    CustomGameEventsSubscribe();
    GameEvents.Subscribe("dota_player_update_selected_unit", UpdateSelectUnit);
    GameEvents.Subscribe("dota_player_update_query_unit", UpdateSelectUnit);
    // GameEvents.Subscribe("dotapupda", UpdateSelectUnit);

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetPlayerVoteData",
        params: {}
    })
}

(function () {
    Init()
})();