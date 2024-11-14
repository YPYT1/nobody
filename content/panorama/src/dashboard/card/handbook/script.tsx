import { ToggleDashboardLoading } from "../../components";
import { LoadCustomComponent } from "../../_components/component_manager";

const MainPanel = $.GetContextPanel();
const CardRarityDropDown = $("#CardRarityDropDown") as DropDown;
const CardSearchInput = $("#CardSearchInput") as TextEntry;
const CardList = $("#CardList");
const ComposeList = $("#ComposeList");

const ButtonComposeMode1 = $("#ButtonComposeMode1") as Button;
const ButtonComposeMode2 = $("#ButtonComposeMode2") as Button;

/** 每行合成卡片上限 */
const ROW_CARD_LIMIT = 3;
/** 最多可一次合成多少行的卡片 */
const MAX_COMPOSE_LIMIT = 8;
let card_compose_list: string[][] = []

const RarityOptionList = ["all", "ss", "s", "a", "b", "c"];

// 快捷方法
// const GetServerItemData = GameUI.CustomUIConfig().GetServerItemData;
const GetPictureCardData = GameUI.CustomUIConfig().GetPictureCardData;
const _PictuerCardData = GameUI.CustomUIConfig()._PictuerCardData;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

export const Init = () => {
    MainPanel.SetDialogVariableInt("card_count", 0);
    MainPanel.SetDialogVariableInt("card_max", 0);
    MainPanel.SetDialogVariableInt("compose_cost", 0)

    InitComposeButton();
    InitComposeViews();
    InitCardList();
    InitCardRarityDropDown()
    CustomEventSubscribe();

}

const card_rarity = {
    "All": -1,
    "SS": 6,
    "S": 5,
    "A": 4,
    "B": 3,
    "C": 2,
}

let fliter_ratity = -1;
let fliter_text = "";
const InitCardRarityDropDown = () => {
    CardRarityDropDown.RemoveAllOptions();
    for (let key in card_rarity) {
        let id = card_rarity[key as keyof typeof card_rarity];
        let optionLabel = $.CreatePanel("Label", CardRarityDropDown, `${id}`, {
            text: key,
            html: true,
        });
        CardRarityDropDown.AddOption(optionLabel)
    }
    CardRarityDropDown.SetSelectedIndex(0);
    CardRarityDropDown.SetPanelEvent("oninputsubmit", () => {
        let id = CardRarityDropDown.GetSelected().id
        fliter_ratity = parseInt(id);
        FliterCardList()
    })

    CardSearchInput.SetPanelEvent("ontextentrychange", () => {
        fliter_text = CardSearchInput.text
        FliterCardList()
    })

}

const FliterCardList = () => {
    for (let i = 0; i < CardList.GetChildCount(); i++) {
        const CardPanel = CardList.GetChild(i)!;
        const loc_rarity = CardPanel.Data<PanelDataObject>().rarity as number;
        const loc_name = CardPanel.Data<PanelDataObject>().name as string;
        let text_res = loc_name.search(fliter_text);
        let Show = (fliter_ratity == -1 || loc_rarity == fliter_ratity) && (fliter_text.length == 0 || text_res != -1)
        CardPanel.visible = Show
    }
}

const InitComposeViews = () => {
    ComposeList.RemoveAndDeleteChildren();
    card_compose_list = [[], [], [], [], [], [], [], []]

    for (let i = 0; i < MAX_COMPOSE_LIMIT; i++) {
        let ComposePanel = $.CreatePanel("Panel", ComposeList, "row_" + i);
        ComposePanel.BLoadLayoutSnippet("CardCompose");

        let SourceList = ComposePanel.FindChildTraverse("SourceList")!;
        for (let j = 0; j < SourceList.GetChildCount(); j++) {
            let row_source = SourceList.GetChild(j)!;
            row_source.SetHasClass("has_item", false)
            row_source.SetPanelEvent("onactivate", () => {
                let card_id = row_source.Data<PanelDataObject>().card_id;
                if (card_id == null) { return }
                row_source.Data<PanelDataObject>().card_id = null;
                let compose_xy = [i, j]
                // $.Msg(["compose_xy", compose_xy, card_compose_list[i][j]])
                card_compose_list[i].splice(j, 1)
                row_source.SetHasClass("has_item", false);
                for (let r = 1; r <= 6; r++) { row_source.RemoveClass("rare_" + r) }
                // $.Msg(["card_id",card_id])
                let CardPanel = CardList.FindChildTraverse(`${card_id}`)!
                // $.Msg(["CardPanel",CardPanel])
                let count = CardPanel.Data<PanelDataObject>().count;
                // $.Msg(["count",count])
                CardPanel.Data<PanelDataObject>().count += 1;
                CardPanel.SetDialogVariableInt("count", CardPanel.Data<PanelDataObject>().count);
                UpdateComposeInfo()
            })
        }

    }
}

