import React, { useEffect } from 'react';
import { render, useGameEvent } from 'react-panorama-x';
import { GetElementBondTable } from '../../utils/element_bond';

const element_enum_label: CElementType[] = ["null", "fire", "ice", "thunder", "wind", "light", "dark"];
let element_table = GetElementBondTable();


function UpdateTooltip() {
    // let MainPanel = $("#CustomTooltip")
    let MainPanel = $.GetContextPanel();
    let element_type = MainPanel.GetAttributeInt("element_type", 0);
    let element_count = MainPanel.GetAttributeInt("element_count", 0);
    // $.Msg(["element_type", element_type, "element_count", element_count])
    let syenrgy_title = element_enum_label[element_type]
    MainPanel.SetDialogVariable("syenrgy_title", syenrgy_title);
    MainPanel.SetDialogVariable("syenrgy_count", `${element_count}`);

    let BonusDescriptionPanel = $("#BonusDescription");
    BonusDescriptionPanel.RemoveAndDeleteChildren();
    let element_object = element_table[element_type];
    // custom_element_bond_fire_3_Description
    for (let count of element_object) {
        let BonusRow = $.CreatePanel("Panel", BonusDescriptionPanel, "", {});
        BonusRow.BLoadLayoutSnippet("SyenrgyRow");
        BonusRow.SetHasClass("On", element_count >= count);
        BonusRow.SetDialogVariableInt("syenrgy_amount", count);
        BonusRow.SetDialogVariable(
            "syenrgy_desc",
            $.Localize(`#custom_element_bond_${syenrgy_title}_${count}_Description`)
        );
    }
}


export function App() {

    useEffect(() => {
        $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
            UpdateTooltip()
        });
    }, []);

    return (
        <Panel
            id="CustomTooltip"
            className={``}
            onload={(e) => {
                let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
                $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
                $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
                m_TooltipPanel.FindChild('TopArrow')!.visible = false;
                m_TooltipPanel.FindChild('BottomArrow')!.visible = false;


            }}
        >
            <Panel id="Header" className="flow-right">
                {/* <Panel className='SyenrgyImage'>
                    <Image id='Icon' />
                </Panel> */}
                <Panel className='SyenrgyInfo'>
                    <Label className='SyenrgyTitle' localizedText='{s:syenrgy_title}' />
                    <Label className='SyenrgyCount' localizedText='{s:syenrgy_count}' />
                </Panel>
            </Panel>
            <Panel id="BaseDescription" className="flow-down">
                <Label text={"羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述羁绊描述提高元素伤害"} />
            </Panel>
            <Panel id='BonusDescription' />
        </Panel>
    )
}

render(<App />, $.GetContextPanel());