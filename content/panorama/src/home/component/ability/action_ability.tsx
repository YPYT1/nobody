"use strict";
import { HideCustomTooltip, ShowCustomTextTooltip, ShowCustomTooltip } from "../../../utils/custom_tooltip";
import { default as NpcAbilityCustom } from "../../../json/npc_abilities_custom.json";
import { GetAbilityRarity } from "../../../utils/ability_description";
import { GetTextureSrc } from "../../../common/custom_kv_method";

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
    // MainPanel.visible = !is_hidden;
    MainPanel.SetHasClass("is_hidden",is_hidden)
    let AbilityImage = $("#AbilityImage") as ImagePanel;
    let ability_data = NpcAbilityCustom[ability_name as keyof typeof NpcAbilityCustom];
    let texture = ""
    if (m_Ability){
        texture = Abilities.GetAbilityTextureName(m_Ability);
    } 

    AbilityImage.SetImage(GetTextureSrc(texture,"UpdateAbilityVar")) 

    // 变更品质
    const rarity = GetAbilityRarity(ability_name);
    SetAbilityRarity(rarity);


}

function SetAbilityRarity(rarity: number) {
    // $.Msg(["SetAbilityRarity", rarity])
    for (let i = 0; i < 9; i++) {
        $.GetContextPanel().SetHasClass("Rarity" + i, rarity == i)
    }

    $.GetContextPanel().SetHasClass("is_ability", rarity > 0)
}

function RegisterArmsEvent() {
    // let order = 
    // let m_SlotIndex = MainPanel.Data<PanelDataObject>().m_SlotIndex;
    // MainPanel.SetPanelEvent("onactivate", () => {
    //     GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
    //         event_name: "CreatArmssSelectData",
    //         params: {
    //             index: m_SlotIndex
    //         }
    //     })
    // })

    // const AbilityReselect = MainPanel.FindChildTraverse("AbilityReselect") as Button;
    // // AbilityReselect.enabled = false;
    // AbilityReselect.SetPanelEvent("onactivate", () => {
    //     // $.Msg(["CreatArmssWeightData",m_SlotIndex])
    //     GameEvents.SendCustomGameEventToServer("NewArmsEvolution", {
    //         event_name: "CreatArmssWeightData",
    //         params: {
    //             index: m_SlotIndex
    //         }
    //     })
    // })

    // AbilityReselect.SetPanelEvent("onmouseover", () => {
    //     ShowCustomTextTooltip(AbilityReselect, "", "重新随机技能")
    // })

    // AbilityReselect.SetPanelEvent("onmouseout", () => {
    //     HideCustomTooltip()
    // })

}
(function () {
    $.GetContextPanel().Data<PanelDataObject>().SetAbility = SetAbility;
    $.GetContextPanel().Data<PanelDataObject>().UpdateAbilityVar = UpdateAbilityVar;
    $.GetContextPanel().Data<PanelDataObject>().RegisterArmsEvent = RegisterArmsEvent;

    MainPanel = $.GetContextPanel()
    AutoUpdateAbility();
    MainPanel.SetDialogVariable("manaCost", "0")
})();
