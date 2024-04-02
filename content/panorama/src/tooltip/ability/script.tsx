import React, { useState } from 'react';
import { render, useGameEvent } from 'react-panorama-x';

import { default as NpcAbilityCustom } from "./../../json/npc_abilities_custom.json";
import { SetAbilityDescription } from '../../utils/ability_description';


const BehaviorEmunList: { [behavior: string]: number; } = {
    "DOTA_ABILITY_BEHAVIOR_NONE": 0,
    "DOTA_ABILITY_BEHAVIOR_HIDDEN": 1,
    "DOTA_ABILITY_BEHAVIOR_PASSIVE": 2,
    "DOTA_ABILITY_BEHAVIOR_NO_TARGET": 4,
    "DOTA_ABILITY_BEHAVIOR_UNIT_TARGET": 8,
    "DOTA_ABILITY_BEHAVIOR_POINT": 16,
    "DOTA_ABILITY_BEHAVIOR_TOGGLE": 512,
    "DOTA_ABILITY_BEHAVIOR_DIRECTIONAL": 1024,
    "DOTA_ABILITY_BEHAVIOR_AUTOCAST": 4096,
};
const BehaviorList_Ability = {
    "DOTA_ToolTip_Ability_Attack": 131072,
    "DOTA_ToolTip_Ability_Aura": 65536,
    "DOTA_ToolTip_Ability_Autocast": 4096,
    "DOTA_ToolTip_Ability_Toggle": 512,
    "DOTA_ToolTip_Ability_Channeled": 128,
    "DOTA_ToolTip_Ability_Point": 16,
    "DOTA_ToolTip_Ability_Target": 8,
    "DOTA_ToolTip_Ability_NoTarget": 4,
    "DOTA_ToolTip_Ability_Passive": 2,

};

const BehaviorList_Targettype = {
    128: 'DOTA_UNIT_TARGET_CUSTOM',
    64: 'DOTA_UNIT_TARGET_TREE',
    55: 'DOTA_UNIT_TARGET_ALL',
    32: 'DOTA_UNIT_TARGET_OTHER',
    18: 'DOTA_UNIT_TARGET_BASIC',
    16: 'DOTA_UNIT_TARGET_COURIER',
    4: 'DOTA_UNIT_TARGET_BUILDING',
    2: 'DOTA_UNIT_TARGET_CREEP',
    // 1: 'DOTA_UNIT_TARGET_HERO',
    // 0: 'DOTA_UNIT_TARGET_NONE',
};

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

/**
 * 返回施法类型
 * @param cast_behavior 
 * @returns 
 */
function GetAbilityCastType(cast_behavior: number) {
    let behavior_str: string[] = []; //"DOTA_ToolTip_Ability_Passive";
    let is_auto = (cast_behavior & 4096) == 4096;
    let is_vector = (cast_behavior & 1073741824) == 1073741824;
    for (let k in BehaviorList_Ability) {
        let emun = BehaviorList_Ability[k as keyof typeof BehaviorList_Ability];
        if ((cast_behavior & emun) == emun) {
            behavior_str.push(k);
        }
    }

    //  施法类型,是否是自动,矢量
    return { behavior_str, is_auto, is_vector };
}


function GetAbilityBehavior(name: string) {
    let abilityData = NpcAbilityCustom[name as "public_phase_move"];
    let BehaviorList = abilityData.AbilityBehavior;
    let behavior_sum = 0;
    for (let behavior of BehaviorList) {
        let behavior_int = BehaviorEmunList[behavior] ?? 0;
        behavior_sum += behavior_int;
    }
    return behavior_sum;
}




