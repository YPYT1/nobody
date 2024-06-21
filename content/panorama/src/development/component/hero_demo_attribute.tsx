import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameEvent, useNetTableKey, useNetTableValues } from 'react-panorama-x';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../../utils/custom_tooltip';
import { default as NpcAbilitiesCustom } from "./../../json/npc_abilities_custom.json";
import { default as attribute_const } from "./../../json/config/game/attribute_const.json"
import { default as special_keyvalue } from "./../../json/config/game/special_keyvalue.json"

const LocalPlayerID = Players.GetLocalPlayer();
const attr_sub_key_list = Object.keys(Object.values(attribute_const)[0].AbilityValues);

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
        <Panel className='table-row AttributeRows'>
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
                        className='btn'
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
        </Panel>
    )
}

const HeroDemoAttribute = () => {

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

    // useEffect(() => {
    //     const interval = setInterval(() => { UpdateLocalPlayer(); }, 250);
    //     return () => clearInterval(interval);
    // }, []);

    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);

    return (
        <>
            <Panel id="HeroDemoAttribute" className='table'>
                <Panel
                    className='table-head AttributeRows'
                    onmouseover={(e) => {
                        ShowCustomTextTooltip(e, "属性加成说明", `(白字 * (1 + 白字加成) + 绿字 ) * (1 + 总加成 ) + ( 绿字 * 绿字加成 ) + 固定值`)
                    }}
                    onmouseout={() => {
                        HideCustomTooltip()
                    }}
                >
                    <Label className='AttrName' text={"属性名"} />
                    <Label className='AttrTotal' text={"总值"} />
                </Panel>
                <Panel className='table-body AttributeRowList'>
                    <AttributeRows attr_key="AttackDamage" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="PhyicalArmor" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="AttackRange" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="AttackSpeed" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="MoveSpeed" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="HealthPoints" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="HealthRegen" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="ManaPoints" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="ManaRegen" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="PickItemRadius" attr_value={AttributeValue} attr_table={AttributeTable} />

                    <AttributeRows attr_key="Fire_DamageMul" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="Ice_DamageMul" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="Thunder_DamageMul" attr_value={AttributeValue} attr_table={AttributeTable} />
                    <AttributeRows attr_key="Wind_DamageMul" attr_value={AttributeValue} attr_table={AttributeTable} />
                </Panel>
            </Panel>
        </>
    )
}


const AbilityButtonRow = ({ entity, Btnhandle }: { entity: AbilityEntityIndex, Btnhandle: (e: AbilityEntityIndex) => void }) => {

    return (
        <Button className='AbilityButtonRow' onactivate={() => { Btnhandle(entity) }}>
            <DOTAAbilityImage contextEntityIndex={entity} />
        </Button>
    )
}

