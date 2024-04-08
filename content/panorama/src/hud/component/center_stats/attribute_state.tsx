import { useCallback, useEffect, useMemo, useState } from "react";
import { useGameEvent } from "react-panorama-x"
import { HideCustomTooltip, ShowCustomTextTooltip } from "../../../utils/custom_tooltip";

import { default as attribute_const } from "./../../../json/config/game/attribute_const.json"

const attr_sub_key_list = Object.keys(Object.values(attribute_const)[0].AbilityValues);
const AttributeRows = (
    { attr_key, attr_value }: {
        attr_key: keyof CustomAttributeTableType,
        attr_value?: number,
        // attr_table: UnitAttributeNT,
        // SelectUnit: EntityIndex,
    }
) => {

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
            onmouseover={(e) => {
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
            <Label className='AttributeValue' text={attr_value} />
        </Panel>
    )
}
export const AttributeState = () => {

    const [AttackDamage, setAttackDamage] = useState(0);
    const [AttackRange, setAttackRange] = useState(0);
    const [AttackSpeed, setAttackSpeed] = useState(0);
    const [MoveSpeed, setMoveSpeed] = useState(0);
    // const [AttackSpeed,setAttackSpeed] = useState(0);
    const UpdateLocalPlayer = useCallback(() => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        // setSelectUnit(queryUnit);
        setAttackDamage(Entities.GetDamageMin(queryUnit));
        setAttackRange(Entities.GetAttackRange(queryUnit));
        setAttackSpeed(Math.floor((Entities.GetAttackSpeed(queryUnit) ) * 100));
        setMoveSpeed(Entities.GetMoveSpeedModifier(queryUnit, Entities.GetBaseMoveSpeed(queryUnit)))

    }, [])

    useEffect(() => {
        const interval = setInterval(() => { UpdateLocalPlayer(); }, 250);
        return () => clearInterval(interval);
    }, []);

    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);

    return (
        <Panel id="AttributeState">
            <AttributeRows attr_key="AttackDamage" attr_value={AttackDamage} />
            <AttributeRows attr_key="AttackRange" attr_value={AttackRange} />
            <AttributeRows attr_key="AttackSpeed" attr_value={AttackSpeed} />
            <AttributeRows attr_key="MoveSpeed" attr_value={MoveSpeed} />
        </Panel>
    )
}