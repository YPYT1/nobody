
const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

declare global {
    interface CustomUIConfig {
        SetComponent_BackpackCount(parent: Panel, goods_id: string): BackpackCountPanel
    }
}

interface LabelStyleProp {
    font_size?: number;
    color?: string;
}

interface BackpackCountPanel extends ImagePanel {
    BackpackCount: BackpackCount;
}

class BackpackCount {

    ContentPanel: ImagePanel;
    item_id: string;

    constructor(e: ImagePanel, item_id: string) {
        // $.Msg(["constructor BackpackCount", item_id])
        this.ContentPanel = e;
        this.item_id = "" + item_id;
        e.SetHasClass("BackpackCount", true)
        this._SetItemId("" + item_id)

        GameEvents.Subscribe("ServiceInterface_GetPlayerServerPackageData", event => {
            // $.Msg(["ServiceInterface_GetPlayerServerPackageData",this.item_id])
            $.Schedule(0.2, () => {
                const MainPanel = this.ContentPanel;
                const data = GameUI.CustomUIConfig().getStorage("backpack_count_table");
                if (data) {

                    let count = data[item_id] ?? 0;
                    MainPanel.SetDialogVariable("count", "" + count);
                    MainPanel.Data<PanelDataObject>().count = count
                } else {
                    MainPanel.SetDialogVariable("count", "" + 0);
                    MainPanel.Data<PanelDataObject>().count = 0
                }
            })
        });

    }

    _SetItemId = (item_id: string) => {
        const MainPanel = this.ContentPanel
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

    _SetLabelStyle(params: LabelStyleProp) {
        const MainPanel = this.ContentPanel
        if (params.color) {
            MainPanel.style.color = `${params.color}`
        }

        if (params.font_size) {
            MainPanel.style.fontSize = `${params.font_size}px`
        }

    }

    _GetCount() {
        const MainPanel = this.ContentPanel
        return MainPanel.Data<PanelDataObject>().count as number
    }

}

export function SetComponent_BackpackCount(e: ImagePanel, goods_id: string) {
    const e2 = e as BackpackCountPanel;
    e2.BackpackCount = new BackpackCount(e, goods_id)
    return e2
}