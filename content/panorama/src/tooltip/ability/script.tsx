import React, { useMemo, useState } from 'react';
import { render, useGameEvent } from 'react-panorama-x';

import { default as ArmsCombo } from "./../../json/config/game/arms_combo.json";
import { default as NpcAbilityCustom } from "./../../json/npc_abilities_custom.json";
import { default as AbilitiesArms } from "./../../json/abilities/arms.json";

import { SetAbilityDescription, GetAbilityRarity } from '../../utils/ability_description';
import { ConvertAttributeValues, GetAbilityAttribute } from '../../utils/attribute_method';





export function InitAbilityCombo() {
    let ComboTable: { [comb_key: string]: string[] } = {};
    for (let name in AbilitiesArms) {
        let row_data = AbilitiesArms[name as "arms_t0_1"];
        if (row_data && row_data.Combo) {
            let row_Combo = `${row_data.Combo}`.split(" ");
            for (let Combo of row_Combo) {
                let combe_key = Combo.split(",")
                for (let key of combe_key) {
                    if (ComboTable[key] == null) {
                        ComboTable[key] = []
                    }
                    ComboTable[key].push(name)
                }
            }
        }
    }
    return ComboTable
}

const ComboTable = InitAbilityCombo();

export function GetAbilityCombo(ability_name: string) {
    let abilityData = NpcAbilityCustom[ability_name as "arms_t0_1"];
    if (abilityData && abilityData.Combo) {
        return `${abilityData.Combo}`.split(",");
    }
    return []
}

const ArmsCombieRows = ({ combe_key }: { combe_key: string }) => {

    let ability_list = ComboTable[combe_key] ?? [];
    // $.Msg(["ability_list", ability_list])
    return (
        <Panel className='ArmsCombieRows'>
            <Panel className='Header'>
                <Label className='Title' text={$.Localize("#CustomText_Combo_" + combe_key)} />
                <Label className='Desc' text={$.Localize("#CustomText_Combo_" + combe_key + "_Description")} />
            </Panel>
            <Panel className='CombieAbility'>
                {
                    ability_list.map((v, k) => {
                        return <Label text={$.Localize("#DOTA_Tooltip_Ability_" + v)} key={k} />
                    })
                }
            </Panel>
        </Panel>
    )
}
// export function 
/**
 * 格式化伤害公式
 * @param Formula 
 * @returns 
 */
export function FormatDamageFormula(Formula: string) {
    if (Formula) {
        if (parseInt(Formula) == 0) { return ""; }
        let patt = /[\*\+\-\/\(\)]/g;
        let strFormula = Formula.replace(patt, " ").split(" ");
        let text_list = [];

        for (let k of strFormula) {
            let value = parseFloat(k) ? parseFloat(k) : k;
            let temp = "";
            if (typeof (value) == "number") {
                let num_text = String(value);
                let p1 = num_text.search(/\./g);
                if (p1 == 1) {
                    temp = `<span class="val">${value * 100}%</span>`;
                } else {
                    temp = `<span class="val">${value}</span>`;
                }

            } else if (typeof (value) == "string" && value != "(" && value != ")" && value.length > 0) {
                temp = `<span class="key">${$.Localize("#dota_custom_attribute_" + value)}</span>`;
            }
            text_list.push(temp);
        }
        let text = "";
        let fuhao_list = Formula.match(patt);
        for (let i in text_list) {
            let idx = parseInt(i);
            let temp = "";
            if (idx > 0 && fuhao_list) {
                temp += fuhao_list[idx - 1];
            }
            temp += text_list[i];
            text += temp;
        }
        return text;
    } else {
        return "";
    }
}


