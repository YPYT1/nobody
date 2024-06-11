import { GetTextureSrc } from "../../../common/custom_kv_method";

let m_BuffPanels: Panel[] = [];
let m_DeBuffPanels: Panel[] = [];

export let BuffListPanel: Panel;
export let DeBuffListPanel: Panel;

export const CreatePanel_BuffList = () => {
    BuffListPanel = $("#BuffList");
    BuffListPanel.RemoveAndDeleteChildren()
    DeBuffListPanel = $("#DeBuffList");
    DeBuffListPanel.RemoveAndDeleteChildren();
    m_BuffPanels = [];
    m_DeBuffPanels = [];

    GameEvents.Subscribe("dota_player_update_selected_unit", UpdateBuffs);
    GameEvents.Subscribe("dota_player_update_query_unit", UpdateBuffs);
    AutoUpdateBuffs()
}

export const RegisterPanelTooltip = (panel: Panel) => {

    panel.SetPanelEvent("onmouseover", () => {
        var queryUnit = panel.Data<PanelDataObject>().m_QueryUnit;
        var buffSerial = panel.Data<PanelDataObject>().m_BuffSerial;
        var isEnemy = Entities.IsEnemy(queryUnit);
        $.DispatchEvent("DOTAShowBuffTooltip", panel, queryUnit, buffSerial, isEnemy);
    })

    panel.SetPanelEvent("onmouseout", () => {
        $.DispatchEvent("DOTAHideBuffTooltip", $.GetContextPanel());
    })
}

// export function OnBuffClicked() {
//     var queryUnit = $.GetContextPanel().data().m_QueryUnit;
//     var buffSerial = $.GetContextPanel().data().m_BuffSerial;
//     var alertBuff = GameUI.IsAltDown();
//     Players.BuffClicked(queryUnit, buffSerial, alertBuff);
// }

// export function BuffShowTooltip() {
//     var queryUnit = $.GetContextPanel().data().m_QueryUnit;
//     var buffSerial = $.GetContextPanel().data().m_BuffSerial;
//     var isEnemy = Entities.IsEnemy(queryUnit);
//     $.DispatchEvent("DOTAShowBuffTooltip", $.GetContextPanel(), queryUnit, buffSerial, isEnemy);
// }

// export function BuffHideTooltip() {
//     $.DispatchEvent("DOTAHideBuffTooltip", $.GetContextPanel());
// }

export function UpdateBuffs() {
    let queryUnit = Players.GetLocalPlayerPortraitUnit();
    let buff_count = Entities.GetNumBuffs(queryUnit);
    let used_debuff = 0;
    let used_buff = 0

    for (let i = 0; i < buff_count; ++i) {
        let buffSerial = Entities.GetBuff(queryUnit, i);
        if (buffSerial == -1) continue;
        if (Buffs.IsHidden(queryUnit, buffSerial)) continue;
        let is_debuff = Buffs.IsDebuff(queryUnit, buffSerial);
        if (is_debuff) {
            if (used_debuff >= m_DeBuffPanels.length) {
                let debuff_Panel = $.CreatePanel("Panel", DeBuffListPanel, "");
                debuff_Panel.BLoadLayoutSnippet("BuffBorder");
                RegisterPanelTooltip(debuff_Panel);
                m_DeBuffPanels.push(debuff_Panel);
            }

            let buffPanel = m_DeBuffPanels[used_debuff];
            UpdateBuff(buffPanel, queryUnit, buffSerial);
            used_debuff++;
        } else {
            // $.Msg(["used_buff", used_buff , m_BuffPanels.length])
            if (used_buff >= m_BuffPanels.length) {
                let buff_Panel = $.CreatePanel("Panel", BuffListPanel, "");
                buff_Panel.BLoadLayoutSnippet("BuffBorder");
                RegisterPanelTooltip(buff_Panel);
                m_BuffPanels.push(buff_Panel);
            }
            let buffPanel = m_BuffPanels[used_buff];
            UpdateBuff(buffPanel, queryUnit, buffSerial);
            used_buff++;
        }
    }

    for (let i = used_debuff; i < m_DeBuffPanels.length; i++) {
        let buffPanel = m_DeBuffPanels[i];
        UpdateBuff(buffPanel, -1 as EntityIndex, -1 as BuffID);
    }

    for (let i = used_buff; i < m_BuffPanels.length; i++) {
        let buffPanel = m_BuffPanels[i];
        UpdateBuff(buffPanel, -1 as EntityIndex, -1 as BuffID);
    }
}

export function UpdateBuff(buffPanel: Panel, queryUnit: EntityIndex, buffSerial: BuffID) {
    let noBuff = (buffSerial == -1);
    // $.Msg(["buffPanel", buffPanel])
    buffPanel.SetHasClass("no_buff", noBuff);
    buffPanel.Data<PanelDataObject>().m_QueryUnit = queryUnit;
    buffPanel.Data<PanelDataObject>().m_BuffSerial = buffSerial;
    if (noBuff) { return; }
    let nNumStacks = Buffs.GetStackCount(queryUnit, buffSerial);
    buffPanel.SetHasClass("is_debuff", Buffs.IsDebuff(queryUnit, buffSerial));
    buffPanel.SetHasClass("has_stacks", (nNumStacks > 0));

    let BuffImage = buffPanel.FindChildInLayoutFile("BuffImage") as ImagePanel;
    let CircularDuration = buffPanel.FindChildTraverse("CircularDuration")!;
    if (nNumStacks > 0) {
        buffPanel.SetDialogVariable("stack_count", `${nNumStacks}`);
    }

    let buffTexture = Buffs.GetTexture(queryUnit, buffSerial);
    let ImageSrc = GetTextureSrc(buffTexture);
    BuffImage.SetImage(ImageSrc);

    let buff_duration = Buffs.GetDuration(queryUnit, buffSerial);
    let RemainingTime = Buffs.GetRemainingTime(queryUnit, buffSerial);
    if (RemainingTime > 0 && buff_duration > 0) {
        let deg = Math.ceil(-360 * RemainingTime / buff_duration);
        CircularDuration.style.clip = "radial( 50.0% 50.0%, 0.0deg, " + deg + "deg)";
    } else {
        CircularDuration.style.clip = "radial( 50.0% 50.0%, 0.0deg, " + 360 + "deg)";
    }
}
export function AutoUpdateBuffs() {
    UpdateBuffs();
    $.Schedule(0.1, AutoUpdateBuffs);
}

(function () {
    CreatePanel_BuffList();
})();