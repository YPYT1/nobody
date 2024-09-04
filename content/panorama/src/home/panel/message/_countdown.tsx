const TopCountdownMessage = $("#TopCountdownMessage");


const StartCountdownTimer = () => {
    // if (Game.IsGamePaused()) {
    //     $.Schedule(0.1, StartCountdownTimer)
    //     return
    // }
    const e = TopCountdownMessage;
    let dotatime = Game.GetDOTATime(false, false) + 0.01;
    let end_timer = TopCountdownMessage.Data<PanelDataObject>().end_timer
    // $.Msg(["", end_timer, dotatime])
    TopCountdownMessage.SetHasClass("Show", dotatime < end_timer);
    let diff_timer = Math.ceil(end_timer - dotatime);
    // $.Msg(["diff_timer", diff_timer, end_timer - dotatime])
    TopCountdownMessage.SetDialogVariable("timer_label", "" + diff_timer);

    TopCountdownMessage.SetHasClass("timer_1", diff_timer == 1);
    TopCountdownMessage.SetHasClass("timer_2", diff_timer == 2);
    TopCountdownMessage.SetHasClass("timer_3", diff_timer == 3);
    let old_timer = TopCountdownMessage.Data<PanelDataObject>().timer;
    TopCountdownMessage.Data<PanelDataObject>().timer = diff_timer;
    // $.Msg([old_timer != diff_timer])
    // e.RemoveClass("Play")
    if (old_timer != diff_timer) {
        // 变化数字
        // e.AddClass("Play")
        e.RemoveClass("fade_out")
        e.AddClass("fade_in");
        $.Schedule(0.7, () => {
            e.RemoveClass("fade_in")
            e.AddClass("fade_out")
        })
    }




    if (dotatime < end_timer) {
        $.Schedule(1, StartCountdownTimer)
    }

    // $.Msg(["StartCountdownTimer"])
}

const CMsg_TopCountdown = (params: CustomGameEventDeclarations["CMsg_TopCountdown"]) => {
    // $.Msg(["CMsg_TopCountdown", params])
    let data = params.data;
    let end_timer = data.end_timer;
    TopCountdownMessage.Data<PanelDataObject>().end_timer = end_timer;
    StartCountdownTimer();
}

(function () {
    // TopCountdownMessage.Data<PanelDataObject>().end_timer = -1;
    // TopCountdownMessage.Data<PanelDataObject>().timer = 0
    // StartCountdownTimer()
    GameEvents.Subscribe('CMsg_TopCountdown', CMsg_TopCountdown);

    GameEvents.SendCustomGameEventToServer("CMsg", {
        event_name: "GetTopCountdown",
        params: {}
    })
})();
