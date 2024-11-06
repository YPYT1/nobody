import { ToggleDashboardLoading } from "../../components";
import { LoadComponent_Card } from "../_components/component_manager";
import { GenericPopupsToggle } from "../_popups";

const MainPanel = $.GetContextPanel();
const AllPictuerList = $("#AllPictuerList");
const SavePictureBtn = $("#SavePictureBtn") as Button;
const RestorePictureBtn = $("#RestorePictureBtn") as Button;
const CardSearchInput = $("#CardSearchInput") as TextEntry;
const PictuerFetterConfig = GameUI.CustomUIConfig()._PictuerFetterConfig;
const GetPictureCardData = GameUI.CustomUIConfig().GetPictureCardData;

let config_index = 0;
let max_star_cost = -1;
/** 图鉴登记卡片信息 */
let pictuer_list: { [x: string]: { [key: number]: number; }; } = {}

let pic_fliter_text = ""
export const Init = () => {
    MainPanel.SetDialogVariableInt("card_count", 0);
    MainPanel.SetDialogVariableInt("card_max", 120);

    InitAllPictuerList()
    InitPictureCostInfo()
    CustomEventSubscribe();
}


const CustomEventSubscribe = () => {

    // 图鉴配置
    GameEvents.Subscribe("ServiceInterface_GetConfigPictuerFetter", GetConfigPictuerFetter)
    GameEvents.Subscribe("ServiceInterface_GetPlayerCardList", GetPlayerCardList);


    // ServiceInterface_GetConfigPictuerFetter
}

const StarCostInfo = $("#StarCostInfo");
const EquipPictureList = $("#EquipPictureList");

const InitPictureCostInfo = () => {
    MainPanel.SetDialogVariableInt("star_level", 14);
    StarCostInfo.RemoveAndDeleteChildren();
    for (let i = 0; i < 15; i++) {
        const StarPanel = $.CreatePanel("Panel", StarCostInfo, "", {
            class: "Star Null"
        });
        if (i >= 10) {
            StarPanel.AddClass("Vip");
        }
        // StarPanel.visible = false

    }
    EquipPictureList.RemoveAndDeleteChildren();


    SavePictureBtn.SetPanelEvent("onactivate", () => {
        ToggleDashboardLoading(true);
        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "SavePictuerFetter",
            params: {
                index: config_index,
            }
        })
    })

    RestorePictureBtn.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "RestorePictuerFetter",
            params: {
                index: config_index,
            }
        })
    })
}


const InitAllPictuerList = () => {
    AllPictuerList.RemoveAndDeleteChildren();
    // $.Msg(["PictuerFetterConfig", PictuerFetterConfig])
    for (let index in PictuerFetterConfig) {
        const suit_id = index;
        const row_data = PictuerFetterConfig[index as keyof typeof PictuerFetterConfig];
        let PictuerGroupRow = $.CreatePanel("Panel", AllPictuerList, "" + index);
        PictuerGroupRow.BLoadLayoutSnippet("PictuerGroupRow");
        PictuerGroupRow.SetDialogVariableInt("pictuer_cost", row_data.consume)
        PictuerGroupRow.SetDialogVariable("pictuer_name", $.Localize(`#custom_server_picture_${index}`))
        PictuerGroupRow.AddClass("cost_" + row_data.consume);
        PictuerGroupRow.Data<PanelDataObject>().name = $.Localize(`#custom_server_picture_${index}`);
        PictuerGroupRow.Data<PanelDataObject>().cost = row_data.consume;
        const EquipPictuerButton = PictuerGroupRow.FindChildTraverse("EquipPictuerButton")!;
        EquipPictuerButton.visible = false;
        // PictuerGroupRow.SetDialogVariableInt("")
        const FooterToggle = PictuerGroupRow.FindChildTraverse("FooterToggle") as ToggleButton;
        FooterToggle.SetPanelEvent("onactivate", () => { PictuerGroupRow.ToggleClass("ShowExtends"); })
        const List = PictuerGroupRow.FindChildTraverse("List")!;
        // $.Msg(row_data.card_ids)
        for (let _card_id of row_data.card_ids) {
            const card_id = `${_card_id}`
            const card_data = GetPictureCardData(`${card_id}`);
            let CardPanel = $.CreatePanel("Button", List, "" + card_id);
            // CardPanel.BLoadLayoutSnippet("Card");
            let _CardPanel = LoadComponent_Card(CardPanel, "card_item")
            // CardPanel.BLoadLayout("file://{resources}/layout/custom_game/dashboard/card/_components/card_item/card_item.xml",true,false);
            _CardPanel.SetCardItem(`${card_id}`, false, false);
            CardPanel.AddClass("PictureMode");
            CardPanel.AddClass("Null"); // 卡片3状态 默认空Null 未登记 UnEquip 已登记 Equip

        }


        const FooterAttributeList = PictuerGroupRow.FindChildTraverse("FooterAttributeList")!;
        SetPictureAttributeList(FooterAttributeList, row_data);
    }

    // 搜索
    CardSearchInput.SetPanelEvent("ontextentrychange", () => {
        pic_fliter_text = CardSearchInput.text;
        UpdatePictureFliter()
    })

    // 读取卡片列表
    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "GetPlayerCardList",
        params: {}
    })


}

