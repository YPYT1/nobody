import "./_exp_bar";
import "./_hp_bar";
import "./_attribute_state";
import "./_portrait";
import "./_arms_selector";
import "./_buff_list";
import { CreatePanel_Talent } from "./_talent";
import { OnInitMoveHotkey } from "./_move_controller";


export let AbilityList = $("#AbilityList");
export let MainPanel = $.GetContextPanel();

export const CreatePanel_ActionAbility = () => {

    let CenterStatsContainer = MainPanel.FindChildTraverse("CenterStatsContainer");
    if (CenterStatsContainer == null) {
        $.Schedule(0.3, CreatePanel_ActionAbility)
        return
    }

    AbilityList.RemoveAndDeleteChildren();
    for (var i = 0; i < 5; i++) {
        var AbilityPanel = $.CreatePanel("Panel", AbilityList, "");
        AbilityPanel.BLoadLayout(
            "file://{resources}/layout/custom_game/home/component/ability/action_ability.xml",
            true, false
        );
        AbilityPanel.Data<PanelDataObject>().SetAbility(i);
        AbilityPanel.Data<PanelDataObject>().RegisterArmsEvent()
    }
    InitAbilityAction();
    CreatePanel_Talent()
}

export const UpdateAbilityList = () => {

    for (let i = 0; i < AbilityList.GetChildCount(); i++) {
        let AbilityPanel = AbilityList.GetChild(i)!;
        AbilityPanel.Data<PanelDataObject>().UpdateAbilityVar();
    }

    let m_QueryUnit = Players.GetLocalPlayerPortraitUnit();
    let is_local = Entities.GetPlayerOwnerID(m_QueryUnit) == Players.GetLocalPlayer();
    AbilityList.SetHasClass("is_local", is_local)
}

const InitAbilityAction = () => {

    GameEvents.Subscribe("NewArmsEvolution_GetEvolutionPoint", event => {
        let data = event.data;
        AbilityList.SetHasClass("HasPoint", data.EvolutionPoint > 0);
    })

    GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
        event_name: "GetEvolutionPoint",
        params: {}
    })
}

(function () {
    OnInitMoveHotkey()
    CreatePanel_ActionAbility();
    GameEvents.Subscribe("dota_portrait_ability_layout_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_player_update_selected_unit", UpdateAbilityList);
    GameEvents.Subscribe("dota_player_update_query_unit", UpdateAbilityList);
    GameEvents.Subscribe("dota_ability_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_hero_ability_points_changed", UpdateAbilityList);
})();