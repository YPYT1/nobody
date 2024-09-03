export function ShowCustomTextTooltip(
    panel: Panel,
    title: string = "",
    description: string = "",
) {
    let post_args = `title=${title}&description=${description}&tooltip=text`;

    for (let k in panel.Data<PanelDataObject>()) {
        let value = panel.Data<PanelDataObject>()[k];
        // $.Msg([value, typeof (value)])
        if (typeof (value) == "number") {
            panel.SetDialogVariableInt(k, value);
        } else {
            panel.SetDialogVariable(k, value);
        }


    }

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
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_element_syenrgy");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_talent_tree");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_prop");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_rune");
}

declare type TooltipType = "ability" | "item" | "element_syenrgy" | "talent_tree" | "prop" | "rune";

export function ShowCustomTooltip(
    panel: Panel,
    tooltip_type: TooltipType,
    name: string,
    entityIndex?: EntityIndex | number | string,
    item_level: number = 1,
    value: number = 0,
) {
    if (typeof entityIndex == "number" && entityIndex && entityIndex > 0) {
        name = Abilities.GetAbilityName(entityIndex as AbilityEntityIndex);
    }

    if (tooltip_type == "ability") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_ability",
            "file://{resources}/layout/custom_game/tooltip/ability/layout.xml",
            `name=${name}&slot=${item_level}&entityIndex=${entityIndex}&ext_int=${value}`
        );
    } else if (tooltip_type == "item") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_item",
            "file://{resources}/layout/custom_game/tooltip/item/layout.xml",
            "name=" + name
            + "&item_level=" + item_level
            + "&entityIndex=" + entityIndex
        );
    } else if (tooltip_type == "element_syenrgy") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_element_syenrgy",
            "file://{resources}/layout/custom_game/tooltip/element_syenrgy/layout.xml",
            "element_type=" + item_level + "&element_count=" + value
        );
    } else if (tooltip_type == "talent_tree") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_talent_tree",
            "file://{resources}/layout/custom_game/tooltip/talent_tree/layout.xml",
            `hero=${name}&key=${entityIndex}&level=${item_level}`,
        );
    } else if (tooltip_type == "prop") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_prop",
            "file://{resources}/layout/custom_game/tooltip/" + tooltip_type + "/layout.xml",
            "name=" + name
        );
    } else if (tooltip_type == "rune") {
        $.DispatchEvent(
            "UIShowCustomLayoutParametersTooltip",
            panel,
            "custom_tooltip_rune",
            "file://{resources}/layout/custom_game/tooltip/" + tooltip_type + "/layout.xml",
            `name=${name}&level=${item_level}`,
        );
    }
}
