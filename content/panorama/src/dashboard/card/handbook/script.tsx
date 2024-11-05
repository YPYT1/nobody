import { LoadComponent_Card } from "../_components/component_manager";

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

export const Init = () => {
    MainPanel.SetDialogVariableInt("card_count", 0);
    MainPanel.SetDialogVariableInt("card_max", 0);
    MainPanel.SetDialogVariableInt("compose_cost", 0)

    InitComposeButton();
    InitComposeViews();
    InitCardList();
    CustomEventSubscribe();

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
                let item_id = row_source.Data<PanelDataObject>().item_id;
                if (item_id == null) { return }
                row_source.Data<PanelDataObject>().item_id = null;
                let compose_xy = [i, j]
                // $.Msg(["compose_xy", compose_xy, card_compose_list[i][j]])
                card_compose_list[i].splice(j, 1)
                row_source.SetHasClass("has_item", false);
                for (let r = 1; r <= 6; r++) { row_source.RemoveClass("rare_" + r) }
                let CardPanel = CardList.FindChildTraverse(`item_${item_id}`)!
                CardPanel.Data<PanelDataObject>().count += 1;
                CardPanel.SetDialogVariableInt("count", CardPanel.Data<PanelDataObject>().count);
                UpdateComposeInfo()
            })
        }

    }
}

const InitComposeButton = () => {

    ButtonComposeMode1.SetPanelEvent("onactivate", () => {
        // $.Msg(["ButtonComposeMode1 card_compose_list", card_compose_list])
        // ButtonComposeMode1.enabled = false;
        SendCompoundCard();
    })

    ButtonComposeMode2.SetPanelEvent("onactivate", () => {
        // $.Msg(["ButtonComposeMode2 card_compose_list", card_compose_list])

        SendCompoundCard();
    })
}

const SendCompoundCard = () => {
    let list: string[][] = [];
    for (let row of card_compose_list) {
        if (row.length == ROW_CARD_LIMIT) {
            list.push(row)
        }
    }
    // $.Msg(["list", list])
    GameEvents.SendCustomGameEventToServer("ServiceInterface", {
        event_name: "CompoundCard",
        params: {
            list: list
        }
    })
}

const GetPlayerCardList = (params: NetworkedData<CustomGameEventDeclarations["ServiceInterface_GetPlayerCardList"]>) => {
    let data = params.data;
    // $.Msg(["data",])
    // 清空合成表
    card_compose_list = [[], [], [], [], [], [], [], []]
    UpdateComposeInfo();

    let card_list = Object.values(data.card);
    card_list.sort((a, b) => {
        let data_a = GetPictureCardData(`${a.item_id}`);
        let data_b = GetPictureCardData(`${b.item_id}`);
        return data_a.rarity - data_b.rarity
    })


    for (let card of card_list) {
        let item_id = card.item_id;
        let card_id = `${item_id}`;
        let panel_id = `card_${card_id}`
        const CardPanel = CardList.FindChildTraverse(panel_id) as Component_CardItem;
        if (CardPanel == null) { continue }
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
            const l_rare = CardPanel.Data<PanelDataObject>().rare as number;
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
    for (let i = 0; i < card_list_count - 1; i++) {
        for (let j = 1; j < card_list_count - 1 - i; j++) {
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
    // let reduc_card_object: { [item_id: number]: number } = {};
    for (let i = 0; i < MAX_COMPOSE_LIMIT; i++) {
        let row_compose_panel = ComposeList.GetChild(i)!;
        let SourceList = row_compose_panel.FindChildTraverse("SourceList")!;
        let row_compose = card_compose_list[i];
        for (let j = 0; j < SourceList.GetChildCount(); j++) {
            let row_source = SourceList.GetChild(j)!;
            for (let r = 1; r <= 6; r++) {
                row_source.RemoveClass("rare_" + r);
                row_source.SetHasClass("has_item", false)
            }
        }
        if (row_compose == null) {
            continue
        }

        for (let j = 0; j < row_compose.length; j++) {
            let row_source = SourceList.GetChild(j)!;
            let item_id = row_compose[j];
            SetComposeItemInfo(row_source, item_id)
        }
    }

}

const SetComposeItemInfo = (e: Panel, item_id: string) => {
    let data = GetPictureCardData(`${item_id}`);
    for (let r = 1; r <= 6; r++) {
        e.SetHasClass("rare_" + r, data.rarity == r)
    }
    e.Data<PanelDataObject>().item_id = item_id
    e.SetDialogVariable("item_id", `${item_id}`)
    e.SetHasClass("has_item", true)
}

const CustomEventSubscribe = () => {


}

const InitCardList = () => {

    const _PictuerCardData = GameUI.CustomUIConfig()._PictuerCardData
    let CardListData = Object.values(_PictuerCardData);
    CardListData.sort((a, b) => { return b.rarity - a.rarity })
    CardList.RemoveAndDeleteChildren();

    for (let card_data of CardListData) {
        let card_id = `${card_data.item_id}`;
        let _CardPanel = $.CreatePanel("Panel", CardList, `card_${card_id}`);
        let CardPanel = LoadComponent_Card(_CardPanel, "card_item")
        CardPanel.SetCardItem(card_id, true, true);
        CardPanel.SetDialogVariableInt("count", 0);
        CardPanel.Data<PanelDataObject>().count = 0;
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