const UpdatePictureFliter = () => {
    for (let i = 0; i < AllPictuerList.GetChildCount(); i++) {
        let PictuerGroupRow = AllPictuerList.GetChild(i)!;
        let loc_name = PictuerGroupRow.Data<PanelDataObject>().name as string;
        let text_res = loc_name.search(pic_fliter_text);
        PictuerGroupRow.visible = text_res != -1
    }
}
const GetPlayerCardList = (params: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetPlayerCardList"]>) => {
    // 这里需要等待 pictuer_list 读取完毕
    $.Schedule(0, () => {
        ToggleDashboardLoading(false)
        let card_list = Object.values(params.data.card);
        pictuer_list = params.data.pictuer_list;
        let card_object: { [card_id: string]: AM2_Server_Backpack } = {};

        for (let _card_data of card_list) {
            let card_id = "" + _card_data.item_id;
            card_object[card_id] = _card_data;
        }

        // 卡片与未注册图鉴对比
        for (let i = 0; i < AllPictuerList.GetChildCount(); i++) {
            const PicturePanel = AllPictuerList.GetChild(i)!;

            const List = PicturePanel.FindChildTraverse("List")!;

            const suit_id = PicturePanel.id;
            const row_data = PictuerFetterConfig[suit_id as keyof typeof PictuerFetterConfig];
            // $.Msg(["picture_id", picture_id])
            let pictuer_card_list: number[] = []
            if (pictuer_list[suit_id] != null) {
                pictuer_card_list = Object.values(pictuer_list[suit_id])
            }

            let max_count = row_data.consume
            let act_count = 0;
            for (let order = 0; order < List.GetChildCount(); order++) {
                const CardPanel = List.GetChild(order) as Component_CardItem;
                const card_id = CardPanel.id;
                const iCardId = parseInt(card_id)
                // 是否有登记
                if (pictuer_card_list.length > 0) {
                    let in_index = pictuer_card_list.indexOf(iCardId);
                    if (in_index != -1) {
                        CardPanel.SetHasClass("Equip", true)
                        act_count += 1;
                        CardPanel.RemoveClass("Null")
                        CardPanel.RemoveClass("UnEquip")
                    }
                }

                const card_data = card_object[card_id];
                if (card_data == null) {
                    CardPanel.SetHasClass("Null", true)
                    continue
                }
                CardPanel.ShowCardIcon(true);
                if (!CardPanel.BHasClass("Equip")) {
                    CardPanel.AddClass("UnEquip");
                    CardPanel.SetPanelEvent("onactivate", () => {
                        // $.Msg([suit_id, card_id])
                        GenericPopupsToggle("PlayerConsumeCard", true, { suit_id, card_id })
                    })
                }

            }
            // 更新属性词条
            const FooterAttributeList = PicturePanel.FindChildTraverse("FooterAttributeList")!;
            UpdatePictureAttributeList(FooterAttributeList, act_count, max_count);

            // 装备
            const EquipPictuerButton = PicturePanel.FindChildTraverse("EquipPictuerButton") as Button
            EquipPictuerButton.visible = act_count > 0;
            EquipPictuerButton.enabled = true;
            if (act_count > 0) {
                EquipPictuerButton.SetPanelEvent("onactivate", () => {

                    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
                        event_name: "ConfigPictuerFetter",
                        params: {
                            index: config_index,
                            suit_id: suit_id
                        }
                    })
                })
            }

        }


        GameEvents.SendCustomGameEventToServer("ServiceInterface", {
            event_name: "GetConfigPictuerFetter",
            params: {}
        })
    })
}

