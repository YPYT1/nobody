const MainPanel = $.GetContextPanel();

export function Init() {
    const m_TooltipPanel = $.GetContextPanel().GetParent()!.GetParent()!;
    $.GetContextPanel().GetParent()!.FindChild('LeftArrow')!.visible = false;
    $.GetContextPanel().GetParent()!.FindChild('RightArrow')!.visible = false;
    m_TooltipPanel.FindChild('TopArrow')!.visible = false;
    m_TooltipPanel.FindChild('BottomArrow')!.visible = false;

    MainPanel.SetPanelEvent('ontooltiploaded', () => {
        const name = $.GetContextPanel().GetAttributeString('name', '');

        // SetAbilityBaseInfo(name, entityIndex)
    });
}

(function () {
    Init();
})();
