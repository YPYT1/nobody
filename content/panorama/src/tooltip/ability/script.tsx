import { default as NpcAbilityCustom } from "./../../json/npc_abilities_custom.json";
import { default as AbilityTypesJson } from "./../../json/config/game/const/ability_types.json";

import { SetAbilityDescription, GetAbilityRarity, SetLabelDescriptionExtra } from '../../utils/ability_description';
import { ConvertAttributeValues } from '../../utils/attribute_method';
import { GetTextureSrc } from '../../common/custom_kv_method';
import { GetHeroTalentTreeObject, GetHeroTalentTreeRowData } from "../../common/custom_talent";
import { FormatDescription } from "../../utils/method";
import { ELEMENT_KEYS_LIST } from "../../utils/element_bond";


// type xx = keyof typeof AbilityTypesJson
let AbilityCategoryType = $("#AbilityCategoryType")


const MainPanel = $.GetContextPanel();
const TalentAbilityExtra = $("#TalentAbilityExtra");
const AbilityElement = $("#AbilityElement");

function GetCurrentAbilityGetState(ability_list: string[]) {
    let m_QueryUnit = Players.GetLocalPlayerPortraitUnit();
    let res_label: string[] = [];
    let has_abilities: string[] = [];
    let is_activate = true;
    for (let i = 0; i < 6; i++) {
        let ability_entity = Entities.GetAbility(m_QueryUnit, i)
        let ability_name = Abilities.GetAbilityName(ability_entity)
        if (has_abilities.indexOf(ability_name) == -1) {
            has_abilities.push(ability_name)
        }
    }
    for (let ability of ability_list) {
        let is_has = has_abilities.indexOf(ability) != -1;
        if (is_has == false) { is_activate = false }
        let text = `<span class="${is_has ? "on" : "off"}">${$.Localize("#DOTA_Tooltip_Ability_" + ability)}</span>`;
        res_label.push(text)
    }

    return { "label": res_label.join("  +  "), "state": is_activate };
}