const RowOverrideKvEditor = ({ kv_key }: { kv_key: string }) => {



    // const [KvValue, setKvValue] = useState("")
    const [value, setValue] = useState(0)
    const [AttrSubKey, setAttrSubKey] = useState<OverrideSpecialBonusTypes>("Base");

    useGameEvent("CustomOverrideAbility_UpdateSpecialValue", event => {
        let data = event.data;
        // $.Msg(["key", kv_key])
        let kv_data = data[kv_key];
        if (kv_data) {
            let value = [
                kv_data.base_value ?? 0,
                kv_data.percent_value ?? 0,
                kv_data.mul_value ?? 0,
                kv_data.correct_value ?? 0
            ]
            // $.Msg(["has value",value,value.join("|")])
            let mainPanel = $(`#AbilityKvRowEditor_${kv_key}`)

            mainPanel.SetDialogVariable("kv_text", value.join(" | "))
            // setKvValue()
        }


    })

    // unit_special_value
    // const netdata = CustomNetTables.GetTableValue("unit_special_value", `${LocalPlayerID}`) ?? {};
    // $.Msg(["netdata",netdata])
    // let kv_data = netdata[kv_key];
    // let KvValue = 0
    // if (kv_data) { KvValue = kv_data.cache_value ?? 0; }
    // $.Msg(["KvValue", kv_key, KvValue]);

    return (
        <Panel
            id={`AbilityKvRowEditor_${kv_key}`}
            className='AbilityKvRowEditor flow-right'
            onload={(e) => {
                e.SetDialogVariable("kv_text", "0")
            }}
        >
            <Label className='KvKey'
                text={kv_key}
                onmouseover={(e) => {
                    ShowCustomTextTooltip(e, "#custom_special_key_" + kv_key, kv_key)
                }}
                onmouseout={() => {
                    HideCustomTooltip()
                }}
            />
            <Label className='KvValue' localizedText='{s:kv_text}' />
            <TextEntry
                className='TextEntry'
                textmode="numeric"
                text={`0`}
                ontextentrychange={(e) => {
                    let value = parseFloat(e.text);
                    setValue(value)
                }}
            />
            <Panel className='AttrList'>
                <DropDown
                    id='AttrListDrop'
                    onload={(e) => {
                        e.SetSelected(`Base`);
                    }}

                    oninputsubmit={(e) => {
                        let sub_key = e.GetSelected().id as OverrideSpecialBonusTypes;
                        setAttrSubKey(sub_key)
                    }}
                >
                    <Label id={"Base"} text={"Base"} />
                    <Label id={"Percent"} text={"Percent"} />
                    <Label id={"Multiple"} text={"Multiple"} />
                    <Label id={"Correct"} text={"Correct"} />
                </DropDown>
            </Panel>

            <Button
                className='btn'
                onactivate={() => {
                    GameEvents.SendCustomGameEventToServer("Development", {
                        event_name: "ModiyOverrideSpecialValue",
                        params: {
                            special_key: kv_key as OverrideSpecialKeyTypes,
                            special_type: AttrSubKey,
                            special_value: value,
                        }
                    })
                }}
            >
                <Label text={"修改"} />
            </Button>


        </Panel>
    )
}

const OverrideKeyList = Object.keys(special_keyvalue);
const OverrideSpecialValueEditor = () => {

    // overri
    return (
        <Panel
            id='AbilityKeyValueEditor'
            onload={(e) => {
                GameEvents.SendCustomGameEventToServer("CustomOverrideAbility", {
                    event_name: "GetUpdateSpecialValue",
                    params: {}
                })
            }}
        >
            <Panel className='KeyValueTable'>
                {
                    Object.keys(special_keyvalue).map((v, k) => {
                        return <RowOverrideKvEditor key={k} kv_key={v as keyof typeof special_keyvalue} />
                    })
                }
            </Panel>
        </Panel>
    )
}

const HeroEditorAbility = () => {

    const [QueryUnit, setQueryUnit] = useState(Players.GetLocalPlayerPortraitUnit())
    const [AbilityEnti, setAbilityEnti] = useState<AbilityEntityIndex>()
    // const [AbilityEnti, setAbilityEnti] = useState(-1)

    const UpdateLocalPlayer = useCallback(() => {
        setQueryUnit(Players.GetLocalPlayerPortraitUnit())
    }, [])

    const setAbilityHandle = useCallback((e: AbilityEntityIndex) => {
        setAbilityEnti(e)
    }, [])

    useGameEvent("dota_player_update_selected_unit", UpdateLocalPlayer, []);
    useGameEvent("dota_player_update_query_unit", UpdateLocalPlayer, []);

    // UpdateLocalPlayer();

    return (
        <Panel id="HeroEditorAbility">
            <OverrideSpecialValueEditor />
        </Panel>

    )
}


export const HeroEditor = () => {

    const [ToolRadioGroup, setToolRadioGroup] = useState(0);

    return (
        <Panel className='content'>
            <Panel className="row btn-group">
                <RadioButton
                    className='btn'
                    group='tool_radio_group'
                    selected={true}
                    onactivate={() => { setToolRadioGroup(0) }}
                >
                    <Label text="属性操作" />
                </RadioButton>
                <RadioButton className='btn' group='tool_radio_group' onactivate={() => { setToolRadioGroup(1) }}>
                    <Label text="技能KV调整" />
                </RadioButton>
            </Panel>
            <Panel id='HeroEditor' className={"row group_" + ToolRadioGroup}>
                <HeroDemoAttribute />
                <HeroEditorAbility />
            </Panel>
        </Panel>
    )

} 