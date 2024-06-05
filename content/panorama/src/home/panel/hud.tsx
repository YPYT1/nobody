
"use strict";

const ABILITY_MAX_COUNT = 6;
// let ActionAbilityPanel: Panel;


const CreateActionAbilityPanels = () => {
    let ActionAbilityPanel = $("#ActionAbility");
    $.Msg(["ActionAbilityPanel", ActionAbilityPanel])
    if (ActionAbilityPanel == null) { return }
    ActionAbilityPanel.RemoveAndDeleteChildren();
    for (var i = 0; i < ABILITY_MAX_COUNT; i++) {
        var AbilityPanel = $.CreatePanel("Panel", ActionAbilityPanel, "");
        AbilityPanel.BLoadLayout("file://{resources}/layout/custom_game/home/component/action_ability.xml", false, false);
        $.Msg(["CreateActionAbilityPanels", i])
        AbilityPanel.Data<PanelDataObject>().SetAbility(i);
    }

    UpdateAbilityList();
}

const UpdateAbilityList = () => {
    let ActionAbilityPanel = $("#ActionAbility");
    if (ActionAbilityPanel == null) { return }
    for (let i = 0; i < ActionAbilityPanel.GetChildCount(); i++) {
        let AbilityPanel = ActionAbilityPanel.GetChild(i)!;
        AbilityPanel.Data<PanelDataObject>().UpdateAbilityVar();
    }
}

$.Msg(["Hud 2"]);
CreateActionAbilityPanels();
(function () {
    $.Msg(["Hud 1"])
    
    GameEvents.Subscribe("dota_portrait_ability_layout_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_player_update_selected_unit", UpdateAbilityList);
    GameEvents.Subscribe("dota_player_update_query_unit", UpdateAbilityList);
    GameEvents.Subscribe("dota_ability_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_hero_ability_points_changed", UpdateAbilityList);
})();