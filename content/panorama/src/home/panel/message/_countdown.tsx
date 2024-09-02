const TopCountdownMessage = $("#TopCountdownMessage");


const StartCountdownTimer = () => {
    if (Game.IsGamePaused()) {
        $.Schedule(0.1, StartCountdownTimer)
        return
    }
    const e = TopCountdownMessage;
    let dotatime = Game.GetDOTATime(false, false);
    let end_timer = TopCountdownMessage.Data<PanelDataObject>().end_timer
    // $.Msg(["", dotatime, end_timer])
    TopCountdownMessage.SetHasClass("Show", end_timer > dotatime);
    let diff_timer = Math.ceil(end_timer - dotatime);
    TopCountdownMessage.SetDialogVariable("timer_label", "" + diff_timer);
    let old_timer = TopCountdownMessage.Data<PanelDataObject>().timer;
    TopCountdownMessage.Data<PanelDataObject>().timer = diff_timer;
    // $.Msg([old_timer != diff_timer])
    if (old_timer != diff_timer) {
        // 变化数字
        e.RemoveClass("fade_out")
        e.AddClass("fade_in");
        $.Schedule(0.7, () => {
            e.RemoveClass("fade_in")
            e.AddClass("fade_out")
        })
    }



    e.SetHasClass("Show", end_timer > dotatime)
    if (end_timer > dotatime) {
        $.Schedule(1, StartCountdownTimer)
    }

}

const CMsg_TopCountdown = (params: CustomGameEventDeclarations["CMsg_TopCountdown"]) => {
    let data = params.data;
    let end_timer = data;
    TopCountdownMessage.Data<PanelDataObject>().end_timer = end_timer;
    StartCountdownTimer();
}

(function () {
    TopCountdownMessage.Data<PanelDataObject>().end_timer = Game.GetDOTATime(false, false) + 5;
    TopCountdownMessage.Data<PanelDataObject>().timer = 0
    StartCountdownTimer()
    GameEvents.Subscribe('CMsg_TopCountdown', CMsg_TopCountdown);

    GameEvents.SendCustomGameEventToServer("CMsg", {
        event_name: "GetTopCountdown",
        params: {}
    })
})();