const InitComposeButton = () => {

    ButtonComposeMode1.SetPanelEvent("onactivate", () => {
        SendCompoundCard(0);
    })

    ButtonComposeMode2.SetPanelEvent("onactivate", () => {
        SendCompoundCard(1);
    })
}

const SendCompoundCard = (state: number = 1) => {
    ToggleDashboardLoading(true);
    let list: string[][] = [];
    for (let row of card_compose_list) {
        if (row.length == ROW_CARD_LIMIT) {
            list.push(row)
        }
    }
    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "CompoundCard",
        params: {
            list: list,
            type: state
        }
    })
}

const GetPlayerCardList = (params: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetPlayerCardList"]>) => {
    $.Msg(["Card ServiceInterface_GetPlayerCardList"])
    let data = params.data;
    // $.Msg(["data",data])
    let card = data.card;


    // 清空合成表
    card_compose_list = [[], [], [], [], [], [], [], []]
    UpdateComposeInfo();
    let card_list = Object.values(data.card);
    card_list.sort((a, b) => {
        let data_a = GetPictureCardData(`${a.item_id}`);
        let data_b = GetPictureCardData(`${b.item_id}`);
        return data_a.rarity - data_b.rarity
    })
    for (let i = 0; i < CardList.GetChildCount(); i++) {
        let CardPanel = CardList.GetChild(i)!
        CardPanel.SetDialogVariableInt("count", 0);
    }
    // 更新已登记的图鉴
    let pictuer_list = data.pictuer_list;
    let picture_card_list: string[] = []
    const CardPanel = CardList.FindChildTraverse("3201")
    for (let pic_id in pictuer_list) {
        let card_list = Object.values(pictuer_list[pic_id]);
        for (let card_id of card_list) {
            let panel1 = CardList.FindChildTraverse(`${card_id}`) as Component_CardItem;
            panel1.Data<PanelDataObject>().has = 1;
            panel1.ShowCardIcon(true)
        }
    }

    for (let card of card_list) {
        let item_id = card.item_id;
        let card_id = `${item_id}`;
        const CardPanel = CardList.FindChildTraverse(card_id) as Component_CardItem;
        if (CardPanel == null) {
            continue
        }
        CardPanel.ShowCardIcon(true);
        CardPanel.SetDialogVariableInt("count", card.number);
        CardPanel.Data<PanelDataObject>().count = card.number;
        CardPanel.Data<PanelDataObject>().has = 1;

        // tooltips

        // onact
        CardPanel.SetPanelEvent("onactivate", () => {
            // 当前卡片数量
            if (CardPanel.Data<PanelDataObject>().count <= 0) {
                // 无多余卡片
                return
            }
            const l_rare = CardPanel.Data<PanelDataObject>().rarity as number;
            const l_card_id = CardPanel.Data<PanelDataObject>().card_id as string;
            // 同行为同品质
            let index = 0;
            for (let i = 0; i < MAX_COMPOSE_LIMIT; i++) {
                let row_compose = card_compose_list[i];
                // $.Msg(["I", i, row_compose])
                if (row_compose.length < ROW_CARD_LIMIT) {
                    // 当前卡片品质
                    if (row_compose.length == 0) {
                        CardPanel.Data<PanelDataObject>().count -= 1;
                        CardPanel.SetDialogVariableInt("count", CardPanel.Data<PanelDataObject>().count);
                        card_compose_list[i] = [l_card_id]
                        break;
                    } else {
                        // 
                        let f_id = row_compose[0];
                        let f_data = GetPictureCardData(`${f_id}`);
                        let f_rare = f_data.rarity;
                        if (f_rare == l_rare) {
                            CardPanel.Data<PanelDataObject>().count -= 1;
                            CardPanel.SetDialogVariableInt("count", CardPanel.Data<PanelDataObject>().count);
                            row_compose.push(l_card_id)
                            break
                        } else {
                            continue
                        }
                    }
                }

            }
            // $.Msg(["card_compose_list",card_compose_list])
            // 更新
            UpdateComposeInfo()
        })
    }

    // 排序
    let card_list_count = CardList.GetChildCount()
    for (let i = 0; i < card_list_count; i++) {
        for (let j = 0; j < card_list_count - 1 - i; j++) {
            let panel1 = CardList.GetChild(j) as Component_CardItem;
            let panel2 = CardList.GetChild(j + 1) as Component_CardItem;
            if (panel1.Data<PanelDataObject>().has < panel2.Data<PanelDataObject>().has) {
                CardList.MoveChildBefore(panel2, panel1);
            }

        }
    }



}

