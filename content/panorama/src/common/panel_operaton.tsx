import { GetAbilityImageSrc, GetItemImageSrc } from "./custom_kv_method";

type DragImageType = "Ability" | "Item"

/** 创建可拖拽的物品图标 */
export const CreateDragPanelImage = (item_name: string, image_type: DragImageType) => {
    let Isrepic = false;
    let image_src = "";
    if(image_type == "Ability"){
        image_src = GetAbilityImageSrc(item_name)
    } else {
        image_src = GetItemImageSrc(item_name)
    }
  
    let displayPanel = $.CreatePanel(
        "Panel",
        $.GetContextPanel(),
        "dragImage",
        {
            class: `CItemImage`,
            hittest: false,
        }
    );
    let ItemBackground = $.CreatePanel("Panel", displayPanel, "ItemBackground", {});
    let RecipeContainer = $.CreatePanel("Panel", ItemBackground, "CustomRecipeContainer", {});
    let RecipeOutputImage = $.CreatePanel('Image', RecipeContainer, "CustomRecipeOutputImage", {
        scaling: 'stretch-to-fit-y-preserve-aspect',
        hittest: false,
    });
    RecipeOutputImage.SetImage(image_src);
    return displayPanel;
};


export function FindOfficialHUDUI(panel_id: string) {
    let hudRoot: any;
    for (let panel = $.GetContextPanel(); panel != null; panel = panel.GetParent()!) {
        hudRoot = panel;
    }
    if (hudRoot) {
        let comp = hudRoot.FindChildTraverse(panel_id);
        return comp as Panel;
    } else {
        return null;
    }
}