import { AttributeIsPercent, ConvertAttributeToLabel } from "../../../utils/attribute_method";
const AttributeTooltip = $("#AttributeTooltip");
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

/** 护甲减伤公式 */
const PhyicalArmorDmgReduction = (PhyicalArmor: number) => {
    return PhyicalArmor / (100 + Math.abs(PhyicalArmor));
}

const StartUpdateData = () => {
    UpdataAttributeData()
    $.Schedule(1, StartUpdateData)
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
    let value = netdata.value;
    let table = netdata.table;

    for (let _key in AttributeRowsList) {
        let attr_key = _key as AttributeMainKey
        let attrPanel = AttributeRowsList[attr_key];
        if (attrPanel) {
            attrPanel.SetDialogVariable("attr_value", ConvertAttributeToLabel(attr_key, value[attr_key]))
        }
    }



    for (let _attr in value) {
        let attr_key = _attr as AttributeMainKey
        let PanelAttributeRow = HeroAttributeContainer.FindChildTraverse(attr_key);
        if (PanelAttributeRow) {
            PanelAttributeRow.SetDialogVariable("stat_value", ConvertAttributeToLabel(attr_key, value[attr_key]))
        }
        let sign = AttributeIsPercent(_attr as AttributeMainKey) ? "%" : ""
        HeroAttributeContainer.SetDialogVariable(_attr, "<span class=\'bonus\'>" + value[attr_key] + sign + "</span>")
    }
    let aps = Entities.GetAttacksPerSecond(queryUnit);
    HeroAttributeContainer.SetDialogVariable("APS", "<span class=\'bonus\'>" + (1 / aps).toFixed(2) + "</span>");
    // 护甲减伤
    let armor_reduction = Math.floor(PhyicalArmorDmgReduction(value.PhyicalArmor ?? 0) * 100);
    HeroAttributeContainer.SetDialogVariable("ArmorReduction", "<span class=\'bonus\'>" + armor_reduction + "%</span>");

    // $.Msg(["Update nettable"])
    for (let _attr in table) {
        let row_data = table[_attr as keyof typeof table];
        
        for (let row_key in row_data) {
            let _value = row_data[row_key as keyof typeof row_data] ?? 0;
            let dialog_key = _attr + "." + row_key
            let sign = AttributeIsPercent(_attr as AttributeMainKey) ? "%" : ""
            if (row_key == "Bonus") {
                let attr_value = Math.floor((value[_attr as AttributeMainKey] ?? 0) - (row_data.Base ?? 0))
                HeroAttributeContainer.SetDialogVariable(dialog_key, "<span class='bonus'>" + attr_value + sign + "</span>")
            } else {
                if (_attr == "AttackDamage"){

                    $.Msg([_attr,dialog_key,sign])
                }
                if (row_key == "BasePercent" || row_key == "BonusPercent" || row_key == "TotalPercent") {
                    sign = "%"
                }
                
                HeroAttributeContainer.SetDialogVariable(dialog_key, "<span class='bonus'>" + _value + sign + "</span>")
            }

        }
    }

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

        SetAttributePanelEvent(PanelAttributeRow, _attr)

    }

    AdvAttributeList.RemoveAndDeleteChildren()
    for (let _attr of adv_attribute_list) {
        let PanelAttributeRow = $.CreatePanel("Panel", AdvAttributeList, _attr);
        PanelAttributeRow.BLoadLayoutSnippet("PanelAttributeRow")
        PanelAttributeRow.SetDialogVariable("stat_label", $.Localize(`#custom_attribute_${_attr}`).replace("%", ""))
        PanelAttributeRow.SetDialogVariable("stat_value", ConvertAttributeToLabel(_attr, 0))

        SetAttributePanelEvent(PanelAttributeRow, _attr)


    }

    HeroInfoBtn.SetPanelEvent("onactivate", () => {
        HeroAttributeContainer.ToggleClass("Open")
    })

    CreatePanel_AttributeState();
}

function SetAttributePanelEvent(PanelAttributeRow: Panel, _attr: string) {
    PanelAttributeRow.SetPanelEvent("onmouseover", () => {
        let offset = PanelAttributeRow.GetPositionWithinWindow()
        let ScreenHeight = Game.GetScreenHeight();
        AttributeTooltip.AddClass("Show");
        let attr_tips_label = $.Localize(`#custom_attribute_${_attr}_tooltips`, HeroAttributeContainer)
        attr_tips_label = attr_tips_label.replaceAll("\n", "<br>")
        AttributeTooltip.SetDialogVariable("attr_tips", attr_tips_label)
        AttributeTooltip.style.marginBottom = `${ScreenHeight - offset.y + 64}px`
        AttributeTooltip.style.marginLeft = `${offset.x}px`
    })

    PanelAttributeRow.SetPanelEvent("onmouseout", () => {
        AttributeTooltip.RemoveClass("Show");
    })
}
(function () {
    InitHeroDetailsPanel()
})();