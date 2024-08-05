import { ConvertAttributeToLabel } from "../../../utils/attribute_method";

const HeroInfoBtn = $("#HeroInfoBtn") as Button;
const HeroAttributeContainer = $("#HeroAttributeContainer");
const BaseAttributeList = $("#BaseAttributeList");
const AdvAttributeList = $("#AdvAttributeList");
const base_attribute_list: AttributeMainKey[] = [
    "MaxHealth",
    "MaxMana",
    "AttackDamage",
    "AttackSpeed",
    "AttackRange",
    "PhyicalArmor",
    "MoveSpeed",
    "AbilityHaste",
]

const adv_attribute_list: AttributeMainKey[] = [
    "CriticalChance",
    "CriticalDamage",
    "PickItemRadius",
    "DamageBonusMul",
    "FinalDamageMul",
    "AllElementDamageBonus",
    "AllElementPent",
    "AllElementResist",
]

const Attributelist: AttributeMainKey[] = ["AttackDamage", "PhyicalArmor", "MoveSpeed"];

let AttributeRowsList: { [key in AttributeMainKey]?: Panel } = {}

const StartUpdateData = () => {
    UpdataAttributeData()
    $.Schedule(0.3, StartUpdateData)
}

const UpdataAttributeData = () => {
    let MainPanel = $.GetContextPanel()
    let AttributeState = MainPanel.FindChildTraverse("AttributeState");
    const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());
    //Players.GetLocalPlayerPortraitUnit();
    if (AttributeState) {
        AttributeState.SetDialogVariableInt("level", Entities.GetLevel(queryUnit))
    }

    const netdata = CustomNetTables.GetTableValue("unit_attribute", `${queryUnit}`)
    if (netdata == null) { return }
    // 扩展数据
    let show = netdata.show;
    let value = netdata.value
    // $.Msg(["show",show.AttackDamage])

    for (let _key in AttributeRowsList) {
        let attr_key = _key as AttributeMainKey
        let attrPanel = AttributeRowsList[attr_key];
        if (attrPanel) {
            attrPanel.SetDialogVariable("attr_value", `${value[attr_key] ?? 0}`)
        }
    }

    for (let _attr in value) {
        let attr_key = _attr as AttributeMainKey
        let PanelAttributeRow = HeroAttributeContainer.FindChildTraverse(attr_key);
        if (PanelAttributeRow) {
            PanelAttributeRow.SetDialogVariable("stat_value", ConvertAttributeToLabel(attr_key, value[attr_key]))
        }
    }
    // AttributeRowsList["AttackDamage"]?.SetDialogVariable("attr_value", `${value.AttackDamage}`)
    // AttributeRowsList["MoveSpeed"]?.SetDialogVariable("attr_value", `${Entities.GetMoveSpeedModifier(queryUnit, Entities.GetBaseMoveSpeed(queryUnit))}`)
    // AttributeRowsList["PhyicalArmor"]?.SetDialogVariable("attr_value", `${value.PhyicalArmor}`)
}

export const CreatePanel_AttributeState = () => {
    let MainPanel = $.GetContextPanel()
    let AttributeState = MainPanel.FindChildTraverse("AttributeState");
    if (AttributeState == null) {
        $.Schedule(0.3, CreatePanel_AttributeState)
        return
    }

    const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer())
    AttributeState.SetDialogVariableInt("level", Entities.GetLevel(queryUnit))
    let UnitAttribute = AttributeState.FindChildTraverse("UnitAttribute");
    if (UnitAttribute) {
        UnitAttribute.RemoveAndDeleteChildren();
        for (let attr_key of Attributelist) {
            let AttributeRows = $.CreatePanel("Panel", UnitAttribute, attr_key);
            AttributeRows.BLoadLayoutSnippet("HudAttributeRow");
            AttributeRows.SetDialogVariable("attr_value", "0")
            AttributeRowsList[attr_key] = AttributeRows
        }
    }

    UpdataAttributeData()
    StartUpdateData();
}

const InitHeroDetailsPanel = () => {

    BaseAttributeList.RemoveAndDeleteChildren()
    for (let _attr of base_attribute_list) {
        let PanelAttributeRow = $.CreatePanel("Panel", BaseAttributeList, _attr);
        PanelAttributeRow.BLoadLayoutSnippet("PanelAttributeRow")
        PanelAttributeRow.SetDialogVariable("stat_label", $.Localize(`#custom_attribute_${_attr}`).replace("%", ""))
        PanelAttributeRow.SetDialogVariable("stat_value", ConvertAttributeToLabel(_attr, 0))

    }

    AdvAttributeList.RemoveAndDeleteChildren()
    for (let _attr of adv_attribute_list) {
        let PanelAttributeRow = $.CreatePanel("Panel", AdvAttributeList, _attr);
        PanelAttributeRow.BLoadLayoutSnippet("PanelAttributeRow")
        PanelAttributeRow.SetDialogVariable("stat_label", $.Localize(`#custom_attribute_${_attr}`).replace("%", ""))
        PanelAttributeRow.SetDialogVariable("stat_value", ConvertAttributeToLabel(_attr, 0))
    }

    HeroInfoBtn.SetPanelEvent("onactivate", () => {
        HeroAttributeContainer.ToggleClass("Open")
    })

    CreatePanel_AttributeState();
}

(function () {
    InitHeroDetailsPanel()
})();