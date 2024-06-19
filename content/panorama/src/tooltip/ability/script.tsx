import { default as ArmsComboJson } from "./../../json/config/game/arms_combo.json";
import { default as NpcAbilityCustom } from "./../../json/npc_abilities_custom.json";
import { default as AbilitiesArms } from "./../../json/abilities/arms.json";
import { default as ArmsTypesJson } from "./../../json/config/game/const/arms_types.json";

import { SetAbilityDescription, GetAbilityRarity, GetAbilityTypeCategory, GetAbilityElementLabel } from '../../utils/ability_description';
import { ConvertAttributeValues, GetAbilityAttribute } from '../../utils/attribute_method';
import { GetTextureSrc } from '../../common/custom_kv_method';


let AbilityCategoryType = $("#AbilityCategoryType")
const AbilityCategoryList: ArmsTypeCategory[] = [
    "Aoe",
    "Buff",
    "Dot",
    "Grow",
    "Missile",
    "Orb",
    "Resource",
    "Summon", "Surround",
]

let m_CombiePanel: Panel[] = []

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

function GetAbilityCombo(ability_name: string) {
    let abilityData = NpcAbilityCustom[ability_name as "arms_t0_1"];
    if (abilityData && abilityData.Combo) {
        return `${abilityData.Combo}`.split(",");
    }
    return []
}

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
    // $.Msg(["name",name,"entityIndex",entityIndex])
    let ability_name: string;
    let ability_level = 1;
    let ability_cooldown = 0;

    if (entityIndex > 0) {
        ability_name = Abilities.GetAbilityName(entityIndex);
        // $.Msg(["ability_name",ability_name])
        ability_level = Abilities.GetLevel(entityIndex)
        ability_cooldown = Abilities.GetCooldown(entityIndex);
        // ability_mana = Abilities.GetManaCost(entityIndex);
    } else {
        ability_name = name;
    }
    // $.Msg([ability_name,entityIndex])
    const abilityData = NpcAbilityCustom[ability_name as "arms_t0_1"];
    if (entityIndex <= 0) {
        // cooldown
        // $.Msg(["abilityData",abilityData])
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
    }
    let ability_mana = abilityData ? (abilityData.AbilityManaCost ?? 0) : 0;
    // 图标
    const AbilityIcon = MainPanel.FindChildTraverse("AbilityIcon") as ImagePanel;

    const img_src = abilityData ? GetTextureSrc(abilityData.AbilityTextureName) : "";
    AbilityIcon.SetImage(img_src)

    // 类型
    let type_category = GetAbilityTypeCategory(ability_name);
    for (let order in ArmsTypesJson) {
        let order_key = ArmsTypesJson[order as keyof typeof ArmsTypesJson];
        // $.Msg(["order_key", order_key, type_category.indexOf(order) != -1])
        AbilityCategoryType.SetHasClass(order_key, type_category.indexOf(order) != -1)
    }
    // 属性
    let AttributeObject = GetAbilityAttribute(ability_name);
    // let attr_list = ConvertAttributeValues(AttributeObject);

    // 稀有度
    const rarity = GetAbilityRarity(ability_name)
    for (let r = 0; r < 7; r++) {
        MainPanel.SetHasClass("rarity_" + r, rarity == r);
    }

    // 元素
    const element = GetAbilityElementLabel(ability_name)
    for (let e = 1; e <= 6; e++) {
        MainPanel.SetHasClass("element_" + e, element == e);
    }

    // 羁绊
    let ComboContainer = $("#ComboContainer");
    let CombieList = GetAbilityCombo(ability_name);
    let used = 0
    for (let i = 0; i < CombieList.length; i++) {
        if (i >= m_CombiePanel.length) {
            let combiePanel = $.CreatePanel("Panel", ComboContainer, "");
            combiePanel.BLoadLayoutSnippet("ArmsCombieRows");
            m_CombiePanel.push(combiePanel)
        }
        let combe_key = CombieList[i];
        let combePanel = m_CombiePanel[i];
        combePanel.SetDialogVariable("combie_text", $.Localize("#CustomText_Combo_" + combe_key))
        combePanel.visible = true;
        let ability_list = ComboTable[combe_key] ?? [];
        let combie_state = GetCurrentAbilityGetState(ability_list)
        let combie_list_label = combie_state.label
        combePanel.SetDialogVariable("combie_list", combie_list_label)

        // arms_combie_desc
        combePanel.SetHasClass("is_activate", combie_state.state)
        if (combie_state.state) {
            let arms_combo_key = "combo_" + combe_key;
            let arms_combo_kv = ArmsComboJson[arms_combo_key as keyof typeof ArmsComboJson];
            let AbilityValues = arms_combo_kv.AbilityValues as { [key: string]: number };

            let combie_desc = $.Localize("#CustomText_" + arms_combo_key + "_Description")
            for (let k in AbilityValues) {
                let v = AbilityValues[k];
                // $.Msg(["%" + k + "%",k, v])
                combie_desc = combie_desc.replace(`%${k}%%%`, `<span class="hover">${v}%</span>`);
                combie_desc = combie_desc.replace(`%${k}%`, `<span class="hover">${v}</span>`);

            }
            // $.Msg(["combie_desc", combie_desc])
            combePanel.SetDialogVariable("combie_desc", combie_desc)
        }

        used++;
    }

    for (let i = used; i < m_CombiePanel.length; i++) {
        let combiePanel = m_CombiePanel[i];
        combiePanel.visible = false
    }





    MainPanel.SetDialogVariableInt("level", ability_level)
    MainPanel.SetDialogVariable("cooldown", `${ability_cooldown}`);
    MainPanel.SetDialogVariable("mana", `${ability_mana}`);

    // 名字与描述
    let ability_name_label = $.Localize(`#DOTA_Tooltip_Ability_${ability_name}`)
    MainPanel.SetDialogVariable("ability_name", ability_name_label);
    let description = SetAbilityDescription(ability_name, undefined, ability_level);
    MainPanel.SetDialogVariable("description", description);


}

// render(<App />, $.GetContextPanel());

const MainPanel = $.GetContextPanel();

export function Init() {

    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    let ComboContainer = $("#ComboContainer");
    ComboContainer.RemoveAndDeleteChildren();
    m_CombiePanel = [];

    // const AbilityCategoryType = $("#AbilityCategoryType");
    // AbilityCategoryType.RemoveAndDeleteChildren();

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