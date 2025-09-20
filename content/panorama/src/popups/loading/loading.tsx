const MainPanel = $.GetContextPanel();

let loading_ID = -1 as ScheduleID;
export const Init = () => {
    // GameUI.CustomUIConfig().EventBus.clear("popup_loading");
    GameUI.CustomUIConfig().EventBus.subscribe('popup_loading', event => {
        if (event.show == true) {
            MainPanel.SetHasClass('Show', event.show);
            $.CancelScheduled(loading_ID);
            loading_ID = $.Schedule(6, () => {
                MainPanel.SetHasClass('Show', false);
            });
        } else {
            $.CancelScheduled(loading_ID);
            MainPanel.SetHasClass('Show', false);
        }
    });

    GameEvents.Subscribe('ServiceInterface_PulbicLoadClose', event => {
        $.CancelScheduled(loading_ID);
        MainPanel.SetHasClass('Show', false);
    });

    if (Game.IsInToolsMode()) {
        MainPanel.SetPanelEvent('onactivate', () => {
            MainPanel.SetHasClass('Show', false);
        });
    }
};

(() => {
    Init();
})();
