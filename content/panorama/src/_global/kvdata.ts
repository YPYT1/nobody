
// GameUI.CustomUIConfig().kvdata = kv
import { default as npc_heroes_custom } from "../json/npc_heroes_custom.json";
import { default as npc_abilities_custom } from "../json/npc_abilities_custom.json";
import { default as server_talent_data } from "../json/config/server/hero/server_talent_data.json";

import { default as ServerItemList } from "../json/config/server/item/server_item_list.json";
import { default as PictuerCardData } from "../json/config/server/picture/pictuer_card_data.json";
import { default as PictuerFetterConfig } from "../json/config/server/picture/pictuer_fetter_config.json";
import { default as PictuerFetterAbility } from "../json/config/server/picture/pictuer_fetter_ability.json";
import { default as AttributeConst } from "../json/config/game/attribute_const.json";


import { default as MysteriousShopConfig } from "../json/config/game/shop/mysterious_shop_config.json";
import { default as RuneAttrConfig } from "../json/config/game/rune/rune_attr_config.json";
import { default as TalentTreeConfig } from "../json/config/game/hero/talent_tree/talent_tree_config.json";



const KvData = {
    AttributeConst,
    ServerItemList,
    npc_heroes_custom,
    npc_abilities_custom,
    server_talent_data,
    MysteriousShopConfig,
    PictuerCardData,
    PictuerFetterConfig,
    PictuerFetterAbility,
    RuneAttrConfig,
    TalentTreeConfig,
}

declare global {

    interface CustomUIConfig {
        KvData: typeof KvData
    }
}

GameUI.CustomUIConfig().KvData = KvData