const UpdateComposeInfo = () => {
    // $.Msg(["card_compose_list", card_compose_list.length])
    // $.Msg(card_compose_list)

    for (let i = 0; i < MAX_COMPOSE_LIMIT; i++) {
        let row_compose_panel = ComposeList.GetChild(i)!;
        let SourceList = row_compose_panel.FindChildTraverse("SourceList")!;
        let row_compose = card_compose_list[i];
        for (let j = 0; j < SourceList.GetChildCount(); j++) {
            let row_source = SourceList.GetChild(j) as ImagePanel;
            for (let r = 1; r <= 6; r++) {
                row_source.RemoveClass("rare_" + r);
                row_source.SetHasClass("has_item", false)
            }
            row_source.SetImage("");
        }
        if (row_compose == null) {
            continue
        }

        for (let j = 0; j < row_compose.length; j++) {
            let row_source = SourceList.GetChild(j) as ImagePanel;
            let card_id = row_compose[j];
            SetComposeItemInfo(row_source, card_id)
        }
    }

}

const SetComposeItemInfo = (e: ImagePanel, card_id: string) => {
    let data = GetPictureCardData(`${card_id}`);
    for (let r = 1; r <= 6; r++) {
        e.SetHasClass("rare_" + r, data.rarity == r)
    }
    e.Data<PanelDataObject>().card_id = card_id
    e.SetDialogVariable("card_id", `${card_id}`)
    e.SetHasClass("has_item", true)

    let card_data = GetPictureCardData(card_id);

    e.SetImage(GetTextureSrc(card_data.AbilityTextureName))
}

const CustomEventSubscribe = () => {


}

const InitCardList = () => {

    // const _PictuerCardData = GameUI.CustomUIConfig()._PictuerCardData
    let CardListData = Object.values(_PictuerCardData);
    CardListData.sort((a, b) => { return b.rarity - a.rarity })
    CardList.RemoveAndDeleteChildren();

    for (let card_data of CardListData) {
        let card_id = `${card_data.item_id}`;
        let _CardPanel = $.CreatePanel("Panel", CardList, `${card_id}`);
        let CardPanel = LoadCustomComponent(_CardPanel, "card_item")
        CardPanel.SetCardItem(card_id, true, true);
        CardPanel.SetDialogVariableInt("count", 0);
        CardPanel.Data<PanelDataObject>().count = 0;
        CardPanel.Data<PanelDataObject>().name = $.Localize("#custom_server_card_" + card_id)
    }

    GameEvents.Subscribe("ServiceInterface_GetPlayerCardList", GetPlayerCardList);
    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "GetPlayerCardList",
        params: {}
    })
}
const SetCardAttribute = (card: Panel, rarity: number,) => {

}

(() => {
    Init();
})();