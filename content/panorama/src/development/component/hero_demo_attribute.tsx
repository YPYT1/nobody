import { useCallback, useEffect, useMemo, useState } from 'react';
import { useGameEvent, useNetTableKey, useNetTableValues } from 'react-panorama-x';
import { HideCustomTooltip, ShowCustomTextTooltip } from '../../utils/custom_tooltip';
import { default as NpcAbilitiesCustom } from "./../../json/npc_abilities_custom.json";
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

const AbilityKvRowEditor = ({ entity, kv_key, kv_value }: { entity: AbilityEntityIndex; kv_key: string; kv_value: number }) => {

    let real_value = Abilities.GetSpecialValueFor(entity, kv_key) ?? 0
    const [value, setValue] = useState(entity ? Abilities.GetSpecialValueFor(entity, kv_key) : 0)
    const [AttrSubKey, setAttrSubKey] = useState<AbilitySpecialTypes>("Base");
    const ability_name = Abilities.GetAbilityName(entity)
    let vvvvv = CustomNetTables.GetTableValue("unit_special_value", "0");


    // 
    // if (vvvvv && vvvvv[ability_name] != null) {
    //     let data = vvvvv[ability_name];
    //     let special_data = data[kv_key];
    //     if (special_data){
    //         let cache_value = special_data.cache_value ?? 0
    //         real_value = cache_value
    //     }
    // }

    return (
        <Panel className='AbilityKvRowEditor flow-right'>
            <Label className='KvKey' text={kv_key} />
            <Label className='KvValue' text={real_value} />
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
                        let sub_key = e.GetSelected().id as AbilitySpecialTypes;
                        setAttrSubKey(sub_key)
                    }}
                >
                    <Label id={"Base"} text={"Base"} />
                    <Label id={"Percent"} text={"Percent"} />
                </DropDown>
            </Panel>

            <Button
                className='fc-tool-button'
                onactivate={() => {
                    if (!entity) { return }

                    GameEvents.SendCustomGameEventToServer("Development", {
                        event_name: "ModiyAbilitySpecialValue",
                        params: {
                            ability_name: Abilities.GetAbilityName(entity),
                            special_type: AttrSubKey,
                            special_key: kv_key,
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
const AbilityKeyValueEditor = ({ ability_entity }: { ability_entity?: AbilityEntityIndex }) => {
    let ability_name = ""
    let ability_keyvalue: { [key: string]: number } = {}
    if (ability_entity) {
        ability_name = Abilities.GetAbilityName(ability_entity);
        let kv_data = NpcAbilitiesCustom[ability_name as keyof typeof NpcAbilitiesCustom];
        if (kv_data) {
            ability_keyvalue = kv_data.AbilityValues as { [key: string]: number };
        }
    }


    return useMemo(() => (
        <Panel id='AbilityKeyValueEditor'>
            <Label text={ability_name} />
            <Panel className='KeyValueTable'>
                {
                    Object.entries(ability_keyvalue).map((v, k) => {
                        if (ability_entity) {
                            return <AbilityKvRowEditor key={k} kv_key={v[0]} kv_value={v[1]} entity={ability_entity} />
                        }

                    })
                }
            </Panel>
        </Panel>
    ), [ability_entity])
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
            <Panel id='AbilityEditorList'>
                {
                    Array(4).fill(0).map((v, k) => {
                        let ability_entity = Entities.GetAbility(QueryUnit, k)
                        return <AbilityButtonRow
                            key={k}
                            entity={ability_entity}
                            Btnhandle={setAbilityHandle}
                        />
                    })
                }
            </Panel>
            <Panel id='AbilityKeyValue'>
                <AbilityKeyValueEditor ability_entity={AbilityEnti} />
            </Panel>
        </Panel>

    )
}


export const HeroEditor = () => {

    const [ToolRadioGroup, setToolRadioGroup] = useState(0);

    return (
        <>
            <Panel className="fc-tool-row">
                <RadioButton
                    className='fc-tool-button'
                    group='tool_radio_group'
                    selected={true}
                    onactivate={() => { setToolRadioGroup(0) }}
                >
                    <Label text="属性操作" />
                </RadioButton>
                <RadioButton className='fc-tool-button' group='tool_radio_group' onactivate={() => { setToolRadioGroup(1) }}>
                    <Label text="技能KV调整" />
                </RadioButton>
            </Panel>
            <Panel id='HeroEditor' className={"fc-tool-row group_" + ToolRadioGroup}>
                <HeroDemoAttribute />
                <HeroEditorAbility />
            </Panel>
        </>
    )

} 