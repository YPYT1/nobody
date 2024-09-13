/**
 * Kv相关数据操作
 */
import { default as CustomItemsTable } from "./../json/npc_items_custom.json";
import { default as CustomAbilitiesTable } from "./../json/npc_abilities_custom.json";


const ITEM_PATH_CUSTOM = "raw://resource/flash3/images/items/";
const ITEM_PATH_ORIGINAL = "file://{images}/items/";
const ABILITY_PATH_CUSTOM = "raw://resource/flash3/images/spellicons/";
const ABILITY_PATH_ORIGINAL = "file://{images}/spellicons/";

/**
 * 根据路径获取图片位置
 * @param texture 
 * @returns 
 */
export function GetTextureSrc(texture: string, func: string = "123") {
    let texture_arr = texture.split("_");
    let bIsItem = texture_arr[0] == "item";
    // $.Msg(["GetTextureSrc", func])
    if (bIsItem) {
        // 物品
        let cut_texture = texture.replace("item_", "");
        let cut_arr = cut_texture.split("/");
        if (cut_arr[0] == "treasure"
            || cut_arr[0] == "jewel"
            || cut_arr[0] == "custom"
            || cut_arr[0] == "soulbow"
            || cut_arr[0] == "store"
            || cut_arr[0] == "rune"
            || cut_arr[0] == "server"
            || cut_arr[0] == "prop"
        ) {
            return `${ITEM_PATH_CUSTOM}${cut_texture}.png`;
        } else {
            return `${ITEM_PATH_ORIGINAL}${cut_texture}.png`;
        }
    } else {
        // 技能
        let cut_arr = texture.split("/");
        if (
            cut_arr[0] == "custom" 
            || cut_arr[0] == "arms" 
            || cut_arr[0] == "hero"
            || cut_arr[0] == "altar"
        ) {
            return `${ABILITY_PATH_CUSTOM}${texture}.png`;
        } else {
            return `${ABILITY_PATH_ORIGINAL}${texture}.png`;
        }

    }
}


export function GetItemImageSrc(item_name: string) {
    let item_data = CustomItemsTable[item_name as keyof typeof CustomItemsTable];
    if (item_data == null) { return "" }
    let texture_name = item_data.AbilityTextureName;
    let image_src = GetTextureSrc(texture_name);
    return image_src
}

export function GetAbilityImageSrc(item_name: string) {
    let item_data = CustomAbilitiesTable[item_name as "public_phase_move"];
    if (item_data == null) { return "" }
    let texture_name = item_data.AbilityTextureName;
    let image_src = GetTextureSrc(texture_name);
    return image_src
} 