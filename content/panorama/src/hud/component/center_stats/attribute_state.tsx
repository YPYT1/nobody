import { useCallback, useEffect } from "react";
import { useGameEvent } from "react-panorama-x"
import { HideCustomTooltip, ShowCustomTextTooltip } from "../../../utils/custom_tooltip";

import { default as attribute_const } from "./../../../json/config/game/attribute_const.json"

let AttributeRowsPanel: { [key in keyof CustomAttributeTableType]?: Panel } = {}

const attr_sub_key_list = Object.keys(Object.values(attribute_const)[0].AbilityValues);

const AttributeRows = ({ attr_key }: { attr_key: keyof CustomAttributeTableType }) => {
    // $.Msg(["attr_key", attr_key])
    // let value = 0
    // if (attr_key == "AttackDamage") {
    //     value = Entities.GetDamageMin(SelectUnit)
    // } else if (attr_key == "AttackRange") {
    //     value = Entities.GetAttackRange(SelectUnit)
    // } else if (attr_key == "MoveSpeed") {
    //     value = Entities.GetMoveSpeedModifier(SelectUnit, Entities.GetBaseMoveSpeed(SelectUnit))
    // }

    return (
        <Panel
            className='AttributeRows'
            onload={(e) => {
                AttributeRowsPanel[attr_key] = e;
                e.SetDialogVariable("attr_value", "0")
            }}
            onmouseover={(e) => {
                // $.Msg(["onmouseover"])
                // let row_attr_table = attr_table.table[attr_key];
                // if (row_attr_table == null) {
                //     for (let k of attr_sub_key_list) {
                //         e.SetDialogVariableInt(k, 0)
                //     }
                // } else {
                //     for (let k in row_attr_table) {
                //         let value = row_attr_table[k as keyof typeof row_attr_table] ?? 0
                //         e.SetDialogVariableInt(k, value)
                //     }
                // }
                // ShowCustomTextTooltip(e, "属性加成", "#text_about_attr_bonus")
                ShowCustomTextTooltip(e, "", "#custom_attribute_" + attr_key)
            }}

            onmouseout={() => {
                HideCustomTooltip()
            }}
        >
            {/* <Label className='AttrName' text={$.Localize("#custom_attribute_" + attr_key)} /> */}
            <Label className={'AttributeIcon ' + attr_key} />
            <Label className='AttributeValue' localizedText="{s:attr_value}" />
        </Panel>
    )
}
export const AttributeState = () => {

    const UpdateLocalPlayer = () => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        AttributeRowsPanel["AttackDamage"]?.SetDialogVariable("attr_value", `${Entities.GetDamageMin(queryUnit)}`)
        AttributeRowsPanel["AttackRange"]?.SetDialogVariable("attr_value", `${Entities.GetAttackRange(queryUnit)}`)
        AttributeRowsPanel["AttackSpeed"]?.SetDialogVariable("attr_value", `${Math.floor((Entities.GetAttackSpeed(queryUnit)) * 100)}`)
        AttributeRowsPanel["MoveSpeed"]?.SetDialogVariable("attr_value", `${Entities.GetMoveSpeedModifier(queryUnit, Entities.GetBaseMoveSpeed(queryUnit))}`)
    }

    useEffect(() => {
        const interval = setInterval(() => { UpdateLocalPlayer(); }, 250);
        return () => clearInterval(interval);
    }, []);

    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);

    // $.Msg(["AttributeState"]);

    return (
        <Panel id="AttributeState">
            <AttributeRows attr_key="AttackDamage" />
            <AttributeRows attr_key="AttackRange" />
            <AttributeRows attr_key="AttackSpeed" />
            <AttributeRows attr_key="MoveSpeed" />
        </Panel>
    )
}