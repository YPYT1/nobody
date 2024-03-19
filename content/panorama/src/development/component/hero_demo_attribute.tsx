import { useCallback, useEffect, useState } from 'react';
import { useGameEvent, useNetTableKey, useNetTableValues } from 'react-panorama-x';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../../utils/custom_tooltip';

import * as attr_table from "./../../json/config/game/attr_table.json"


const attr_sub_key_list = Object.keys(Object.values(attr_table)[0].AbilityValues);

/** 属性表头 */
const AttributeRowsHeader = () => {

    return (
        <Panel
            className='AttributeRows'

            onmouseover={(e) => {
                ShowCustomTextTooltip(e, "属性加成说明", `(白字 * (1 + 白字加成) + 绿字 ) * (1 + 总加成 ) + ( 绿字 * 绿字加成 ) + 固定值`)
            }}
            onmouseout={() => {
                HideCustomTooltip()
            }}
        >
            <Label
                className='AttrName' text={"属性名"}
            />
            <Label className='AttrTotal' text={"总值"} />
            {/* <Panel className='AttributeCols'>

                <Label className='Value' text={"白字"} />
                <Label className='Percent' text={`白字加成`} />
            </Panel>

            <Panel className='AttributeCols'>
                <Label className='Value' text={"绿字"} />
                <Label className='Percent' text={`绿字加成`} />
            </Panel>

            <Panel className='AttributeCols'>
                <Label className='Value' text={"固定值"} />
            </Panel>

            <Panel className='AttributeCols'>
                <Label className='Percent' text={`总百分比`} />
            </Panel> */}

        </Panel>
    )
}

/**
 * 属性公式计算
 * 属性总值 = (属性白字 * (1 + 白字加成) + 属性绿字 ) * (1 + 总加成 ) + ( 属性绿字 * 绿字加成 ) + 固定值
 * 白字加成获得的值可享受总加成
 * 绿字自身可享受总加成,绿字加成不享受总加成
 */
const AttributeRows = (
    { attr_key, attr_value, attr_table }: {
        attr_key: keyof CustomAttributeTableType,
        attr_value: CustomAttributeValueType,
        attr_table: CustomAttributeTableType
    }
) => {

    const [Bonus, setBonus] = useState(0);
    const [AttrSubKey, setAttrSubKey] = useState<AttributeSubKey>("Base")

    return (
        <Panel className='AttributeRows'>
            <Label className='AttrName' text={$.Localize("#custom_attribute_" + attr_key)} />
            <Label className='AttrTotal' text={attr_value[attr_key] ?? 0} />
            <Panel className='AttrList'>
                <DropDown
                    id='AttrListDrop'
                    onload={(e) => {
                        e.SetSelected(`Base`);
                    }}

                    oninputsubmit={(e) => {
                        let sub_key = e.GetSelected().id as AttributeSubKey;
                        // $.Msg(["dropdown", attr_key, sub_key])
                        setAttrSubKey(sub_key)
                    }}
                >
                    {
                        attr_sub_key_list.map((v, k) => {
                            // let text_label = `${attr_key}_${v}`
                            return <Label id={v} key={k} text={v} />
                        })
                    }
                </DropDown>
            </Panel>
            <Panel className='AttrInput flow-right'>
                <TextEntry
                    id='RowAttrTextEntry'
                    textmode="numeric"
                    text='0'
                    ontextentrychange={(e) => {
                        let value = e.text;
                        setBonus(parseInt(value))
                    }}
                />
                <Panel style={{ width: "80px" }}>
                    <Button
                        className='fc-tool-button'
                        onactivate={() => {
                            const queryUnit = Players.GetLocalPlayerPortraitUnit();
                            GameEvents.SendCustomGameEventToServer("Development", {
                                event_name: "ModiyAttribute",
                                params: {
                                    unit: queryUnit,
                                    attr_object: {
                                        [attr_key]: {
                                            [AttrSubKey]: Bonus
                                        }
                                    }
                                }
                            })
                        }}
                    >
                        <Label text={"修改"} />
                    </Button>
                </Panel>

            </Panel>

            <Panel
                className='AboutTip'
                onmouseover={(e) => {
                    let row_attr_table = attr_table[attr_key];
                    if (row_attr_table == null) {
                        for (let k of attr_sub_key_list) {
                            e.SetDialogVariableInt(k, 0)
                        }
                    } else {
                        for (let k in row_attr_table) {
                            let value = row_attr_table[k as keyof typeof row_attr_table] ?? 0
                            e.SetDialogVariableInt(k, value)
                        }
                    }
                    ShowCustomTextTooltip(e, "属性加成", "#text_about_attr_bonus")
                }}

                onmouseout={() => {
                    HideCustomTooltip()
                }}
            >
                <Label text={"!"} />
            </Panel>
            {/* <Panel className='AttributeCols'>
                <Label className='Value' text={attr_data?.Base} />
                <Label className='Percent' text={`(${attr_data?.BasePercent}%)`} />
            </Panel>

            <Panel className='AttributeCols'>
                <Label className='Value' text={attr_data?.Bonus} />
                <Label className='Percent' text={`(${attr_data?.BonusPercent}%)`} />
            </Panel>
            <Panel className='AttributeCols'>
                <Label className='Value' text={attr_data?.Fixed} />
            </Panel>

            <Panel className='AttributeCols'>
                <Label className='Percent' text={`${attr_data?.TotalPercent}%`} />
            </Panel> */}

        </Panel>
    )
}

export const HeroDemoAttribute = () => {

    const [AttributeTable, setAttributeTable] = useState<CustomAttributeTableType>({});
    const [AttributeValue, setAttributeValue] = useState<CustomAttributeValueType>({});

    const UpdateLocalPlayer = useCallback(() => {
        const queryUnit = Players.GetLocalPlayerPortraitUnit();
        // const UnitName = Entities.GetUnitName(queryUnit);
        const netdata = CustomNetTables.GetTableValue("unit_attribute", `${queryUnit}`)
        if (netdata == null) {
            setAttributeTable({})
            setAttributeValue({})
            return
        }
        setAttributeTable(netdata.table)
        setAttributeValue(netdata.value)
    }, [])

    useEffect(() => {
        const interval = setInterval(() => { UpdateLocalPlayer(); }, 250);
        return () => clearInterval(interval);
    }, []);

    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);



    return (
        <>
            <Panel id="HeroDemoAttribute">
                <AttributeRowsHeader />
                <Panel className='AttributeRowList'>
                    <AttributeRows attr_key="AttackDamage" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="AttackRange" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="AttackSpeed" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="MoveSpeed" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="HealthPoints" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="HealthRegen" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="ManaPoints" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="ManaRegen" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="PickItemRadius" attr_value={AttributeValue} attr_table={AttributeTable} />
                    
                </Panel>

                {/* <AttributeRows attr_name='力量' attr_key='Strength' attr_value={AttributeValue} attr_table={AttributeTable} />
                <AttributeRows attr_name='敏捷' attr_key='Agility' attr_value={AttributeValue} attr_table={AttributeTable} />
                <AttributeRows attr_name='智力' attr_key='Intellect' attr_value={AttributeValue} attr_table={AttributeTable} /> */}
            </Panel>

        </>

    )
}