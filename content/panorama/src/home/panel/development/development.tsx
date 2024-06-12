
/** 开发模块,开发模式下才会显示的一些信息 */
export const MainPanel = $.GetContextPanel();

export function FormatNumberToTime(time: number) {
    let min = Math.floor(time / 60);
    let sec_num = Math.floor(time % 60);
    let sec = sec_num < 10 ? `0${sec_num}` : `${sec_num}`;
    return [min, sec];
}

export const StartLoop = () => {
    UpdateTopInfoTime()
    $.Schedule(0.5, StartLoop)
}

export const UpdateTopInfoTime = () => {
    let DotaGameTime = Game.GetDOTATime(false, false);
    let TimeLabel = FormatNumberToTime(DotaGameTime);
    MainPanel.SetDialogVariable("dota_time", TimeLabel.join(":"));
}

export const Initialize = () => {
    MainPanel.SetDialogVariable("dota_time", "0");
    GameEvents.Subscribe("MapChapter_GetGameSelectPhase", event => {
        let data = event.data;
        let game_select_phase = data.game_select_phase;
        MainPanel.SetDialogVariableInt("game_phase", data.game_select_phase)
    })
    StartLoop();
}

(function () {
    Initialize();
})();

