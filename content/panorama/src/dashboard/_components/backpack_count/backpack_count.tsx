export const __COMPONENTS_NAME = "backpack_count";


interface LabelStyleProp {
    font_size?: number;
    color?: string;
}
declare global {
    interface Component_BackpackCount extends Panel {
        _SetItemId(item_id: string): Component_BackpackCount;
        _SetLabelStyle(params: LabelStyleProp): void;
        _GetCount(): number;
    }
}

const MainPanel = $.GetContextPanel() as Component_BackpackCount;
const CountLabel = $("#CountLabel")
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

function _SetLabelStyle(params: LabelStyleProp) {
    if (params.color) {
        CountLabel.style.color = `${params.color}`
    }

    if (params.font_size) {
        CountLabel.style.fontSize = `${params.font_size}px`
    }

}

function _GetCount() {
    return MainPanel.Data<PanelDataObject>().count as number
}

(function () {
    // 更新背包
    MainPanel._SetItemId = _SetItemId;
    MainPanel._GetCount = _GetCount;
    MainPanel._SetLabelStyle = _SetLabelStyle;
    
    EventBus.clear("backpack_count_update");
    EventBus.subscribe("backpack_count_update", data => {
        let item_id = MainPanel.Data<PanelDataObject>().item_id as string;
        let count = data[item_id] ?? 0;
        MainPanel.SetDialogVariable("count", "" + count);
        MainPanel.Data<PanelDataObject>().count = count
    })
})();