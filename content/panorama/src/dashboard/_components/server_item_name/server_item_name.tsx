export const __COMPONENTS_NAME = "server_item_name";

declare global {
    interface Component_ServerItemName extends Panel {
        _SetItemId(item_id: string): void;
        _SetSize(size:number):void;
    }
}

const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
const MainPanel = $.GetContextPanel() as Component_ServerItemName;
const Name = $("#Name") as LabelPanel;
const _SetItemId = (item_id: string) => {
    let data = ServerItemList[item_id as keyof typeof ServerItemList];
    if (data) {
        let rarity = data.quality;
        for (let r = 1; r <= 6; r++) {
            MainPanel.SetHasClass(`rare_${r}`, rarity == r);
        }

        let item_name = $.Localize("#custom_serveritem_" + item_id)
        MainPanel.SetDialogVariable("item_name", item_name)
    } else {
        MainPanel.SetDialogVariable("item_name", "未知:" + item_id)
    }
}

const _SetSize = (size:number)=>{
    Name.style.fontSize = `${size}`;
}

(function () {
    MainPanel._SetItemId = _SetItemId;
    MainPanel._SetSize = _SetSize
})();