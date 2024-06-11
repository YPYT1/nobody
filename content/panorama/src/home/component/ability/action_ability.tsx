"use strict";
import { HideCustomTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";
import { default as NpcAbilityCustom } from "../../../json/npc_abilities_custom.json";
import { GetAbilityRarity } from "../../../utils/ability_description";

let MainPanel = $.GetContextPanel();
let AbilityContainer = MainPanel.GetChild(1) as Panel;
let m_Ability = -1 as AbilityEntityIndex;
let m_QueryUnit = -1 as EntityIndex;
// let m_SlotIndex = 0;

function GetAbilityData(ability_name: string) {
    let data = NpcAbilityCustom[ability_name as keyof typeof NpcAbilityCustom]
}

function AutoUpdateAbility() {
    UpdateAbility();
    $.Schedule(1, AutoUpdateAbility);
}

function UpdateAbility() {
    // let m_SlotIndex = MainPanel.Data<PanelDataObject>().m_SlotIndex
    // $.Msg(["UpdateAbility", m_Ability, "m_QueryUnit", m_QueryUnit, "m_SlotIndex", m_SlotIndex])
    // m_QueryUnit = Players.GetLocalPlayerPortraitUnit();

    // let AbilityImage = $("#AbilityImage") as AbilityImage;
    // AbilityImage.contextEntityIndex = 
}

function AbilityShowTooltip() {
    // $.Msg(["AbilityShowTooltip", m_Ability])
    ShowCustomTooltip(AbilityContainer, "ability", "", m_Ability)
}

function AbilityHideTooltip() {
    HideCustomTooltip()
}

function ActivateAbility() {

}



function SetAbility(slot: number, innate: boolean = false) {

    MainPanel.Data<PanelDataObject>().m_SlotIndex = slot
    UpdateAbilityVar();
    AbilityContainer.SetPanelEvent("onmouseover", AbilityShowTooltip)
    AbilityContainer.SetPanelEvent("onmouseout", AbilityHideTooltip)
    MainPanel.SetHasClass("Innate", innate)
    MainPanel.AddClass("Ability" + slot)

}

function UpdateAbilityVar() {
    let m_SlotIndex = MainPanel.Data<PanelDataObject>().m_SlotIndex
    let m_QueryUnit = Players.GetLocalPlayerPortraitUnit();
    m_Ability = Entities.GetAbility(m_QueryUnit, m_SlotIndex);
    let is_hidden = m_Ability < 1 || Abilities.IsHidden(m_Ability)
    let ability_name = Abilities.GetAbilityName(m_Ability)
    MainPanel.visible = !is_hidden;
    let AbilityImage = $("#AbilityImage") as AbilityImage;
    AbilityImage.abilityname = ability_name;

    // 变更品质
    const rarity = GetAbilityRarity(ability_name);
    SetAbilityRarity(rarity);


}

function SetAbilityRarity(rarity: number) {
    // $.Msg(["SetAbilityRarity", rarity])
    for (let i = 0; i < 9; i++) {
        $.GetContextPanel().SetHasClass("Rarity" + i, rarity == i)
    }

    $.GetContextPanel().SetHasClass("is_null", rarity < 1)
}

function RegisterArmsEvent() {
    // let order = 
    let m_SlotIndex = MainPanel.Data<PanelDataObject>().m_SlotIndex;
    MainPanel.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
            event_name: "CreatArmssSelectData",
            params: {
                index: m_SlotIndex
            }
        })
    })

}
(function () {
    $.GetContextPanel().Data<PanelDataObject>().SetAbility = SetAbility;
    $.GetContextPanel().Data<PanelDataObject>().UpdateAbilityVar = UpdateAbilityVar;
    $.GetContextPanel().Data<PanelDataObject>().RegisterArmsEvent = RegisterArmsEvent;

    MainPanel = $.GetContextPanel()
    AutoUpdateAbility();
    MainPanel.SetDialogVariable("manaCost", "0")
})();
