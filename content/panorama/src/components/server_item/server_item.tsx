const ServerShopList = GameUI.CustomUIConfig().KvData.server_shop_list;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

declare global {

    interface CustomUIConfig {
        SetServerItemPanel(parent: Panel, goods_id: string): ServerItemPanel
    }


}


interface ServerItemPanel extends Panel {
    ServerItem: ServerItem;
}

class ServerItem {

    ContentPanel: Panel;
    StoreIcon: ImagePanel;


    g_limit_max: number;
    item_id: string;
    rare_list = [1, 2, 3, 4, 5, 6, 7];

    constructor(e: Panel, item_id: string) {
        this.ContentPanel = e;
        this.item_id = item_id;
    }

}

export function SetServerItemPanel(parent: Panel, goods_id: string) {
    let e = $.CreatePanel("Panel", parent, goods_id);
    let state = e.BLoadLayoutSnippet("ServerItem");
    const e2 = e as ServerItemPanel;
    e2.ServerItem = new ServerItem(e, goods_id)
    return e2
}