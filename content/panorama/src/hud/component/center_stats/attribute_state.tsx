import { useGameEvent } from "react-panorama-x"
import { HideCustomTooltip, ShowCustomTextTooltip } from "../../../utils/custom_tooltip";

import { default as attribute_const } from "./../../../json/config/game/attribute_const.json"

let AttributeRowsPanel: { [key in keyof CustomAttributeTableType]?: Panel } = {}

const attr_sub_key_list = Object.keys(Object.values(attribute_const)[0].AbilityValues);

const AttributeRows = ({ attr_key }: { attr_key: keyof CustomAttributeTableType }) => {

    return (
        <Panel
            className='AttributeRows'
            onload={(e) => {
                AttributeRowsPanel[attr_key] = e;
                e.SetDialogVariable("attr_value", "0")
            }}
            onmouseover={(e) => {
                ShowCustomTextTooltip(e, "", "#custom_attribute_" + attr_key)
            }}

            onmouseout={() => {
                HideCustomTooltip()
            }}
        >

            <Label className={'AttributeIcon ' + attr_key} />
            <Label className='AttributeValue' localizedText="{s:attr_value}" />
            {/* <Label className='AttributeExtraValue' localizedText="{s:attr_extra_value}" /> */}
        </Panel>
    )
}
export const AttributeState = () => {

    let MainPanel: Panel;
    // let queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer()) 
    const UpdateLocalPlayer = () => {
        const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());//Players.GetLocalPlayerPortraitUnit();
        AttributeRowsPanel["AttackDamage"]?.SetDialogVariable("attr_value", `${Entities.GetDamageMin(queryUnit)}`)
        AttributeRowsPanel["AttackRange"]?.SetDialogVariable("attr_value", `${Entities.GetAttackRange(queryUnit)}`)
        AttributeRowsPanel["AttackSpeed"]?.SetDialogVariable("attr_value", `${Math.floor((Entities.GetAttackSpeed(queryUnit)) * 100)}`)
        AttributeRowsPanel["MoveSpeed"]?.SetDialogVariable("attr_value", `${Entities.GetMoveSpeedModifier(queryUnit, Entities.GetBaseMoveSpeed(queryUnit))}`)

        if (MainPanel) {
            MainPanel.SetDialogVariableInt("level", Entities.GetLevel(queryUnit))
        }

        const netdata = CustomNetTables.GetTableValue("unit_attribute", `${queryUnit}`)
        if (netdata == null) { return }
        // 扩展数据
        let show = netdata.show;
        let value = netdata.value
        // $.Msg(["show",show.AttackDamage])
        AttributeRowsPanel["PhyicalArmor"]?.SetDialogVariable("attr_value", `${value.PhyicalArmor}`)
    }

    const StartLoop = () => {
        UpdateLocalPlayer();
        $.Schedule(0.1, StartLoop)
    }


    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);

    return (
        <Panel id="AttributeState" onload={(e) => {
            MainPanel = e;
            StartLoop();
        }} >
            <Panel id="UnitLevel">
                <Label className="LevelTitle" localizedText="Lv." />
                <Label className="LevelLabel" localizedText="{d:level}" />
            </Panel>
            <Panel id="UnitAttribute">
                <AttributeRows attr_key="AttackDamage" />
                <AttributeRows attr_key="PhyicalArmor" />
                <AttributeRows attr_key="MoveSpeed" />
            </Panel>

        </Panel>
    )
}