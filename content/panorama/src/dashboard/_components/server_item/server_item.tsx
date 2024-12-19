export const COMPONENTS_NAME = "server_item";

declare global {
    interface Component_ServerItem extends Panel {
        _Init(): void;
        _SetItemId(item_id: string | number): void;
        _SetServerItemInfo(params: ServerInfoConfig): void;
        _SetCount(count: number): void;
        _UpdateCount(): void;
        _GetCount(): number;
    }
}

interface ServerInfoConfig {
    item_id?: string | number;
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

const _SetItemId = (item_id: string | number) => {
    let data = ServerItemList["" + item_id as keyof typeof ServerItemList];
    MainPanel.Data<PanelDataObject>().item_id = item_id
    if (data) {
        let rarity = data.quality;
        for (let rare of rare_list) {
            MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
        }
        if (data.affiliation_class == 23) {

        } else {
            //@ts-ignore
            let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
            ServerItemIcon.SetImage(image_src);
        }

        // let show_tips = MainPanel.Data<PanelDataObject>().show_tips as boolean;
        // if (show_tips){
        //     MainPanel.SetPanelEvent("onmouseover", () => {
        //         let count = MainPanel.Data<PanelDataObject>().count as number;
        //         let item_id = MainPanel.Data<PanelDataObject>().item_id as string;
        //         $.DispatchEvent(
        //             "UIShowCustomLayoutParametersTooltip",
        //             MainPanel,
        //             "custom_tooltip_serveritem",
        //             "file://{resources}/layout/custom_game/tooltip/server_item/layout.xml",
        //             `item_id=${item_id}&count=${count}&show_count=${show_count ? 1 : 0}&r=${rarity}`
        //         );
        //     })
        // }
    } else {
        ServerItemIcon.SetImage("");
    }
}
const _SetServerItemInfo = (params: ServerInfoConfig) => {
    let item_id = "" + params.item_id;
    let item_count = params.item_count ?? 0;
    let show_count = params.show_count ?? false;
    let hide_bg = params.hide_bg ?? false;
    let show_tips = params.show_tips ?? false;
    // $.Msg(["SetItemValue",item_id,item_count])

    MainPanel.SetHasClass("zero", !show_count)
    MainPanel.SetHasClass("hide_bg", hide_bg)
    MainPanel.Data<PanelDataObject>().item_id = item_id
    MainPanel.Data<PanelDataObject>().show_tips = show_tips ?? false;
    MainPanel.Data<PanelDataObject>().show_count = show_count ?? false;

    if (params.item_id != null) {
        let data = ServerItemList[item_id as keyof typeof ServerItemList];
        if (data) {
            let rarity = data.quality;
            MainPanel.Data<PanelDataObject>().rarity = rarity
            for (let rare of rare_list) {
                MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
            }
            if (data.affiliation_class == 23) {

            } else {
                //@ts-ignore
                let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
                // $.Msg(["image_src", image_src])
                ServerItemIcon.SetImage(image_src);
            }


            MainPanel.SetDialogVariable("count", `${item_count}`)
            MainPanel.Data<PanelDataObject>().count = item_count







        } else {
            MainPanel.SetHasClass("zero", false)
            MainPanel.SetDialogVariable("count", `${item_id}`)
        }
    }
}

const _SetCount = (count: number) => {
    MainPanel.Data<PanelDataObject>().count = count
    MainPanel.SetDialogVariable("count", `${count}`)
}

const _UpdateCount = () => {
    let item_id = MainPanel.Data<PanelDataObject>().item_id as string;
    let backpack_table = GameUI.CustomUIConfig().getStorage("backpack_count_table")
    let item_count = backpack_table[item_id] ?? 0;
    MainPanel.Data<PanelDataObject>().count = item_count;
    MainPanel.SetDialogVariable("count", `${item_count}`)
}

const _GetCount = () => {
    return (MainPanel.Data<PanelDataObject>().count as number) ?? 0
}

(function () {
    MainPanel._SetServerItemInfo = _SetServerItemInfo;
    MainPanel._SetCount = _SetCount;
    MainPanel._GetCount = _GetCount;
    MainPanel._SetItemId = _SetItemId;
    MainPanel._UpdateCount = _UpdateCount;
    MainPanel.SetPanelEvent("onmouseover", () => {
        let item_id = MainPanel.Data<PanelDataObject>().item_id as string | number;
        let show_tips = MainPanel.Data<PanelDataObject>().show_tips as boolean;
        if (show_tips && item_id != null && item_id != "undefined" && item_id != -1) {
            let count = MainPanel.Data<PanelDataObject>().count as number;
            let show_count = MainPanel.Data<PanelDataObject>().show_count as boolean;
            let rarity = MainPanel.Data<PanelDataObject>().rarity as number
            $.DispatchEvent(
                "UIShowCustomLayoutParametersTooltip",
                MainPanel,
                "custom_tooltip_serveritem",
                "file://{resources}/layout/custom_game/tooltip/server_item/layout.xml",
                `item_id=${item_id}&count=${count}&show_count=${show_count ? 1 : 0}&r=${rarity}`
            );
        }
    })

    MainPanel.SetPanelEvent("onmouseout", () => {
        $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_serveritem");
    })
})();