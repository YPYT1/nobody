
const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

declare global {
    interface CustomUIConfig {
        SetServerImagePanel(parent: Panel, goods_id: string): ServerImagePanel
    }
}

interface ServerImagePanel extends ImagePanel {
    ServerImage: ServerImage;
}
class ServerImage {

    ContentPanel: ImagePanel;
    rare_list = [1, 2, 3, 4, 5, 6, 7];

    constructor(e: ImagePanel, item_id: string | number) {
        this.ContentPanel = e;
        e.SetHasClass("ServerImage", true)
        this._SetItemId("" + item_id)
    }

    _SetItemId = (item_id: string) => {
        const MainPanel = this.ContentPanel
        MainPanel.SetHasClass("is_rmb", item_id == "rmb")
        if (item_id == "rmb") {
            MainPanel.SetImage("s2r://panorama/images/custom_game/component/server/store_item/rmb_png.vtex");
            return
        }
        let data = ServerItemList[item_id as keyof typeof ServerItemList];
        MainPanel.Data<PanelDataObject>().item_id = item_id
        if (data) {
            let rarity = data.quality;
            for (let rare of this.rare_list) {
                MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
            }
            if (data.affiliation_class == 23) {

            } else {
                //@ts-ignore
                let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
                MainPanel.SetImage(image_src);
            }

        } else {
            MainPanel.SetImage("");
        }

    }

}

export function SetServerImagePanel(e: ImagePanel, goods_id: string) {
    const e2 = e as ServerImagePanel;
    e2.ServerImage = new ServerImage(e, goods_id)
    return e2
}