
// GameUI.CustomUIConfig().kvdata = kv
import { default as ServerItemList } from "../json/config/server/item/server_item_list.json";
import { default as PictuerCardData } from "../json/config/server/picture/pictuer_card_data.json";
import { default as PictuerFetterConfig } from "../json/config/server/picture/pictuer_fetter_config.json";
import { default as PictuerFetterAbility } from "../json/config/server/picture/pictuer_fetter_ability.json";

const KvData = {
    ServerItemList: ServerItemList
}

declare global {

    interface CustomUIConfig {
        KvData: typeof KvData
    }
}

GameUI.CustomUIConfig().KvData = KvData


