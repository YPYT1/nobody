import { GetTextureSrc } from "../../../common/custom_kv_method";
import { LoadComponent_Card } from "../_components/component_manager";


const MainPanel = $.GetContextPanel();
const AllPictuerList = $("#AllPictuerList");
const PictuerFetterConfig = GameUI.CustomUIConfig()._PictuerFetterConfig;
const GetPictureCardData = GameUI.CustomUIConfig().GetPictureCardData;

export const Init = () => {
    MainPanel.SetDialogVariableInt("card_count", 0);
    MainPanel.SetDialogVariableInt("card_max", 0);

    InitAllPictuerList()
    InitPictureCostInfo()
    CustomEventSubscribe();
}


const CustomEventSubscribe = () => {

    GameEvents.Subscribe("ServiceInterface_GetConfigPictuerFetter", event => {

    })

    GameEvents.Subscribe("ServiceInterface_GetPictuerFetterList", event => {
        let data = event.data
        $.Msg(["data", data])
    })

    GameEvents.Subscribe("ServiceInterface_GetPlayerCardList", GetPlayerCardList);
}

const StarCostInfo = $("#StarCostInfo");
const EquipPictureList = $("#EquipPictureList");

const InitPictureCostInfo = () => {
    MainPanel.SetDialogVariableInt("star_level", 14);

    StarCostInfo.RemoveAndDeleteChildren();
    for (let i = 0; i < 15; i++) {
        const StarPanel = $.CreatePanel("Panel", StarCostInfo, "");
        StarPanel.AddClass("Star")
    }

    EquipPictureList.RemoveAndDeleteChildren();
    // const PictureList = ["1", "3", "5"]
    // for (let pic_id of PictureList) {
    //     const row_data = PictuerFetterConfig[pic_id as keyof typeof PictuerFetterConfig];
    //     const PictureItem = $.CreatePanel("Panel", EquipPictureList, "picture_" + pic_id)
    //     PictureItem.BLoadLayoutSnippet("PictureItem");
    //     PictureItem.AddClass("ShowExtends");
    //     PictureItem.SetDialogVariableInt("pictuer_cost", row_data.consume)
    //     PictureItem.SetDialogVariable("pictuer_name", $.Localize(`#custom_server_picture_${pic_id}`))
    //     PictureItem.AddClass("cost_" + row_data.consume)
    //     const FooterAttributeList = PictureItem.FindChildTraverse("FooterAttributeList")!;
    //     SetPictureAttributeList(FooterAttributeList, row_data);
    // }
}


const InitAllPictuerList = () => {
    AllPictuerList.RemoveAndDeleteChildren();
    // $.Msg(["PictuerFetterConfig", PictuerFetterConfig])
    for (let index in PictuerFetterConfig) {
        const row_data = PictuerFetterConfig[index as keyof typeof PictuerFetterConfig];
        let PictuerGroupRow = $.CreatePanel("Panel", AllPictuerList, "pictuer_" + index);
        PictuerGroupRow.BLoadLayoutSnippet("PictuerGroupRow");
        PictuerGroupRow.SetDialogVariableInt("pictuer_cost", row_data.consume)
        PictuerGroupRow.SetDialogVariable("pictuer_name", $.Localize(`#custom_server_picture_${index}`))
        PictuerGroupRow.AddClass("cost_" + row_data.consume)
        // PictuerGroupRow.SetDialogVariableInt("")
        const FooterToggle = PictuerGroupRow.FindChildTraverse("FooterToggle") as ToggleButton;
        FooterToggle.SetPanelEvent("onactivate", () => { PictuerGroupRow.ToggleClass("ShowExtends"); })


        const List = PictuerGroupRow.FindChildTraverse("List")!;
        // $.Msg(row_data.card_ids)
        for (let card_id of row_data.card_ids) {
            const card_data = GetPictureCardData(`${card_id}`);
            let CardPanel = $.CreatePanel("Button", List, "card_" + card_id);
            // CardPanel.BLoadLayoutSnippet("Card");

            let _CardPanel = LoadComponent_Card(CardPanel,"card_item")
            // CardPanel.BLoadLayout("file://{resources}/layout/custom_game/dashboard/card/_components/card_item/card_item.xml",true,false);
            _CardPanel.SetCardItem(`${card_id}`,false);

            CardPanel.AddClass("PictureMode");
            CardPanel.AddClass("Null"); // 卡片3状态 默认空Null 未登记UnEquip 已登记Equip
            // CardPanel.SetHasClass("rare_" + card_data.rarity, true)
            // $.Msg(["card_id",card_id])

            
            // $.Msg(["AbilityTextureName3:",card_data])
            
            // CardPanel.SetDialogVariable("card_name", $.Localize(`#custom_server_card_${card_id}`))
            // CardPanel.AddClass("Card")


            CardPanel.SetPanelEvent("onactivate", () => {
                // 关于登记
                $.Msg(["card_id", card_id])
            })
        }


        const FooterAttributeList = PictuerGroupRow.FindChildTraverse("FooterAttributeList")!;
        SetPictureAttributeList(FooterAttributeList, row_data);
    }

    // 读取卡片列表
    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "GetPlayerCardList",
        params: {}
    })

    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "GetPictuerFetterList",
        params: {

        }
    })
}

const GetPlayerCardList = (params: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetPlayerCardList"]>) => {
    let card_list = Object.values(params.data.card);
    let card_object: { [card_id: string]: AM2_Server_Backpack } = {};
   
    for (let card_data of card_list) {
        
    }

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
    SpecialFooterAttribute.SetDialogVariableInt("index", order)
    SpecialFooterAttribute.SetDialogVariable("special_text", "特殊属性: " + " 大家肯定姜傲打打卡机达克拉大家都 射手")
}
(() => {
    Init();
})();