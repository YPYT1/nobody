
const InvestLevel = $("#InvestLevel") as Button;
const InvestTooltips = $("#InvestTooltips");

export function Init() {
    InvestLevel.SetDialogVariableInt("invest_level", 0);
    InvestTooltips.SetDialogVariableInt("level", 0);
    InvestTooltips.SetDialogVariableInt("count", 0);

    InvestLevel.SetPanelEvent("onmouseover", () => {
        InvestTooltips.SetHasClass("Show", true)
    })

    InvestLevel.SetPanelEvent("onmouseout", () => {
        InvestTooltips.SetHasClass("Show", false)
    })

    GameEvents.Subscribe("InvestSystem_GetPlayerInvestData", event => {
        // $.Msg("InvestSystem_GetPlayerInvestData")
        let data = event.data;
        let PlayerInvestLevel = data.PlayerInvestLevel;
        let ResourceCount = data.ResourceCount;

        InvestLevel.SetDialogVariableInt("invest_level", PlayerInvestLevel);


        InvestTooltips.SetDialogVariableInt("level", PlayerInvestLevel);
        InvestTooltips.SetDialogVariableInt("count", ResourceCount);

    })


    GameEvents.Subscribe("HeroTalentSystem_ResetHeroTalent", event => {
        InvestLevel.SetDialogVariableInt("invest_level", 0);
        InvestTooltips.SetDialogVariableInt("level", 0);
        InvestTooltips.SetDialogVariableInt("count", 0);
    })

    GameEvents.SendCustomGameEventToServer("InvestSystem", {
        event_name: "GetPlayerInvestData",
        params: {}
    })
}

(function () {
    Init()
})();