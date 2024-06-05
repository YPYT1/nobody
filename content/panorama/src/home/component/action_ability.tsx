"use strict";
import { HideCustomTooltip, ShowCustomTooltip } from "../../utils/custom_tooltip";
import { default as NpcAbilityCustom } from "./../../json/npc_abilities_custom.json";

let MainPanel = $.GetContextPanel();
let m_Ability = -1 as AbilityEntityIndex;
let m_QueryUnit = -1 as EntityIndex;
let m_SlotIndex = 0;

function GetAbilityData(ability_name: string) {
    let data = NpcAbilityCustom[ability_name as keyof typeof NpcAbilityCustom]
}

function AutoUpdateAbility() {
    UpdateAbility();
    $.Schedule(0.1, AutoUpdateAbility);
}

function UpdateAbility() {
    // m_QueryUnit = Players.GetLocalPlayerPortraitUnit();
}

function AbilityShowTooltip() {
    // $.Msg(["AbilityShowTooltip", m_SlotIndex, m_Ability])
    ShowCustomTooltip(MainPanel,"ability","",m_Ability)
}

function AbilityHideTooltip() {
    HideCustomTooltip()
}

function ActivateAbility() {

}

function DoubleClickAbility() {

}

function RightClickAbility() {

}

function SetAbility(slot: number) {
    // $.Msg(["SetAbility", slot])
    m_SlotIndex = slot;
    UpdateAbilityVar();

    $.Msg(["MainPanel",MainPanel])
    MainPanel.SetPanelEvent("onmouseover", AbilityShowTooltip)
    MainPanel.SetPanelEvent("onmouseout", AbilityHideTooltip)

}

function UpdateAbilityVar() {
    m_QueryUnit = Players.GetLocalPlayerPortraitUnit();
    m_Ability = Entities.GetAbility(m_QueryUnit, m_SlotIndex);
    MainPanel.visible = m_Ability != -1;
    $.Msg(["m_Ability", m_Ability, m_QueryUnit, m_SlotIndex])
    let AbilityImage = $("#AbilityImage") as AbilityImage;
    AbilityImage.contextEntityIndex = m_Ability
}

(function () {

    $.GetContextPanel().Data<PanelDataObject>().SetAbility = SetAbility;
    $.GetContextPanel().Data<PanelDataObject>().UpdateAbilityVar = UpdateAbilityVar;

    MainPanel = $.GetContextPanel()
    AutoUpdateAbility();
    // MainPanel.SetPanelEvent("")
    // GameEvents.Subscribe( "dota_ability_changed", RebuildAbilityUI ); // major rebuild
    // AutoUpdateAbility(); // initial update of dynamic state
    // GameEvents.Subscribe("dota_portrait_ability_layout_changed", UpdateAbilityVar);
    // GameEvents.Subscribe("dota_player_update_selected_unit", UpdateAbilityVar);
    // GameEvents.Subscribe("dota_player_update_query_unit", UpdateAbilityVar);
    // GameEvents.Subscribe("dota_ability_changed", UpdateAbilityVar);
    // GameEvents.Subscribe("dota_hero_ability_points_changed", UpdateAbilityVar);

})();
