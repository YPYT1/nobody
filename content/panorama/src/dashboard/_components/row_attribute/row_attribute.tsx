export const COMPONENTS_NAME = "row_attribute";

declare global {
    interface Component_RowAttribute extends Panel {
        _Init(): void;
        SetAttributeMainKey(main_key: AttributeMainKey, base_value?: number, extra_value?: number): void;
        SetAttrValue(base_value: number, extra_value?: number): void;
    }
}

const MainPanel = $.GetContextPanel() as Component_RowAttribute;
const StatIcon = $("#StatIcon")
const SetAttributeMainKey = (main_key: AttributeMainKey, base_value: number = 0, extra_value: number = 0) => {
    MainPanel.SetDialogVariable("attribute_name", $.Localize(`#custom_attribute_${main_key}`).replace("%", ""))
    MainPanel.SetAttrValue(base_value, extra_value);
    StatIcon.AddClass(main_key)
}

const SetAttrValue = (base_value: number, extra_value: number = 0) => {
    MainPanel.SetDialogVariable("base_value", "" + base_value);
    if (extra_value == 0) {
        MainPanel.SetDialogVariable("extra_value", "");
    } else {
        MainPanel.SetDialogVariable("extra_value", "+" + extra_value);
    }
}


(function () {
    MainPanel.SetAttributeMainKey = SetAttributeMainKey;
    MainPanel.SetAttrValue = SetAttrValue;
})();