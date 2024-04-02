import React from 'react';
// import { GetTextureSrc, HideCustomTooltip, ShowCustomTooltip } from '../../_global/method';
import { default as ItemsTable } from "../json/npc_items_custom.json";
import { GetTextureSrc } from '../common/custom_kv_method';
import { HideCustomTooltip, ShowCustomTooltip } from '../utils/custom_tooltip';
// import { default as TreasureItem } from "./../../json/items/treasure_item.json";
// import { ShowHUDContextMenu } from '../../custom_hud/containers/context_menu';

interface CItemImageProps {
    id?: string;
    itemname?: string;
    contextEntityIndex?: ItemEntityIndex;
    css?: string;
    toggle?: boolean;
    tooltip?: boolean;
}

export const CItemImage = ({ id, itemname, contextEntityIndex, toggle, tooltip, css }: CItemImageProps) => {
    toggle = toggle == null ? true : toggle;
    tooltip = toggle == null ? false : tooltip;
    css = css == null ? "CItemImage" : css;
    let repice = false;
    let item_src = "";
    let item_rare = "rare_0";
    if (contextEntityIndex) {
        itemname = Abilities.GetAbilityName(contextEntityIndex);
        let texture = Abilities.GetAbilityTextureName(contextEntityIndex);
        item_src = GetTextureSrc(texture);
    }
    if (itemname && itemname != "null") {
        let item_data = ItemsTable[itemname as keyof typeof ItemsTable];
        if (item_data) {
            let texture = item_data.AbilityTextureName;
            item_rare = "rare_" + (item_data.Rarity ?? 0);
            if (item_src == "") item_src = GetTextureSrc(texture);
        } else {
            itemname = "null";
        }

    }

    return (

        <Panel
            id={id}
            className={`${css} ${item_rare} ${repice ? "IsRepice" : ""}`}
            hittest={false}
            hittestchildren={false}
            onmouseover={(e) => {
                if (tooltip) {
                    ShowCustomTooltip(e, "item", itemname ?? "", contextEntityIndex);
                }

            }}
            onmouseout={() => {
                HideCustomTooltip();
            }}
        >
            <Panel id='ItemBackground'>
                <Panel id="RecipeContainer">
                    <Image id="RecipeOutputImage" src={item_src} scaling='stretch-to-fit-y-preserve-aspect' />
                </Panel>
            </Panel>

        </Panel>
    );
};

interface CItemLabelProps {
    id?: string;
    itemname?: string;
    contextEntityIndex?: ItemEntityIndex;
}

export const CItemLabel = ({ id, itemname, contextEntityIndex }: CItemLabelProps) => {
    let item_rare = "rare_0";
    if (contextEntityIndex) {
        itemname = Abilities.GetAbilityName(contextEntityIndex);
    }
    if (itemname) {
        let item_data = ItemsTable[itemname as keyof typeof ItemsTable];
        item_rare = "rare_" + (item_data.Rarity ?? 0);
    }
    // $.Msg([itemname,item_rare])
    return (
        <Label id={id} className={"CItemLabel " + item_rare} text={$.Localize(`#DOTA_Tooltip_Ability_${itemname}`)} html={true} />
    );
};
