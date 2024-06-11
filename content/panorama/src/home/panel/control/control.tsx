import "./_exp_bar";
import "./_hp_bar";
import "./_attribute_state";
import "./_portrait";
import "./_arms_selector";

export const CreatePanel_ActionAbility = () => {
    let MainPanel = $.GetContextPanel()
    let CenterStatsContainer = MainPanel.FindChildTraverse("CenterStatsContainer");
    if (CenterStatsContainer == null) {
        $.Schedule(0.3, CreatePanel_ActionAbility)
        return
    }
    let LeftPanel = CenterStatsContainer.FindChildTraverse("Left")!;
    for (var i = 0; i < 3; i++) {
        var AbilityPanel = $.CreatePanel("Panel", LeftPanel, "");
        AbilityPanel.BLoadLayout(
            "file://{resources}/layout/custom_game/home/component/ability/action_ability.xml",
            true, false
        );
        AbilityPanel.Data<PanelDataObject>().SetAbility(i);
        AbilityPanel.Data<PanelDataObject>().RegisterArmsEvent()

    }

    let RightPanel = CenterStatsContainer.FindChildTraverse("Right")!;
    for (var i = 0; i < 3; i++) {
        var AbilityPanel = $.CreatePanel("Panel", RightPanel, "");
        AbilityPanel.BLoadLayout(
            "file://{resources}/layout/custom_game/home/component/ability/action_ability.xml",
            true, false
        );
        AbilityPanel.Data<PanelDataObject>().SetAbility(i + 3);
        AbilityPanel.Data<PanelDataObject>().RegisterArmsEvent()
    }

    InitAbilityAction()
}

export const UpdateAbilityList = () => {
    let MainPanel = $.GetContextPanel()
    let LeftPanel = MainPanel.FindChildTraverse("Left");
    if (LeftPanel != null) {
        for (let i = 0; i < LeftPanel.GetChildCount(); i++) {
            let AbilityPanel = LeftPanel.GetChild(i)!;
            AbilityPanel.Data<PanelDataObject>().UpdateAbilityVar();
        }
    }

    let RightPanel = MainPanel.FindChildTraverse("Right");
    if (RightPanel != null) {
        for (let i = 0; i < RightPanel.GetChildCount(); i++) {
            let AbilityPanel = RightPanel.GetChild(i)!;
            AbilityPanel.Data<PanelDataObject>().UpdateAbilityVar();
        }
    }
}

const InitAbilityAction = () => {

    let AbilityList = $("#AbilityList")

    GameEvents.Subscribe("NewArmsEvolution_GetEvolutionPoint", event => {
        let data = event.data;
        AbilityList.SetHasClass("HasPoint", data.EvolutionPoint > 0)
    })

    GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
        event_name: "GetEvolutionPoint",
        params: {}
    })
}

(function () {
    CreatePanel_ActionAbility();
    GameEvents.Subscribe("dota_portrait_ability_layout_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_player_update_selected_unit", UpdateAbilityList);
    GameEvents.Subscribe("dota_player_update_query_unit", UpdateAbilityList);
    GameEvents.Subscribe("dota_ability_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_hero_ability_points_changed", UpdateAbilityList);
})();