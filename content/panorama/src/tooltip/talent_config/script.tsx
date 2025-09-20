const MainPanel = $.GetContextPanel();
const server_talent_data = GameUI.CustomUIConfig().KvData.server_talent_data;
const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent;

const SetTooltipView = (id: string, level: number) => {
    const rowdata = server_talent_data[id as keyof typeof server_talent_data];
    const maxlevel = rowdata.max_number;

    const ObjectValues = rowdata.ObjectValues as CustomAttributeTableType;
    const attr_label: string[] = [];

    for (const main_key in ObjectValues) {
        const main_attr_obj = ObjectValues[main_key as keyof typeof ObjectValues];
        for (const sub_key in main_attr_obj) {
            const value = main_attr_obj[sub_key as keyof typeof main_attr_obj]!;
            const pct_symbol = CheckAttrIsPercent(main_key, sub_key) ? '%' : '';
            const attr_name = $.Localize(`#custom_attribute_${main_key}`).replace('%', '');
            if (level < maxlevel) {
                attr_label.push(`${attr_name}: <span class="val">${value * level}${pct_symbol} -> ${value * (level + 1)}${pct_symbol}</span>`);
            } else {
                attr_label.push(`${attr_name}: <span class="val">+${value * level}${pct_symbol}</span>`);
            }
        }
    }

    MainPanel.SetDialogVariable('talent_name', $.Localize(`#custom_server_talent_${id}`));

    if (true) {
        const desc = $.Localize(`#custom_server_talent_${id}_desc`).replaceAll('\n', '<br>');
        MainPanel.SetDialogVariable('talent_desc', desc);
    } else {
        MainPanel.SetDialogVariable('talent_desc', attr_label.join('<br>'));
    }

    // MainPanel.SetDialogVariable("talent_name", id)

    MainPanel.SetDialogVariable('talent_level', `${level}/${maxlevel}`);
};

export function Init() {
    const m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    MainPanel.SetPanelEvent('ontooltiploaded', () => {
        // UpdateTooltip()
        // $.Msg(["talent_config"])
        // let ContextPanel = $.GetContextPanel();
        const level = $.GetContextPanel().GetAttributeInt('level', 0);
        const id = $.GetContextPanel().GetAttributeString('id', '');
        SetTooltipView(id, level);
    });
}

(function () {
    Init();
})();
