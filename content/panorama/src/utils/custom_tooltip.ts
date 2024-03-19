export function ShowCustomTextTooltip(
    panel: Panel,
    title: string = "",
    description: string = "",
) {
    let post_args = `title=${title}&description=${description}&tooltip=text`;
    $.DispatchEvent(
        "UIShowCustomLayoutParametersTooltip",
        panel,
        "custom_tooltip_text",
        "file://{resources}/layout/custom_game/tooltip/text/layout.xml",
        post_args
    );
}

export function HideCustomTooltip() {
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_text");
}