export function App() {

    const [index, setIndex] = useState(0 as AbilityEntityIndex);
    const [name, setName] = useState("Loading...");
    const [description, setDescription] = useState("");
    const [level, setLevel] = useState(1);
    const [casttype, setCasttype] = useState("无目标");
    const [cooldown, setCooldown] = useState(0);
    const [mana, setMana] = useState(0);


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

        setLevel(level);
        // 行为
        const cast_behavior = GetAbilityBehavior(name);
        let casttype_object = GetAbilityCastType(cast_behavior);
        let casttype_str_list: string[] = [];
        for (let type_str of casttype_object.behavior_str) {
            casttype_str_list.push($.Localize("#" + type_str));
        }
        setCasttype(casttype_str_list.join(" / "));

    };

    const UpdateAbilityFromEntity = (entityIndex: AbilityEntityIndex, ext_int: number) => {
        const name = Abilities.GetAbilityName(entityIndex);
        setName($.Localize(`#DOTA_Tooltip_Ability_${name}`));
        const level = Abilities.GetLevel(entityIndex);
        const description = SetAbilityDescription(null, entityIndex, 1);
        setDescription(description);

        // const cooldown = Abilities.GetCooldown(entityIndex);
        const cooldown = Abilities.GetCooldownLength(entityIndex);
        const cd_str = cooldown.toFixed(1);
        setCooldown(parseFloat(cd_str));

        const mana = Abilities.GetManaCost(entityIndex);
        setMana(mana);


        setLevel(level);

        const cast_behavior = Abilities.GetBehavior(entityIndex);
        let casttype_object = GetAbilityCastType(cast_behavior);
        let casttype_str_list: string[] = [];
        for (let type_str of casttype_object.behavior_str) {
            casttype_str_list.push($.Localize("#" + type_str));
        }
        // $.Msg(["casttype_str_list",casttype_str_list])
        setCasttype(casttype_str_list.join(" / "));
    };

    // 更新面板
    $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
        let ContextPanel = $.GetContextPanel();
        let entityIndex = $.GetContextPanel().GetAttributeInt("entityIndex", 0) as AbilityEntityIndex;
        let ext_int = $.GetContextPanel().GetAttributeInt("ext_int", 0);
        // setIndex(entityIndex);
        // $.Msg(["ontooltiploaded",entityIndex])
        // $.Msg(["ext_int", ext_int]);
        if (entityIndex < 1) {
            UpdateAbilityFromName(ext_int);
        } else {
            UpdateAbilityFromEntity(entityIndex, ext_int);
        }
    });

    return (
        <Panel id="CustomTooltipAbility" className="tooltip-row" >
            <Panel id="AbilityHeader" className="flow-right">
                <Panel id="AbilityName" className="flow-right">
                    <Label className='AbilityNameLabel' html={true} text={name} />
                </Panel>
                <Panel id="AbilityLevel" className="flow-right">
                    <Label html={true} dialogVariables={{ level: `${level}` }} localizedText="#DOTA_AbilityTooltip_Level" />
                </Panel>
            </Panel>

            <Panel id="AbilityTarget" className="flow-down">
                <Panel id="AbilityTopRowContainer" className="flow-right">
                    <Label id="AbilityCastType" dialogVariables={{ casttype: casttype }} localizedText="#DOTA_AbilityTooltip_CastType" html={true} />
                </Panel>
                {/* <Label id="AbilityTargetType" localizedText="#DOTA_AbilityTooltip_TargetType" html={true} className='Hidden' /> */}
                {/* <Label id="AbilityDamageType" localizedText="#DOTA_AbilityTooltip_DamageType" html={true} className='Hidden' /> */}
            </Panel>

            <Panel id="AbilityCoreDetails" className="flow-down">
                <Panel id="DescriptionContainer" className="flow-down">
                    <Label className="DescriptionLabel" text={description} html={true} />
                    <Panel className='DamageFormula'>

                    </Panel>
                </Panel>
                <Panel id="CurrentItemCosts" className="flow-right">
                    <Label id="Cooldown" visible={cooldown > 0} text={cooldown} html={true} />
                    <Label id="ManaCost" visible={mana > 0} text={mana} html={true} />
                </Panel>
            </Panel>



        </Panel>
    );
}

render(<App />, $.GetContextPanel());