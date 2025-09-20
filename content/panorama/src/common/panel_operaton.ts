import { GetAbilityImageSrc, GetItemImageSrc } from './custom_kv_method';

type DragImageType = 'Ability' | 'Item';

/** 创建可拖拽的物品图标 */
export const CreateDragPanelImage = (item_name: string, image_type: DragImageType) => {
    const Isrepic = false;
    let image_src = '';
    if (image_type == 'Ability') {
        image_src = GetAbilityImageSrc(item_name);
    } else {
        image_src = GetItemImageSrc(item_name);
    }

    const displayPanel = $.CreatePanel('Panel', $.GetContextPanel(), 'dragImage', {
        class: `CItemImage`,
        hittest: false,
    });
    const ItemBackground = $.CreatePanel('Panel', displayPanel, 'ItemBackground', {});
    const RecipeContainer = $.CreatePanel('Panel', ItemBackground, 'CustomRecipeContainer', {});
    const RecipeOutputImage = $.CreatePanel('Image', RecipeContainer, 'CustomRecipeOutputImage', {
        scaling: 'stretch-to-fit-y-preserve-aspect',
        hittest: false,
    });
    RecipeOutputImage.SetImage(image_src);
    return displayPanel;
};
