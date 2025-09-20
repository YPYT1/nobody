'use strict';
import { HideCustomTooltip, ShowCustomTextTooltip, ShowCustomTooltip } from '../../../utils/custom_tooltip';
import { default as NpcAbilityCustom } from '../../../json/npc_abilities_custom.json';
import { GetAbilityRarity } from '../../../utils/ability_description';
import { GetTextureSrc } from '../../../common/custom_kv_method';

const localPlayer = Players.GetLocalPlayer();
let MainPanel = $.GetContextPanel();
const CooldownOverlay = $('#CooldownOverlay');
const Shine = $('#Shine');
const AbilityContainer = MainPanel.GetChild(1) as Panel;
let m_Ability = -1 as AbilityEntityIndex;
const m_QueryUnit = -1 as EntityIndex;
const LevelUpBtn = $('#LevelUpBtn') as Button;

// let m_SlotIndex = 0;

function GetAbilityData(ability_name: string) {
    const data = NpcAbilityCustom[ability_name as keyof typeof NpcAbilityCustom];
}

function AutoUpdateAbility() {
    UpdateAbility();
    $.Schedule(0.1, AutoUpdateAbility);
}

function UpdateAbility() {
    // let m_SlotIndex = MainPanel.Data<PanelDataObject>().m_SlotIndex;
    const queryUnit = Players.GetPlayerHeroEntityIndex(localPlayer); // Players.GetLocalPlayerPortraitUnit();

    const isHidden = Abilities.IsHidden(m_Ability);

    const ability_name = Abilities.GetAbilityName(m_Ability);
    const ability_level = Abilities.GetLevel(m_Ability);

    const have_nmana = Entities.GetMana(queryUnit);

    const is_enabled = Abilities.IsActivated(m_Ability);
    const need_mana = Abilities.GetManaCost(m_Ability);
    const cooldown_ready = Abilities.IsCooldownReady(m_Ability);

    const is_blood_mage = Entities.GetAbilityByName(queryUnit, 'special_blood_mage') != -1;

    if (is_blood_mage) {
        const health_pct = Entities.GetHealthPercent(queryUnit);
        MainPanel.SetHasClass('insufficient_mana', health_pct < 10);
    } else {
        MainPanel.SetHasClass('insufficient_mana', have_nmana < need_mana);
    }

    MainPanel.SetHasClass('is_disable', !is_enabled);

    // cooldown
    const cooldownLength = Abilities.GetCooldownLength(m_Ability);
    const cooldownRemaining = Abilities.GetCooldownTimeRemaining(m_Ability);
    MainPanel.SetHasClass('in_cooldown', !cooldown_ready);
    MainPanel.SetHasClass('in_ready', cooldown_ready);

    const cooldown_total = Abilities.GetCooldown(m_Ability) == 0 ? -1 : Abilities.GetCooldown(m_Ability);
    const deg = Math.ceil((-360 * cooldownRemaining) / cooldown_total);
    MainPanel.SetDialogVariableInt('cooldown_timer', cooldownRemaining);
    // Shine.SetHasClass("do_shine", cooldown_ready);
    CooldownOverlay.style.clip = `radial( 50.0% 50.0%, 0.0deg, ${deg}deg)`;
    // setManaCost(need_mana);
    // $.Msg(["UpdateAbility", m_Ability, "m_QueryUnit", m_QueryUnit, "m_SlotIndex", m_SlotIndex])
    // m_QueryUnit = Players.GetLocalPlayerPortraitUnit();

    // let AbilityImage = $("#AbilityImage") as AbilityImage;
    // AbilityImage.contextEntityIndex =
}

function AbilityShowTooltip() {
    const m_SlotIndex = MainPanel.Data<PanelDataObject>().m_SlotIndex;
    ShowCustomTooltip(AbilityContainer, 'ability', '', m_Ability, m_SlotIndex);
}

function AbilityHideTooltip() {
    HideCustomTooltip();
}

function ActivateAbility() {}

function SetAbility(slot: number, innate: boolean = false) {
    MainPanel.Data<PanelDataObject>().m_SlotIndex = slot;
    UpdateAbilityVar();
    AbilityContainer.SetPanelEvent('onmouseover', AbilityShowTooltip);
    AbilityContainer.SetPanelEvent('onmouseout', AbilityHideTooltip);
    MainPanel.SetHasClass('Innate', innate);
    MainPanel.AddClass('Ability' + slot);
}

function UpdateAbilityVar() {
    const m_SlotIndex = MainPanel.Data<PanelDataObject>().m_SlotIndex;
    const m_QueryUnit = Players.GetPlayerHeroEntityIndex(localPlayer); // Players.GetLocalPlayerPortraitUnit();

    m_Ability = Entities.GetAbility(m_QueryUnit, m_SlotIndex);
    const is_hidden = m_Ability < 1 || Abilities.IsHidden(m_Ability);
    const ability_name = Abilities.GetAbilityName(m_Ability);
    // MainPanel.visible = !is_hidden;
    MainPanel.SetHasClass('is_hidden', is_hidden);
    const AbilityImage = $('#AbilityImage') as ImagePanel;
    const ability_data = NpcAbilityCustom[ability_name as keyof typeof NpcAbilityCustom];
    let texture = '';
    if (m_Ability) {
        texture = Abilities.GetAbilityTextureName(m_Ability);
    }

    AbilityImage.SetImage(GetTextureSrc(texture, 'UpdateAbilityVar'));

    // 变更品质
    const rarity = GetAbilityRarity(ability_name);
    SetAbilityRarity(rarity);
}

function SetAbilityRarity(rarity: number) {
    // $.Msg(["SetAbilityRarity", rarity])
    for (let i = 0; i < 9; i++) {
        $.GetContextPanel().SetHasClass('Rarity' + i, rarity == i);
    }

    $.GetContextPanel().SetHasClass('is_ability', rarity > 0);
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

    MainPanel = $.GetContextPanel();
    AutoUpdateAbility();
    MainPanel.SetDialogVariable('manaCost', '0');
})();
