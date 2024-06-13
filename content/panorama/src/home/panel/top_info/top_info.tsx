const MainPanel = $.GetContextPanel();

let RoundGameStartTime = 0;
let RoundGameDifficulty = "101"
// let GameSelectPhase = -1;

const StartLoop = () => {
    UpdateTopInfoTime()
    $.Schedule(0.5, StartLoop)
}

function FormatNumberToTime(time: number) {
    let min = Math.floor(time / 60);
    let sec_num = Math.floor(time % 60);
    let sec = sec_num < 10 ? `0${sec_num}` : `${sec_num}`;
    return [min, sec];
}

const UpdateTopInfoTime = () => {
    let GameSelectPhase = MainPanel.Data<PanelDataObject>().GameSelectPhase as number;

    if (GameSelectPhase <= 2) {
        MainPanel.SetDialogVariable("stage", "rest");
        MainPanel.SetDialogVariable("time_label", "-");
        return
    } else if (GameSelectPhase == 999) {
        return
    }
    let DotaGameTime = Game.GetDOTATime(false, false);
    let RoundGameTime = DotaGameTime - RoundGameStartTime;
    let TimeLabel = FormatNumberToTime(RoundGameTime);
    MainPanel.SetDialogVariable("time_label", TimeLabel.join(":"));
}

export const Init = () => {
    MainPanel.Data<PanelDataObject>().timer_loop = false;
    MainPanel.Data<PanelDataObject>().GameSelectPhase = -1;
    MainPanel.SetDialogVariable("stage", "101");
    MainPanel.SetDialogVariableInt("life", 0);
    MainPanel.SetDialogVariable("time_label", "0:0");

    GameEvents.Subscribe("GameInformation_GetPlayGameHeadData", event => {
        let data = event.data;
        RoundGameStartTime = data.time;
        RoundGameDifficulty = data.difficulty;
        MainPanel.SetDialogVariable("stage", RoundGameDifficulty);
    });

    GameEvents.SendCustomGameEventToServer("GameInformation", {
        event_name: "GetPlayGameHeadData",
        params: {}
    });

    // GameEvents.Subscribe("MapChapter_GetGameSelectPhase", event => {
    //     $.Msg(["MapChapter_GetGameSelectPhase"])
    //     let data = event.data;
    //     GameSelectPhase = data.game_select_phase;
    // });

    $.Schedule(1, () => {
        MainPanel.Data<PanelDataObject>().timer_loop = true;
        StartLoop();
    })

}

(function () {

    Init()
})();