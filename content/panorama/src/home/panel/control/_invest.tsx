const InvestLevel = $('#InvestLevel') as Button;
const InvestTooltips = $('#InvestTooltips');

export function Init() {
    InvestLevel.SetDialogVariableInt('invest_level', 0);
    InvestTooltips.SetDialogVariableInt('level', 0);
    InvestTooltips.SetDialogVariableInt('count', 0);

    InvestLevel.SetPanelEvent('onmouseover', () => {
        InvestTooltips.SetHasClass('Show', true);
    });

    InvestLevel.SetPanelEvent('onmouseout', () => {
        InvestTooltips.SetHasClass('Show', false);
    });

    GameEvents.Subscribe('InvestSystem_GetPlayerInvestData', event => {
        // $.Msg("InvestSystem_GetPlayerInvestData")
        const data = event.data;
        const PlayerInvestLevel = data.PlayerInvestLevel;
        const ResourceCount = data.ResourceCount;
        InvestLevel.SetDialogVariableInt('invest_level', PlayerInvestLevel);
        InvestTooltips.SetDialogVariableInt('level', PlayerInvestLevel);
        InvestTooltips.SetDialogVariableInt('count', ResourceCount);
    });

    GameEvents.SendCustomGameEventToServer('InvestSystem', {
        event_name: 'GetPlayerInvestData',
        params: {},
    });
}

(function () {
    Init();
})();
