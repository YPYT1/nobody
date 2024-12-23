
const MainPanel = $.GetContextPanel();
const server_talent_data = GameUI.CustomUIConfig().KvData.server_talent_data;
const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent

const SetTooltipView = (id: string, level: number) => {
    let rowdata = server_talent_data[id as keyof typeof server_talent_data];
    let maxlevel = rowdata.max_number;

    let ObjectValues = rowdata.ObjectValues as CustomAttributeTableType;
    let attr_label: string[] = [];

    for (let main_key in ObjectValues) {
        let main_attr_obj = ObjectValues[main_key as keyof typeof ObjectValues];
        for (let sub_key in main_attr_obj) {
            let value = main_attr_obj[sub_key as keyof typeof main_attr_obj]!;
            let pct_symbol = CheckAttrIsPercent(main_key, sub_key) ? "%" : ""
            let attr_name = $.Localize(`#custom_attribute_${main_key}`).replace("%", "")
            if (level < maxlevel) {
                attr_label.push(`${attr_name}: <span class="val">${value * level}${pct_symbol} -> ${value * (level + 1)}${pct_symbol}</span>`)
            } else {
                attr_label.push(`${attr_name}: <span class="val">+${value * level}${pct_symbol}</span>`)
            }

        }
    }



    MainPanel.SetDialogVariable("talent_name", $.Localize(`#custom_server_talent_${id}`))

    if (true) {
        const desc = $.Localize(`#custom_server_talent_${id}_desc`).replaceAll("\n", "<br>");
        MainPanel.SetDialogVariable("talent_desc", desc)
    } else {

        MainPanel.SetDialogVariable("talent_desc", attr_label.join("<br>"))
    }

    // MainPanel.SetDialogVariable("talent_name", id)

    MainPanel.SetDialogVariable("talent_level", `${level}/${maxlevel}`)
}


export function Init() {
    let m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    MainPanel.SetPanelEvent("ontooltiploaded", () => {
        // UpdateTooltip()
        // $.Msg(["talent_config"])
        // let ContextPanel = $.GetContextPanel();
        let level = $.GetContextPanel().GetAttributeInt("level", 0);
        let id = $.GetContextPanel().GetAttributeString("id", "");
        SetTooltipView(id, level)

    });

}


(function () {
    Init()
})();