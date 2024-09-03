import { FormatIntToString, PlayerIdToARGB } from "../../../utils/method";

const PlayerList = $("#PlayerList");

export const Init = () => {
    Create_Scoreboard(4)
    CustomSubscribe();
    StartThinkerLoop();

    GameEvents.SendCustomGameEventToServer("GameInformation", {
        event_name: "GetPlayerDieData",
        params: {}
    })

    // 要删除
    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetPlayerVoteData",
        params: {}
    })

    GameEvents.Subscribe("player_connect", event => {
        $.Msg(["player_connect", event])
    })

    GameEvents.Subscribe("player_disconnect", event => {
        $.Msg(["player_disconnect", event])
        //
    })

    GameEvents.SendCustomGameEventToServer("CMsg",{
        event_name:"GetDamageRecord",
        params:{}
    })
}

const StartThinkerLoop = () => {
    UpdateScoreBoard()
    $.Schedule(0.5, StartThinkerLoop)
}

const UpdateScoreBoard = () => {
    let dota_time = Game.GetDOTATime(false, false);
    for (let i = 0; i < PlayerList.GetChildCount(); i++) {
        let PlayerScoreBoard = PlayerList.GetChild(i);
        if (PlayerScoreBoard) {
            let revive_time = PlayerScoreBoard.Data<PanelDataObject>().revive_time ?? 0;
            let last_time = Math.floor(revive_time - dota_time);
            if (last_time > 0) {
                PlayerScoreBoard.SetHasClass("is_death", true);
                PlayerScoreBoard.SetDialogVariable("revive_timer", `${last_time}`)
            } else {
                PlayerScoreBoard.SetHasClass("is_death", false)
            }
        }
    }
}

const Create_Scoreboard = (count: number) => {
    // let current_count: number = PlayerList.Data<PanelDataObject>().current_count
    // if (count == current_count) { return }
    PlayerList.Data<PanelDataObject>().current_count = count;
    PlayerList.RemoveAndDeleteChildren()
    let player_count = Game.GetAllPlayerIDs();
    for (let player_id of player_count) {
        let playerInfo = Game.GetPlayerInfo(player_id);
        let PlayerScoreBoard = $.CreatePanel("Panel", PlayerList, `${player_id}`)
        PlayerScoreBoard.BLoadLayoutSnippet("PlayerScoreBoard");
        let AvatarImage = PlayerScoreBoard.FindChildTraverse("AvatarImage") as AvatarImage;
        AvatarImage.steamid = playerInfo.player_steamid
        PlayerScoreBoard.SetDialogVariable("player_name", playerInfo.player_name);
        PlayerScoreBoard.Data<PanelDataObject>().revive_time = 0;
        PlayerScoreBoard.SetDialogVariable("damage_record_label", "0");
        let DamageRecordBar = PlayerScoreBoard.FindChildTraverse("DamageRecordBar")!;
        let player_color = PlayerIdToARGB(Players.GetPlayerColor(player_id));
        DamageRecordBar.style.washColor = "#" + player_color;
        let connect = playerInfo.player_connection_state;
    }
}

const UpdateScoreBoardPlayers = () => {

}
const CustomSubscribe = () => {

    GameEvents.Subscribe("MapChapter_GetGameSelectPhase", event => {
        // $.Msg(["MapChapter_GetGameSelectPhase", event])
    })

    GameEvents.Subscribe("GameInformation_GetPlayerDieData", event => {
        let data = event.data;
        let time_list = Object.values(data.time);
        for (let i = 0; i < time_list.length; i++) {
            let PlayerScoreBoard = PlayerList.GetChild(i);
            if (PlayerScoreBoard) {
                PlayerScoreBoard.Data<PanelDataObject>().revive_time = time_list[i];
            }
        }
    })


    GameEvents.Subscribe("MapChapter_GetPlayerVoteData", event => {
        // $.Msg(["MapChapter_GetPlayerVoteData", event])
        let state = event.data.vote_data.state;
        PlayerList.SetHasClass("ShowState", state == 1)
        if (state == 1) {
            let playervote = Object.values(event.data.vote_data.playervote);
            for (let i = 0; i < playervote.length; i++) {
                let PlayerScoreBoard = PlayerList.GetChild(i);
                if (PlayerScoreBoard) {
                    PlayerScoreBoard.SetHasClass("Waiting", playervote[i] == -1)
                    PlayerScoreBoard.SetHasClass("Cancel", playervote[i] == 0)
                    PlayerScoreBoard.SetHasClass("Confirm", playervote[i] == 1)
                }
            }
        }
    })

    GameEvents.Subscribe("MapChapter_NewPlay", event => {
        let data = event.data;
        let count = data.count;
        // Create_Scoreboard(count)
    })

    GameEvents.Subscribe("CMsg_GetDamageRecord", event => {
        let dmg_record = Object.values(event.data.dmg_record);
        // $.Msg(["dmg_record",dmg_record])
        let total_damage = dmg_record.reduce((total, num) => total + num) + 1;
        for (let i = 0; i < PlayerList.GetChildCount(); i++) {
            let PlayerScoreBoard = PlayerList.GetChild(i);
            if (PlayerScoreBoard) {
                let damage_label = FormatIntToString(dmg_record[i])
                PlayerScoreBoard.SetDialogVariable("damage_record_label", damage_label);
                const DamageRecordBar = PlayerScoreBoard.FindChildTraverse("DamageRecordBar")!;
                DamageRecordBar.style.width = Math.floor(100 * dmg_record[i] / total_damage) + "%";
            }
        }
    })
}

(function () {
    $.Msg("scoreboard Init")
    Init()
})();
