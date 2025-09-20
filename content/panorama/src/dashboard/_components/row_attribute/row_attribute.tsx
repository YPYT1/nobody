export const __COMPONENTS_NAME = 'row_attribute';

interface AttributeValueProp {
    Base: number;
    Bonus: number;
    BasePercent: number;
}

declare global {
    interface Component_RowAttribute extends Panel {
        SetAttributeMainKey(main_key: string, base_value?: number, extra_value?: number): void;
        SetAttrValue(base_value: number, extra_value?: number): void;
        SetPercentValue(pct_value: number): void;
        IsPercent(is_pct: boolean): void;
    }
}

const MainPanel = $.GetContextPanel() as Component_RowAttribute;
const StatIcon = $('#StatIcon');
const SetAttributeMainKey = (main_key: AttributeMainKey, base_value: number = 0, extra_value: number = 0) => {
    MainPanel.SetDialogVariable('attribute_name', $.Localize(`#custom_attribute_${main_key}`).replace('%', ''));
    MainPanel.SetAttrValue(base_value, extra_value);
    StatIcon.AddClass(main_key);
};

const SetAttrValue = (base_value: number, extra_value: number = 0) => {
    MainPanel.SetDialogVariable('base_value', '' + base_value);
    if (extra_value == 0) {
        MainPanel.SetDialogVariable('extra_value', '');
    } else {
        MainPanel.SetDialogVariable('extra_value', '+' + extra_value);
    }
};

const SetPercentValue = (pct_value: number) => {
    MainPanel.SetDialogVariable('base_percent', `${pct_value}`);
};

const IsPercent = (is_pct: boolean) => {
    MainPanel.SetHasClass('is_percent', is_pct);
};

(function () {
    MainPanel.SetAttributeMainKey = SetAttributeMainKey;
    MainPanel.SetAttrValue = SetAttrValue;
    MainPanel.IsPercent = IsPercent;
    MainPanel.SetPercentValue = SetPercentValue;
})();