const SetAbilityBaseInfo = (name: string, entityIndex: AbilityEntityIndex) => {
    let ability_name: string;
    let ability_level = 1;
    let ability_cooldown = 0;
    let in_slot = -1;
    if (entityIndex > 0) {
        ability_name = Abilities.GetAbilityName(entityIndex);
        // $.Msg(["ability_name",ability_name])
        ability_level = Abilities.GetLevel(entityIndex)
        ability_cooldown = Abilities.GetCooldown(entityIndex);
        // ability_mana = Abilities.GetManaCost(entityIndex);
        in_slot = $.GetContextPanel().GetAttributeInt("slot", -1);
    } else {
        ability_name = name;
    }
    // $.Msg([ability_name,entityIndex])
    const abilityData = NpcAbilityCustom[ability_name as "drow_1"];
    let ability_mana = 0;
    if (entityIndex <= 0) {
        // cooldown
        // $.Msg(["abilityData",abilityData])
        ability_mana = abilityData ? (abilityData.AbilityManaCost ?? 0) : 0;
        let AbilityCooldown = (abilityData ? abilityData.AbilityCooldown : 0) as string | number;
        // $.Msg(AbilityCooldown)
        if (AbilityCooldown != null) {
            let cd_num = 0;
            if (typeof (AbilityCooldown) == "string") {
                cd_num = parseFloat(AbilityCooldown.split(" ")[0]);
            } else {
                cd_num = AbilityCooldown;
            }
            ability_cooldown = cd_num
        } else {
            ability_cooldown = 0
        }

        // mana
    } else {
        ability_mana = Abilities.GetManaCost(entityIndex);
        // let mana_fra = Entities.ManaFraction(entityIndex)
        // $.Msg(["entityIndex",entityIndex,ability_mana])
    }



    // 图标
    const AbilityIcon = MainPanel.FindChildTraverse("AbilityIcon") as ImagePanel;
    const img_src = abilityData ? GetTextureSrc(abilityData.AbilityTextureName) : "";
    AbilityIcon.SetImage(img_src)

    // 技能类型 技能元素
    if (entityIndex > 0) {
        let nt_data = CustomNetTables.GetTableValue("custom_ability_types", `${entityIndex}`)
        // $.Msg(nt_data)
        if (nt_data) {
            let skv_type = nt_data.skv_type
            for (let order_key in skv_type) {
                let is_has = skv_type[order_key as keyof typeof skv_type] == 1;
                // $.Msg(["order_key", order_key, is_has])
                AbilityCategoryType.SetHasClass(order_key, is_has)
            }
            let element_list = Object.values(nt_data.element_type);
            for (let i = 1; i <= 6; i++) {
                let element_key = ELEMENT_KEYS_LIST[i];
                let has_element = element_list.indexOf(i) != -1;
                // $.Msg(["element_key", element_key, has_element])
                AbilityElement.SetHasClass(element_key, has_element)
            }
        } else {
            ResetAbilityElementAndType()
        }
    } else {
        ResetAbilityElementAndType()
    }

    // let type_category = GetAbilityTypeCategory(ability_name);
    // $.Msg(["type_category",type_category])
    // for (let order_key in ArmsTypesJson) {
    //     // let order_key = ArmsTypesJson[order as keyof typeof ArmsTypesJson];
    //     // $.Msg(["order_key", order_key, type_category.indexOf(order_key) != -1])
    //     AbilityCategoryType.SetHasClass(order_key, type_category.indexOf(order_key) != -1)
    // }

    // 属性
    // let AttributeObject = GetAbilityAttribute(ability_name);
    // let attr_list = ConvertAttributeValues(AttributeObject);


    // 稀有度
    // const rarity = GetAbilityRarity(ability_name)
    // for (let r = 1; r <= 7; r++) {
    //     MainPanel.SetHasClass("rarity_" + r, rarity == r);
    // }

    // 元素
    // const element = GetAbilityElementLabel(ability_name)
    // for (let e = 1; e <= 6; e++) {
    //     MainPanel.SetHasClass("element_" + e, false);
    // }

    MainPanel.SetDialogVariableInt("level", ability_level)
    MainPanel.SetDialogVariable("cooldown", `${ability_cooldown}`);

    // 耗蓝耗血
    const queryUnit = Players.GetLocalPlayerPortraitUnit();
    const is_blood_mage = Entities.GetAbilityByName(queryUnit, "special_blood_mage") != -1;
    MainPanel.SetHasClass("blood_mage", is_blood_mage)
    if (is_blood_mage) {
        let health_cost = Entities.GetMaxHealth(queryUnit) * 0.01
        MainPanel.SetDialogVariable("health", `${health_cost.toFixed(0)}`);
    } else {
        MainPanel.SetDialogVariable("mana", `${ability_mana}`);
    }


    // 名字与描述
    let ability_name_label = $.Localize(`#DOTA_Tooltip_Ability_${ability_name}`)
    MainPanel.SetDialogVariable("ability_name", ability_name_label);

    SetExtraAbilityDesc(ability_name, ability_level);

    // 伤害计算
    // let base_value = abilityData.AbilityValues.base_value;
    // $.Msg(["base_value",base_value])
    // MainPanel.SetDialogVariable("damage_number","")
}

function ResetAbilityElementAndType() {
    // 重置类型
    for (let type_key in AbilityTypesJson) {
        AbilityCategoryType.SetHasClass(type_key, false)
    }
    // 重置元素
    for (let i = 1; i <= 6; i++) {
        let element_key = ELEMENT_KEYS_LIST[i];
        AbilityElement.SetHasClass(element_key, false)
    }
}

