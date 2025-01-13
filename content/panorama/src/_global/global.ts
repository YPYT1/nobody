// 全局
// import { default as ServerItemList } from "../json/config/server/item/server_item_list.json";
// import { default as PictuerCardData } from "../json/config/server/picture/pictuer_card_data.json";
// import { default as PictuerFetterConfig } from "../json/config/server/picture/pictuer_fetter_config.json";

import { DASHBOARD_NAVBAR } from "../dashboard/components";

// import { default as PictuerFetterAbility } from "../json/config/server/picture/pictuer_fetter_ability.json";
export const GLOBAL_FILE = "global";

const AttributeConst = GameUI.CustomUIConfig().KvData.AttributeConst;



declare global {

    interface CustomUIConfig {
        CreateServerItem(item_id: string, item_count: number, parent: Panel): Panel;
        GetServerItemData(item_id: string): typeof ServerItemList[keyof typeof ServerItemList]
        GetPictureCardData(item_id: string): typeof PictuerCardData[keyof typeof PictuerCardData]
        GetTextureSrc(texture: string, func?: string): string;
        FindOfficialHUDUI(panel_id: string): Panel | null;
        HideCustomTooltip(): void;
        ConverAttrAndValueLabel(attr: string, value: number, decimal?: number): string;
        SetHotKey(key: string, down_func: Function, up_func?: Function): void;
        SendCustomEvent: <T1 extends keyof CGED, T2 extends keyof CGED[T1], T3 extends CGED[T1][T2]>(pEventName: T1, event_name: T2, params: T3) => void
        CheckAttrIsPercent(MainAttr: string, SubAttr: string): boolean;
        // getServerTime(): number;
        ConvertServerItemToArray(input: string): { item_id: string; item_count: number; }[];
        ConvertServerItemToObject(input: string): { [item_id: string]: number; };

        HeroIDToName(heroid: number): string;
        DashboardRoute<
            Key extends keyof typeof DASHBOARD_NAVBAR,
            T2 extends typeof DASHBOARD_NAVBAR[Key]
        >(dashboard_id: Key, nav: keyof T2["Sub"]): void
    }
}

// GameUI.CustomUIConfig()._PictuerFetterConfig = PictuerFetterConfig;
// GameUI.CustomUIConfig()._PictuerCardData = PictuerCardData;

GameUI.CustomUIConfig().CreateServerItem = function (item_id: string, item_count: number, parent: Panel) {
    let ServerItemPanel = $.CreatePanel("Panel", parent, "");
    ServerItemPanel.BLoadLayout("file://{resources}/layout/custom_game/components/server_item/server_item.xml", true, false);
    ServerItemPanel.Data<PanelDataObject>().SetItemValue({ item_id, item_count })
    return ServerItemPanel
}

const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
GameUI.CustomUIConfig().GetServerItemData = function (item_id: string) {
    return ServerItemList[item_id as keyof typeof ServerItemList];
}

const PictuerCardData = GameUI.CustomUIConfig().KvData.PictuerCardData;
/** 通过 itemid 获得对应卡片信息 */
GameUI.CustomUIConfig().GetPictureCardData = function (item_id: string) {
    return PictuerCardData[item_id as keyof typeof PictuerCardData];
}

const ITEM_PATH_CUSTOM = "raw://resource/flash3/images/items/";
const ITEM_PATH_ORIGINAL = "file://{images}/items/";
const ABILITY_PATH_CUSTOM = "raw://resource/flash3/images/spellicons/";
const ABILITY_PATH_ORIGINAL = "file://{images}/spellicons/";

/**
 * 根据路径获取图片位置
 * @param texture 
 * @returns 
 */
GameUI.CustomUIConfig().GetTextureSrc = function (texture: string, func: string = "123") {
    // $.Msg(["texture",texture])
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


GameUI.CustomUIConfig().FindOfficialHUDUI = function (panel_id: string) {
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

GameUI.CustomUIConfig().HideCustomTooltip = function () {
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_text");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_ability");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_item");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_element_syenrgy");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_talent_tree");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_prop");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_rune");
    $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_talentconfig");
}


GameUI.CustomUIConfig().ConverAttrAndValueLabel = (attr: string, value: number, decimal: number = 0) => {
    let is_pct = AttributeConst[attr as keyof typeof AttributeConst].is_pct == 1;
    let res_label = "0";
    if (is_pct) {
        res_label = `${value.toFixed(decimal)}%`
    } else {
        res_label = `${Math.floor(value).toFixed(decimal)}`
    }
    return res_label
}

GameUI.CustomUIConfig().SetHotKey = function (key: string, down_func: Function, up_func?: Function) {
    let command_string = `On${key}${Date.now()}`;
    Game.CreateCustomKeyBind(key, `+${command_string}`);
    Game.AddCommand(
        `+${command_string}`,
        () => { if (down_func) { down_func(); } },
        ``,
        1 << 32
    );
    Game.AddCommand(
        `-${command_string}`,
        () => { if (up_func) { up_func(); } },
        ``,
        1 << 32
    );
}

GameUI.CustomUIConfig().SendCustomEvent = function <
    T1 extends keyof CGED,
    T2 extends keyof CGED[T1],
    T3 extends CGED[T1][T2],
>(pEventName: T1, event_name: T2, params: T3) {
    GameEvents.SendCustomGameEventToServer(pEventName, {
        event_name: event_name,
        params: params
    })
}

const PercentAttrKeyList: AttributeSubKey[] = ["BasePercent", "BonusPercent", "TotalPercent"];
GameUI.CustomUIConfig().CheckAttrIsPercent = function (MainAttr: AttributeMainKey, SubAttr: AttributeSubKey) {
    let attr_data = AttributeConst[MainAttr];
    let is_pct = attr_data.is_pct == 1;
    let sub_pct = PercentAttrKeyList.indexOf(SubAttr) != -1;
    return is_pct || sub_pct
}


// GameUI.CustomUIConfig().getServerTime = function () {
//     const dotatime = Game.GetDOTATime(false, false);
//     return dotatime
// }



GameUI.CustomUIConfig().ConvertServerItemToArray = function (item_input: string) {
    let data_array = []
    let item_arr = item_input.split(",");
    for (let row_item of item_arr) {
        let row_data = row_item.split("_");
        let item_id = row_data[0]
        let item_count = parseInt(row_data[1])
        data_array.push({ item_id, item_count })
    }
    return data_array
}

GameUI.CustomUIConfig().ConvertServerItemToObject = function (item_input: string) {
    let data_object: { [item_id: string]: number } = {}
    let item_arr = item_input.split(",");
    for (let row_item of item_arr) {
        let row_data = row_item.split("_");
        let item_id = row_data[0]
        let item_count = parseInt(row_data[1])
        data_object[item_id] = item_count
    }

    return data_object
}

const NpcHeroesCustom = GameUI.CustomUIConfig().KvData.npc_heroes_custom;
let HeroIdTable: { [heroid: number]: string } = {}
for (let k in NpcHeroesCustom) {
    let hero_data = NpcHeroesCustom[k as keyof typeof NpcHeroesCustom];
    let heroid = hero_data.HeroID;
    HeroIdTable[heroid] = hero_data.override_hero;
}
GameUI.CustomUIConfig().HeroIDToName = function (heroid: number) {
    return HeroIdTable[heroid]
}
