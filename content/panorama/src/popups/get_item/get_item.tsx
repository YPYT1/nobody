import { LoadCustomComponent } from "../../dashboard/_components/component_manager";

const MainPanel = $.GetContextPanel();

const ItemList = $("#ItemList")

export const Init = () => {

    ItemList.RemoveAndDeleteChildren()
    for (let i = 0; i < 10; i++) {
        let _ = $.CreatePanel("Panel", ItemList, "");
        const ServerItem = LoadCustomComponent(_, "server_item");
        ServerItem._SetServerItemInfo({ show_count: true, show_tips: true })
        ServerItem.visible = false;
    }

    MainPanel.SetPanelEvent("onactivate", () => {
        MainPanel.SetHasClass("Show", false);
    })

    GameEvents.Subscribe("ServiceInterface_GetServerItemPopUp", event => {
        // $.Msg(["ServiceInterface_GetServerItemPopUp"]);
        let items = Object.values(event.data.items);
        for (let i = 0; i < ItemList.GetChildCount(); i++) {
            let rowPanel = ItemList.GetChild(i)!;
            rowPanel.visible = false;
        }
        for (let i = 0; i < items.length; i++) {
            let ServerItem = ItemList.GetChild(i) as Component_ServerItem;
            ServerItem.visible = true;
            let item_id = items[i].item_id;
            let item_count = items[i].number;
            ServerItem._SetItemId(item_id);
            ServerItem._SetCount(item_count)
        }

        MainPanel.SetHasClass("Show", true);
    })

}

(() => {
    Init()
})();