function SetExtraAbilityDesc(ability_name: string, ability_level: number) {
    const QueryUnit = Players.GetLocalPlayerPortraitUnit();
    let player_id = Entities.GetPlayerOwnerID(QueryUnit)
    let description = "";//SetAbilityDescription(ability_name, ability_level, false);
    let is_hero = Entities.IsHero(QueryUnit);
    if (!is_hero) {
        MainPanel.SetDialogVariable("description", description);
        return
    }
    let heroname = Entities.GetUnitName(QueryUnit).replace("npc_dota_hero_", "")
    let talent_data = GetHeroTalentTreeObject();

    TalentAbilityExtra.RemoveAndDeleteChildren();

    // $.Msg(["heroname", heroname, ability_name])
    let in_slot = $.GetContextPanel().GetAttributeInt("slot", -1);
    let netdata = CustomNetTables.GetTableValue("hero_talent", `${player_id}`)
    // $.Msg(netdata)
    let extra_desc = ""
    MainPanel.SetDialogVariable("description", "");
    if (netdata != null) {
        for (let key in talent_data) {
            let level = 0;
            if (netdata[key]) { level = netdata[key].uc }
            if (level <= 0) { continue }
            let row_data = talent_data[key as keyof typeof talent_data]
            let link_ability = row_data.link_ability;

            if (link_ability == ability_name || (row_data.tier_number == 99 && (row_data.index - 1) == in_slot)) {
                let is_ability = row_data.is_ability == 1;
                let parent_ability_key = row_data.parent_ability_key;
                if (parent_ability_key != "null" && parent_ability_key != key  ){
                    let parent_data = talent_data[parent_ability_key as keyof typeof talent_data]
                    let talent_desc = $.Localize(`#custom_talent_${parent_ability_key}_desc`)
                    let desc = SetLabelDescriptionExtra(talent_desc, ability_level, parent_data.AbilityValues, parent_data.ObjectValues, false);
                    MainPanel.SetDialogVariable("description", desc);
                }
                let extra_panel = $.CreatePanel("Panel", TalentAbilityExtra, "");;
                extra_panel.BLoadLayoutSnippet("ExtraAbility");
                extra_panel.SetHasClass("IsAbility", is_ability);
                extra_panel.SetDialogVariableInt("talent_level", level);
                extra_panel.SetDialogVariableInt("talent_max", row_data.max_number);

                let TalentIcon = extra_panel.FindChildTraverse("TalentIcon") as ImagePanel;
                let texture = row_data.img;
                TalentIcon.SetImage(GetTextureSrc(texture))
                let title = $.Localize(`#custom_talent_${key}`)
                extra_panel.SetDialogVariable("extra_title", title)

                let TalentData = GetHeroTalentTreeRowData(key);
                let talent_desc = $.Localize(`#custom_talent_${key}_desc`)
                let extra_desc = SetLabelDescriptionExtra(talent_desc, level - 1, TalentData.AbilityValues, TalentData.ObjectValues, true);
                let description_lv2 = $.Localize(`#custom_talent_${key}_desc_lv2`);
                if (description_lv2.indexOf("#") != 0) {
                    let is_act = level >= 2;
                    let desc_lv2 = SetLabelDescriptionExtra(description_lv2, 1, TalentData.AbilityValues, TalentData.ObjectValues, true);
                    extra_desc += `<br><span class="${is_act ? "on" : "off"}">${desc_lv2}</span>`
                }

                extra_panel.SetDialogVariable("extra_desc", extra_desc)
            }

            // 
        }
    }

    // 
}



export function Init() {

    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    MainPanel.SetPanelEvent("ontooltiploaded", () => {
        // UpdateTooltip()
        // let ContextPanel = $.GetContextPanel();
        let entityIndex = $.GetContextPanel().GetAttributeInt("entityIndex", 0) as AbilityEntityIndex;
        let name = $.GetContextPanel().GetAttributeString("name", "");
        // $.Msg(["ontooltiploaded",name,entityIndex])
        SetAbilityBaseInfo(name, entityIndex)
    });
}

(function () {
    Init()
})();