const GetConfigPictuerFetter = (params: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetConfigPictuerFetter"]>) => {
    // $.Msg(["ServiceInterface_GetConfigPictuerFetter"])
    // $.Msg(["pictuer_list",pictuer_list])
    ToggleDashboardLoading(false)
    let config_loc = params.data.locality["1"];
    let config_serve = params.data.server["1"];
    EquipPictureList.RemoveAndDeleteChildren();

    // 判断VIP
    const is_vip = params.data.is_vip == 1;
    max_star_cost = params.data.is_vip ? 15 : 10;

    for (let i = 10; i < 15; i++) {
        let starPanel = StarCostInfo.GetChild(i)!;
        starPanel.SetHasClass("Lock", !is_vip)
    }
    for (let i = 0; i < AllPictuerList.GetChildCount(); i++) {
        const PicturePanel = AllPictuerList.GetChild(i)!;
        const EquipPictuerButton = PicturePanel.FindChildTraverse("EquipPictuerButton") as Button
        EquipPictuerButton.enabled = true;
    }

    // 激活的图册ID
    let equip_cost = 0;
    for (let k in config_loc) {
        const picture_id = config_loc[k];
        const row_data = PictuerFetterConfig[picture_id as keyof typeof PictuerFetterConfig];
        let PictuerGroupRow = $.CreatePanel("Panel", EquipPictureList, picture_id)
        PictuerGroupRow.BLoadLayoutSnippet("PictuerGroupRow")
        PictuerGroupRow.AddClass("ShowExtends");
        PictuerGroupRow.SetDialogVariableInt("pictuer_cost", row_data.consume)
        equip_cost += row_data.consume
        PictuerGroupRow.SetDialogVariable("pictuer_name", $.Localize(`#custom_server_picture_${picture_id}`))
        PictuerGroupRow.AddClass("cost_" + row_data.consume)


        const FooterAttributeList = PictuerGroupRow.FindChildTraverse("FooterAttributeList")!;
        SetPictureAttributeList(FooterAttributeList, row_data);

        const pictuer_equip_info = pictuer_list[picture_id];
        if (pictuer_equip_info != null) {
            let act_count = Object.values(pictuer_equip_info).length;
            UpdatePictureAttributeList(FooterAttributeList, act_count, row_data.consume);
        }

        // 按钮
        const UnEquipPictureBtn = PictuerGroupRow.FindChildTraverse("UnEquipPictureBtn") as Button;
        UnEquipPictureBtn.SetPanelEvent("onactivate", () => {
            UnEquipPictureBtn.enabled = false;
            GameEvents.SendCustomGameEventToServer("ServiceInterface", {
                event_name: "UninstallPictuerFetter",
                params: {
                    index: config_index,
                    suit_id: picture_id
                }
            })
        })

        // 找到对应图册的装备按钮
        const PicturePanel = AllPictuerList.FindChildTraverse(picture_id)!;
        const EquipPictuerButton = PicturePanel.FindChildTraverse("EquipPictuerButton") as Button
        EquipPictuerButton.enabled = false;
    }


    // 更新消耗显示
    MainPanel.SetDialogVariableInt("star_level", equip_cost);
    for (let i = 0; i < 15; i++) {
        let starPanel = StarCostInfo.GetChild(i)!;
        starPanel.SetHasClass("Null", i >= equip_cost)
        starPanel.SetHasClass("Cost", i < equip_cost)
    }
    // 配置对比
    let is_same = JSON.stringify(config_loc) == JSON.stringify(config_serve);
    SavePictureBtn.enabled = !is_same
    RestorePictureBtn.enabled = !is_same


}

const UpdatePictureAttributeList = (FooterAttributeList: Panel, act_count: number, max_count: number) => {
    for (let i = 0; i < FooterAttributeList.GetChildCount(); i++) {
        let FooterAttribute = FooterAttributeList.GetChild(i)!;
        FooterAttribute.SetHasClass("On", act_count > i)
        if (FooterAttribute.BHasClass("Special")) {
            FooterAttribute.SetHasClass("On", act_count >= max_count)
        }
    }
    // Special

}

const SetPictureAttributeList = (FooterAttributeList: Panel, row_data: typeof PictuerFetterConfig[keyof typeof PictuerFetterConfig]) => {
    const ListValues = row_data.ListValues as { [key: string]: CustomAttributeTableType };
    let order = 1;
    for (let key in ListValues) {
        let ObjectValues = ListValues[key];
        for (let attr in ObjectValues) {
            // $.Msg(["attr",attr])
            let attr_key = "" + attr;
            let attr_value = 0;
            let row_attr = ObjectValues[attr as keyof typeof ObjectValues]
            for (let sub_key in row_attr) {
                attr_key += "." + sub_key
                attr_value = row_attr[sub_key as keyof typeof row_attr] ?? 0;
                break
            }
            let FooterAttribute = $.CreatePanel("Panel", FooterAttributeList, "");
            FooterAttribute.BLoadLayoutSnippet("FooterAttribute");

            FooterAttribute.SetDialogVariableInt("index", order)
            FooterAttribute.SetDialogVariable("attribute_name", attr_key)
            FooterAttribute.SetDialogVariable("attribute_value", attr_value + "")
            FooterAttribute.SetDialogVariable("attribute_name", $.Localize(`#custom_attribute_${attr}`).replace("%", ""))
            const StatIcon = FooterAttribute.FindChildTraverse("StatIcon")!;
            StatIcon.AddClass(attr)
            order++;
        }
    }


    let ability_id = row_data.ability_id;
    let SpecialFooterAttribute = $.CreatePanel("Panel", FooterAttributeList, "");
    SpecialFooterAttribute.BLoadLayoutSnippet("FooterAttribute")
    SpecialFooterAttribute.AddClass("Special");
    SpecialFooterAttribute.SetDialogVariableInt("index", order - 1)
    SpecialFooterAttribute.SetDialogVariable("special_text", "特殊属性: " + " 大家肯定姜傲打打卡机达克拉大家都 射手")
}

(() => {

    Init();
})();