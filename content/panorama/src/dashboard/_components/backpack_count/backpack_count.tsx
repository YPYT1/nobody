export const __COMPONENTS_NAME = "backpack_count";

declare global {
    interface Component_BackpackCount extends Panel {
        _SetItemId(item_id: string): Component_BackpackCount;
        _GetCount(): number;
    }
}

const MainPanel = $.GetContextPanel() as Component_BackpackCount;
const EventBus = GameUI.CustomUIConfig().EventBus;

function _SetItemId(item_id: string) {
    MainPanel.Data<PanelDataObject>().item_id = item_id;
    let backpack_table = GameUI.CustomUIConfig().getStorage("backpack_count_table");
    let count = 0;
    if (backpack_table != null) {
        count = backpack_table[item_id] ?? 0;
    }

    MainPanel.SetDialogVariable("count", "" + count);
    MainPanel.Data<PanelDataObject>().count = count
    return MainPanel
}


function _GetCount() {
    return MainPanel.Data<PanelDataObject>().count as number
}

(function () {
    // 更新背包
    MainPanel._SetItemId = _SetItemId;
    MainPanel._GetCount = _GetCount;
    EventBus.clear("backpack_count_update");
    EventBus.subscribe("backpack_count_update", data => {
        let item_id = MainPanel.Data<PanelDataObject>().item_id as string;
        let count = data[item_id] ?? 0;
        MainPanel.SetDialogVariable("count", "" + count);
        MainPanel.Data<PanelDataObject>().count = count
    })
})();