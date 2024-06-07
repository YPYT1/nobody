export const Attributelist: AttributeMainKey[] = ["AttackDamage", "PhyicalArmor", "MoveSpeed"];

export let AttributeRowsList: { [key in AttributeMainKey]?: Panel } = {}

export const StartUpdateData = () => {
    UpdataAttributeData()
    $.Schedule(0.1, StartUpdateData)
}

export const UpdataAttributeData = () => {
    let MainPanel = $.GetContextPanel()
    let AttributeState = MainPanel.FindChildTraverse("AttributeState");
    const queryUnit = Players.GetPlayerHeroEntityIndex(Players.GetLocalPlayer());//Players.GetLocalPlayerPortraitUnit();
    
    if (AttributeState) {
        AttributeState.SetDialogVariableInt("level", Entities.GetLevel(queryUnit))
    }

    AttributeRowsList["AttackDamage"]?.SetDialogVariable("attr_value", `${Entities.GetDamageMin(queryUnit)}`)
    AttributeRowsList["MoveSpeed"]?.SetDialogVariable("attr_value", `${Entities.GetMoveSpeedModifier(queryUnit, Entities.GetBaseMoveSpeed(queryUnit))}`)

    
    const netdata = CustomNetTables.GetTableValue("unit_attribute", `${queryUnit}`)
    if (netdata == null) { return }
    // 扩展数据
    let show = netdata.show;
    let value = netdata.value
    // $.Msg(["show",show.AttackDamage])
    AttributeRowsList["PhyicalArmor"]?.SetDialogVariable("attr_value", `${value.PhyicalArmor}`)
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
            let AttributeRows = $.CreatePanel("Panel", UnitAttribute, "");
            AttributeRows.BLoadLayoutSnippet("AttributeRows");
            // AttributeRows.Data<PanelDataObject>().attr_key = attr_key
            AttributeRows.AddClass(attr_key);
            AttributeRows.SetDialogVariable("attr_value", "0")
            AttributeRowsList[attr_key] = AttributeRows
        }
    }

    UpdataAttributeData()
    StartUpdateData();
}


(function () {
    CreatePanel_AttributeState();
})();