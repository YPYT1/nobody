
const MainPanel = $.GetContextPanel();
const server_talent_data = GameUI.CustomUIConfig().KvData.server_talent_data;

const SetTooltipView = (id: string, level: number) => {
    let rowdata = server_talent_data[id as keyof typeof server_talent_data];
    let maxlevel = rowdata.max_number;
    const desc = $.Localize(`#custom_server_talent_${id}_desc`).replaceAll("\n","<br>");
    // $.Msg(["desc",desc])
    MainPanel.SetDialogVariable("talent_name", $.Localize(`#custom_server_talent_${id}`))
    MainPanel.SetDialogVariable("talent_desc", desc)
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
        $.Msg(["talent_config"])
        // let ContextPanel = $.GetContextPanel();
        let level = $.GetContextPanel().GetAttributeInt("level", 0);
        let id = $.GetContextPanel().GetAttributeString("id", "");
        SetTooltipView(id, level)

    });

}


(function () {
    Init()
})();