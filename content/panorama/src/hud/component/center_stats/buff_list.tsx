import { useGameEvent } from "react-panorama-x";
import { GetTextureSrc } from "../../../common/custom_kv_method";
import { useEffect } from "react";

interface BuffTypeProps {
    buff_type: "Buff" | "Debuff";
}

function UpdateBuff(buffPanel: Panel, queryUnit: EntityIndex, buffSerial: BuffID) {
    let noBuff = (buffSerial == -1);
    buffPanel.SetHasClass("no_buff", noBuff);
    buffPanel.Data<PanelDataObject>().m_QueryUnit = queryUnit;
    buffPanel.Data<PanelDataObject>().m_BuffSerial = buffSerial;
    if (noBuff) {
        return;
    }

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

function OnBuffClicked(e: Panel) {
    var queryUnit = e.Data<PanelDataObject>().m_QueryUnit;
    var buffSerial = e.Data<PanelDataObject>().m_BuffSerial;
    var alertBuff = GameUI.IsAltDown();
    Players.BuffClicked(queryUnit, buffSerial, alertBuff);
}

function BuffShowTooltip(e: Panel) {
    var queryUnit = e.Data<PanelDataObject>().m_QueryUnit;
    var buffSerial = e.Data<PanelDataObject>().m_BuffSerial;
    var isEnemy = Entities.IsEnemy(queryUnit);
    $.DispatchEvent("DOTAShowBuffTooltip", e, queryUnit, buffSerial, isEnemy);
}

function BuffHideTooltip() {
    $.DispatchEvent("DOTAHideBuffTooltip", $.GetContextPanel());
}

const UnitBuffList = ({ buff_type }: BuffTypeProps) => {

    let buff_list = [];
    let m_BuffPanels: Panel[] = [];
    let m_deBuffPanels = [];

    let buffsListPanel: Panel;

    const UpdateLocalPlayer = () => {
        if (buffsListPanel == null) { return; }
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        const nBuffs = Entities.GetNumBuffs(queryUnit);
        let nUsedPanels = 0;

        for (let i = 0; i < nBuffs; ++i) {
            let buffSerial = Entities.GetBuff(queryUnit, i);
            if (buffSerial == -1) continue;
            if (Buffs.IsHidden(queryUnit, buffSerial)) { continue; };
            if (buff_type == "Buff" && Buffs.IsDebuff(queryUnit, buffSerial)) { continue; };
            if (buff_type == "Debuff" && !Buffs.IsDebuff(queryUnit, buffSerial)) { continue; };
            if (nUsedPanels >= m_BuffPanels.length) {
                // create a new panel
                // $.Msg("Create BuffPanel");
                let buffPanel = $.CreatePanel("Button", buffsListPanel, "", {});
                buffPanel.BLoadLayoutSnippet("BuffBorder");
                buffPanel.SetPanelEvent("onactivate", () => {
                    OnBuffClicked(buffPanel);
                });
                buffPanel.SetPanelEvent("onmouseover", () => {
                    BuffShowTooltip(buffPanel);
                });
                buffPanel.SetPanelEvent("onmouseout", () => {
                    BuffHideTooltip();
                });

                m_BuffPanels.push(buffPanel);
            }
            // update the panel for the current unit / buff
            let buffPanel = m_BuffPanels[nUsedPanels];
            buffPanel.Data<PanelDataObject>().m_QueryUnit = queryUnit;
            buffPanel.Data<PanelDataObject>().m_BuffSerial = buffSerial;
            UpdateBuff(buffPanel, queryUnit, buffSerial);
            nUsedPanels++;
        }
        for (let i = nUsedPanels; i < m_BuffPanels.length; ++i) {
            let buffPanel = m_BuffPanels[i];
            UpdateBuff(buffPanel, -1 as EntityIndex, -1 as BuffID);
        }
    };

    useEffect(() => {
        const interval = setInterval(() => { UpdateLocalPlayer(); }, 100);
        return () => clearInterval(interval);
    }, []);

    // useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    // useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);

    return (
        <Panel className="UnitBuffList" onload={(e) => { buffsListPanel = e; }} />
    )
}

export const BuffListContainer = () => {

    return (
        <Panel id="BuffListContainer" >
            <UnitBuffList buff_type="Buff" />
            <UnitBuffList buff_type="Debuff" />
        </Panel>
    )
}