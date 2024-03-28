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
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_ability");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_item");
}

declare type TooltipType = "ability" | "item";

export function ShowCustomTooltip(
    panel: Panel,
    type: TooltipType,
    name: string,
    entityIndex?: EntityIndex | number,
    item_level: number = 1,
    value: number = 0,
) {
    if (entityIndex && entityIndex != -1) {
        name = Abilities.GetAbilityName(entityIndex as AbilityEntityIndex);
    }

    if (type == "ability") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_ability",
            "file://{resources}/layout/custom_game/tooltip/ability/layout.xml",
            `name=${name}&item_level=${item_level}&entityIndex=${entityIndex}&ext_int=${value}`
        );
    } else if (type == "item") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_item",
            "file://{resources}/layout/custom_game/tooltip/item/layout.xml",
            "name=" + name
            + "&item_level=" + item_level
            + "&entityIndex=" + entityIndex
        );
    }
}