export function App() {

    const [Rarity, setRarity] = useState(0);
    const [index, setIndex] = useState(0 as AbilityEntityIndex);
    const [AbilityName, setAbilityName] = useState("")
    const [name, setName] = useState("Loading...");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState(1);
    const [attributes, setAttributes] = useState("");
    // const [casttype, setCasttype] = useState("无目标");
    const [cooldown, setCooldown] = useState(0);
    const [mana, setMana] = useState(0);

    const [ComboList, setComboList] = useState<string[]>([])

    const UpdateAbilityFromName = (ext_int: number) => {
        const name = $.GetContextPanel().GetAttributeString("name", "");
        const level = $.GetContextPanel().GetAttributeInt("item_level", 1);
        const abilityData = NpcAbilityCustom[name as "public_phase_move"];
        setName($.Localize(`#DOTA_Tooltip_Ability_${name}`));
        const description = SetAbilityDescription(name, undefined, level);
        setDescription(description);

        // 冷却
        // $.Msg(abilityData.AbilityCooldown);
        let AbilityCooldown = abilityData.AbilityCooldown as string | number;
        if (AbilityCooldown != null) {
            let cd_num = 0;
            if (typeof (AbilityCooldown) == "string") {
                cd_num = parseFloat(AbilityCooldown.split(" ")[0]);

            } else {
                cd_num = AbilityCooldown;
            }
            setCooldown(cd_num);
        } else {
            setCooldown(0);
        }

        let AttributeObject = GetAbilityAttribute(name);
        let attr_list = ConvertAttributeValues(AttributeObject);
        setAttributes(attr_list);

        setLevel(level);
        setRarity(GetAbilityRarity(name))
        setComboList(GetAbilityCombo(name))
        setAbilityName(name)
    };

    const UpdateAbilityFromEntity = (entityIndex: AbilityEntityIndex, ext_int: number) => {
        const name = Abilities.GetAbilityName(entityIndex);
        setName($.Localize(`#DOTA_Tooltip_Ability_${name}`));
        const level = Abilities.GetLevel(entityIndex);
        const description = SetAbilityDescription(null, entityIndex, 1);
        setDescription(description);
        const cooldown = Abilities.GetCooldown(entityIndex);
        // const cooldown = Abilities.GetCooldownLength(entityIndex);
        // $.Msg(["cooldown",cooldown])
        const cd_str = cooldown.toFixed(1);
        setCooldown(parseFloat(cd_str));
        const mana = Abilities.GetManaCost(entityIndex);
        setMana(mana);
        setLevel(level);
        setRarity(GetAbilityRarity(name))
        setComboList(GetAbilityCombo(name))
        let AttributeObject = GetAbilityAttribute(name);
        let attr_list = ConvertAttributeValues(AttributeObject);
        setAttributes(attr_list);
        setAbilityName(name)
    };

    // 更新面板
    $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
        let ContextPanel = $.GetContextPanel();
        let entityIndex = $.GetContextPanel().GetAttributeInt("entityIndex", 0) as AbilityEntityIndex;
        let ext_int = $.GetContextPanel().GetAttributeInt("ext_int", 0);
        let name = $.GetContextPanel().GetAttributeString("name", "");
        // setIndex(entityIndex);
        // $.Msg(["ontooltiploaded",entityIndex])
        // $.Msg(["ext_int", ext_int]);
        if (entityIndex < 1) {

            UpdateAbilityFromName(ext_int);
        } else {
            UpdateAbilityFromEntity(entityIndex, ext_int);
        }
    });

    return useMemo(() => (
        <Panel
            id="CustomTooltipAbility"
            className={`tooltip-row rarity_${Rarity}`}
            onload={(e) => {
                let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
                $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
                $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
                m_TooltipPanel.FindChild('TopArrow')!.visible = false;
                m_TooltipPanel.FindChild('BottomArrow')!.visible = false;
            }}
        >
            <Panel id="AbilityHeader" className="flow-right">
                <Panel className='AbilityImage'>
                    <DOTAAbilityImage id='AbilityImage' hittest={false} abilityname={AbilityName} />
                </Panel>
                <Panel className='AbilityLabel'>
                    <Panel className='NameAndCost'>
                        <Panel id="AbilityName" className="flow-right">
                            <Label className='AbilityNameLabel' html={true} text={name} />
                            {/* <Label html={true} dialogVariables={{ level: `${level}` }} localizedText="#DOTA_AbilityTooltip_Level" /> */}
                        </Panel>
                        <Panel id="CurrentItemCosts" className="flow-right">
                            <Label id="Cooldown" visible={cooldown > 0} text={cooldown} html={true} />
                            <Label id="ManaCost" visible={mana > 0} text={mana} html={true} />
                        </Panel>
                    </Panel>
                    <Panel className='Category'>
                        <Label text={"范围型"} />
                    </Panel>
                </Panel>
            </Panel>

            <Panel id="AbilityTarget" className="flow-down" visible={false}>
                <Panel id="AbilityTopRowContainer" className="flow-right">
                    {/* <Label id="AbilityCastType" dialogVariables={{ casttype: casttype }} localizedText="#DOTA_AbilityTooltip_CastType" html={true} /> */}
                </Panel>
                {/* <Label id="AbilityTargetType" localizedText="#DOTA_AbilityTooltip_TargetType" html={true} className='Hidden' /> */}
                {/* <Label id="AbilityDamageType" localizedText="#DOTA_AbilityTooltip_DamageType" html={true} className='Hidden' /> */}
            </Panel>

            <Panel id="AbilityCoreDetails" className="flow-down">
                <Label className={`Attribute ${attributes && "show"}`} text={attributes} html={true} />
                <Panel id="DescriptionContainer" className="flow-down">
                    <Label className="DescriptionLabel" text={description} html={true} />
                </Panel>
                <Panel id='ComboContainer' visible={ComboList.length > 0}>
                    {
                        ComboList.map((v, k) => {
                            return <ArmsCombieRows combe_key={v} key={k} />
                        })
                    }
                </Panel>
            </Panel>
        </Panel>
    ), [AbilityName]);
}

render(<App />, $.GetContextPanel());