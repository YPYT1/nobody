export const MainPanel = $.GetContextPanel();
export let RoundGameStartTime = 0;
export let RoundGameDifficulty = "101"
export let GameSelectPhase = -1;
export const StartLoop = () => {
    UpdateTopInfoTime()
    $.Schedule(0.5, StartLoop)
}

export function FormatNumberToTime(time: number) {
    let min = Math.floor(time / 60);
    let sec_num = Math.floor(time % 60);
    let sec = sec_num < 10 ? `0${sec_num}` : `${sec_num}`;
    return [min, sec];
}

export const UpdateTopInfoTime = () => {
    if (GameSelectPhase <= 0) {
        MainPanel.SetDialogVariable("time_label", "REST");
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

    GameEvents.Subscribe("MapChapter_GetGameSelectPhase", event => {
        let data = event.data;
        GameSelectPhase = data.game_select_phase;
    });

    StartLoop();
}

(function () {
    Init()
})();