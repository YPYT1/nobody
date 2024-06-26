import { GetElementBondTable } from '../../utils/element_bond';

const element_enum_label: CElementType[] = ["null", "fire", "ice", "thunder", "wind", "light", "dark"];
let element_table = GetElementBondTable();


function UpdateTooltip() {
    // let MainPanel = $("#CustomTooltip")
    let MainPanel = $.GetContextPanel();
    let element_type = MainPanel.GetAttributeInt("element_type", 0);
    let element_count = MainPanel.GetAttributeInt("element_count", 0);
    // $.Msg(["element_type", element_type, "element_count", element_count])
    let syenrgy_title = element_enum_label[element_type];

    for (let i = 0; i < element_enum_label.length; i++) {
        let element_tag = element_enum_label[i]
        MainPanel.SetHasClass(element_tag, element_type == i);
    }


    MainPanel.SetDialogVariable("base_desc", $.Localize(`#custom_text_element_${element_type}_Description`));
    // MainPanel.SetDialogVariable("syenrgy_count", `${element_count}`);

    let BonusDescriptionPanel = $("#BonusDescription");
    BonusDescriptionPanel.RemoveAndDeleteChildren();
    let element_object = element_table[element_type];
    // custom_element_bond_fire_3_Description
    for (let count of element_object) {
        let BonusRow = $.CreatePanel("Panel", BonusDescriptionPanel, "", {});
        BonusRow.BLoadLayoutSnippet("SyenrgyRow");
        BonusRow.SetHasClass("On", element_count >= count);
        BonusRow.SetDialogVariableInt("syenrgy_amount", count);
        BonusRow.SetDialogVariable(
            "syenrgy_desc",
            $.Localize(`#custom_element_bond_${syenrgy_title}_${count}_Description`)
        );

        // let BonusRow2 = $.CreatePanel("Panel", BonusDescriptionPanel, "", {});
        // BonusRow2.BLoadLayoutSnippet("SyenrgyRow");
        // BonusRow2.SetHasClass("On", element_count >= count);
        // BonusRow2.SetDialogVariableInt("syenrgy_amount", count);
        // BonusRow2.SetDialogVariable(
        //     "syenrgy_desc",
        //     $.Localize(`#custom_element_bond_${syenrgy_title}_${count}_Description`)
        // );
    }
}

export function Init() {

    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    
    $.GetContextPanel().SetPanelEvent("ontooltiploaded", () => {
        UpdateTooltip()
    });
}

(function () {
    Init()
})();