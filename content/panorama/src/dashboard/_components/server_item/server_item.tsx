export const COMPONENTS_NAME = "server_item";

declare global {
    interface Component_ServerItem extends Panel {
        _Init(): void;
        _SetServerItemInfo(params: ServerInfoConfig): void;
        _SetCount(count: number): void;
    }
}

interface ServerInfoConfig {
    item_id: string | number;
    item_count?: number;
    show_count?: boolean;
    show_tips?: boolean;
    hide_bg?: boolean;
}


const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

const MainPanel = $.GetContextPanel() as Component_ServerItem;
const ServerItemIcon = $("#ServerItemIcon") as ImagePanel;
const rare_list = [1, 2, 3, 4, 5, 6, 7];


const _SetServerItemInfo = (params: ServerInfoConfig) => {
    let item_id = "" + params.item_id;
    let item_count = params.item_count ?? 0;
    let show_count = params.show_count ?? false;
    let hide_bg = params.hide_bg ?? false;
    // let show_tips = params.show_tips ?? 
    // $.Msg(["SetItemValue",item_id,item_count])
    let data = ServerItemList[item_id as keyof typeof ServerItemList];
    if (data) {
        let rarity = data.rarity;
        for (let rare of rare_list) {
            MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
        }
        if (data.affiliation_class == 23) {

        } else {
            //@ts-ignore
            let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
            ServerItemIcon.SetImage(image_src);
        }


        MainPanel.SetDialogVariable("count", `${item_count}`)
        MainPanel.Data<PanelDataObject>().count = item_count
        MainPanel.SetHasClass("zero", !show_count)
        MainPanel.SetHasClass("hide_bg", hide_bg)


        MainPanel.SetPanelEvent("onmouseover", () => {
            let count = MainPanel.Data<PanelDataObject>().count as number;
        })

        MainPanel.SetPanelEvent("onmouseout", () => {

        })

    }

}

const _SetCount = (count: number) => {
    MainPanel.Data<PanelDataObject>().count = count
    MainPanel.SetDialogVariable("count", `${count}`)
}

(function () {
    MainPanel._SetServerItemInfo = _SetServerItemInfo;
    MainPanel._SetCount = _SetCount;
})();