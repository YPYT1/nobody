import { LoadCustomComponent } from "../../dashboard/_components/component_manager";

const MainPanel = $.GetContextPanel();

const ItemList = $("#ItemList")


const testdata: AM2_Draw_Lottery_Data[] = [
    { "n": 1, "q": 3, "i": 3509, "k": "14" },
    { "n": 5000, "q": 3, "i": 1003, "k": "3" },
    { "n": 1000, "q": 2, "i": 1003, "k": "2" },
    { "n": 15000, "q": 4, "i": 1003, "k": "4" },
    { "n": 1, "q": 3, "i": 3509, "k": "14" },
    { "n": 1000, "q": 2, "i": 1003, "k": "2" },
    { "n": 500, "q": 1, "i": 1003, "k": "1" },
    { "n": 1, "q": 3, "i": 3511, "k": "16" },
    { "n": 5000, "q": 3, "i": 1003, "k": "3" },
    { "n": 1, "q": 3, "i": 3512, "k": "17", "r": { "3509": 1 } },
]
export const Init = () => {
    MainPanel.SetHasClass("Show", false);
    ItemList.RemoveAndDeleteChildren()
    for (let i = 0; i < 10; i++) {
        let _ = $.CreatePanel("Panel", ItemList, "");
        _.BLoadLayoutSnippet("ResultItem");
        _.SetHasClass("is_odd", i % 2 == 0)
        const _ServerItem = _.FindChildTraverse("ServerItem")!
        const ServerItem = LoadCustomComponent(_ServerItem, "server_item");
        ServerItem._SetServerItemInfo({ show_count: false, show_tips: true })

        const _ConverServerItem = _.FindChildTraverse("ConverServerItem")!
        const ConverServerItem = LoadCustomComponent(_ConverServerItem, "server_item");
        ConverServerItem._SetServerItemInfo({ show_count: false, show_tips: true })
        _.SetDialogVariable("conver_item_count", "99999999");
        _.SetDialogVariable("item_count", "99999999");
        _.SetDialogVariable("item_name", "物品名字");
        _.visible = false;
    }

    MainPanel.SetPanelEvent("onactivate", () => {

        MainPanel.SetHasClass("Show", false);

        $.Schedule(0.1, () => {
            ClearItemListPanel()
        })

    })

    // $.Msg(["Subscribe ServiceInterface_GetPlayerServerDrawLottery"])
    GameEvents.Subscribe("ServiceInterface_GetPlayerServerDrawLottery", event => {
        let list_data = Object.values(event.data)
        GenerateGachaResult(list_data)
    })

    // GenerateGachaResult(testdata)
}

function GenerateGachaResult(list_data: AM2_Draw_Lottery_Data[]) {
    GameUI.CustomUIConfig().EventBus.publish("popup_loading", { show: false, })
    ClearItemListPanel();
    for (let i = 0; i < ItemList.GetChildCount(); i++) {
        let rowPanel = ItemList.GetChild(i)!;
        rowPanel.visible = false;
        rowPanel.RemoveClass("Play");
    }

    for (let i = 0; i < list_data.length; i++) {
        let _data = list_data[i];
        let rowPanel = ItemList.GetChild(i)!;
        rowPanel.visible = true;
        rowPanel.AddClass("rare_" + _data.q)



        if (_data.r) {
            rowPanel.AddClass("Conver")
            // 实际奖品
            const rdata = _data.r
            for (let _id in rdata) {
                const ServerItem = rowPanel.FindChildTraverse("ServerItem") as Component_ServerItem;
                ServerItem._SetItemId(_id)
                rowPanel.SetDialogVariable("item_count", "" + rdata[_id]);
                break
            }

            // 原本物品
            const ConverServerItem = rowPanel.FindChildTraverse("ConverServerItem") as Component_ServerItem;
            ConverServerItem._SetItemId(_data.i)
            rowPanel.SetDialogVariable("conver_item_count", "" + _data.n);

        } else {
            const ServerItem = rowPanel.FindChildTraverse("ServerItem") as Component_ServerItem;
            ServerItem._SetItemId(_data.i)
            rowPanel.SetDialogVariable("item_count", "" + _data.n);
        }

        rowPanel.SetDialogVariable("item_name", $.Localize("#custom_serveritem_" + _data.i));
        rowPanel.AddClass("Play")
    }

    MainPanel.SetHasClass("Show", true);
}

function ClearItemListPanel() {
    for (let i = 0; i < ItemList.GetChildCount(); i++) {
        let rowPanel = ItemList.GetChild(i)!;
        rowPanel.RemoveClass("Conver");
        rowPanel.RemoveClass("Play");
        for (let r = 1; r <= 6; r++) {
            rowPanel.RemoveClass("rare_" + r)
        }

    }
}
(() => {
    Init()
})();