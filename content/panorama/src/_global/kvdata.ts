
// GameUI.CustomUIConfig().kvdata = kv
import { default as npc_heroes_custom } from "../json/npc_heroes_custom.json";
import { default as server_talent_data } from "../json/config/server/hero/server_talent_data.json";

import { default as ServerItemList } from "../json/config/server/item/server_item_list.json";
import { default as PictuerCardData } from "../json/config/server/picture/pictuer_card_data.json";
import { default as PictuerFetterConfig } from "../json/config/server/picture/pictuer_fetter_config.json";
import { default as PictuerFetterAbility } from "../json/config/server/picture/pictuer_fetter_ability.json";
import { default as AttributeConst } from "../json/config/game/attribute_const.json";

const KvData = {
    AttributeConst: AttributeConst,
    ServerItemList: ServerItemList,
    npc_heroes_custom: npc_heroes_custom,
    server_talent_data: server_talent_data,

}

declare global {

    interface CustomUIConfig {
        KvData: typeof KvData
    }
}

GameUI.CustomUIConfig().KvData = KvData


