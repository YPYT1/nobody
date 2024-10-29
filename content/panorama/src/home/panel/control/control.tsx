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
    // 闪现按钮
    // let JumpPanel = $.CreatePanel("Panel",AbilityList,"JumpPanel");
    // JumpPanel.BLoadLayoutSnippet("SpaceJump")    

    InitAbilityAction();
    CreatePanel_Talent()
}

export const UpdateAbilityList = () => {
    for (let i = 0; i < AbilityList.GetChildCount(); i++) {
        let AbilityPanel = AbilityList.GetChild(i)!;
        AbilityPanel.Data<PanelDataObject>().UpdateAbilityVar();
    }
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

    AutoUpdateAbility();
}


const JumpPanel = $("#JumpPanel");
const AbilityCharge = JumpPanel.FindChildTraverse("AbilityCharge")!;
const localPlayer = Players.GetLocalPlayer();
const CooldownOverlay = JumpPanel.FindChildTraverse("CooldownOverlay")!;
function AutoUpdateAbility() {
    UpdateAbility();
    $.Schedule(0.1, AutoUpdateAbility);
}

function UpdateAbility() {
    const queryUnit = Players.GetPlayerHeroEntityIndex(localPlayer);
    const m_Ability = Entities.GetAbility(queryUnit, 5)

    const cooldown_ready = Abilities.IsCooldownReady(m_Ability);
    const cooldownLength = Abilities.GetCooldownTime(m_Ability)
    const cooldownRemaining = Abilities.GetCooldownTimeRemaining(m_Ability)

    // let cooldown_total = Abilities.GetCooldown(m_Ability) == 0 ? -1 : Abilities.GetCooldown(m_Ability);
    // let deg = Math.ceil(-360 * cooldownRemaining / cooldown_total);


    // $.Msg([current_charges, charges_time_remaining, "current_cooldown", current_cooldown, current_cooldown2, "UsesCharges", UsesCharges])

    JumpPanel.SetHasClass("in_cooldown", !cooldown_ready);
    
    // Shine.SetHasClass("do_shine", cooldown_ready);
   

    let RestoreCooldown = Abilities.GetAbilityChargeRestoreTimeRemaining(m_Ability);
    let rest_time = Abilities.GetSpecialValueFor(m_Ability,"AbilityChargeRestoreTime");
    let cooldown_total = Abilities.GetCooldown(m_Ability) == 0 ? -1 : Abilities.GetCooldown(m_Ability);
    // setBarPct(100 - RestoreCooldown / rest_time * 100);
    // setCdValue(parseInt());
    JumpPanel.SetDialogVariable("cooldown_timer", RestoreCooldown.toFixed(0));
    let deg = Math.ceil(-360 * RestoreCooldown / Math.max(0.1, rest_time));
    CooldownOverlay.style.clip = `radial( 50.0% 50.0%, 0.0deg, ${deg}deg)`;

    const current_charges = Abilities.GetCurrentAbilityCharges(m_Ability)
    AbilityCharge.SetHasClass("charge0", current_charges == 0)
    AbilityCharge.SetHasClass("charge1", current_charges == 1)
    AbilityCharge.SetHasClass("charge2", current_charges == 2)
    AbilityCharge.SetHasClass("charge3", current_charges == 3)


}
(function () {
    OnInitMoveHotkey()
    CreatePanel_ActionAbility();
    GameEvents.Subscribe("dota_portrait_ability_layout_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_ability_changed", UpdateAbilityList);
    GameEvents.Subscribe("dota_hero_ability_points_changed", UpdateAbilityList);
})();