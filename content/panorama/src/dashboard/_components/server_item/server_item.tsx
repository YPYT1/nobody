export const __COMPONENTS_NAME = 'server_item';

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

type ServerItemStyleTypes = 'default' | 'horizontal';
interface ServerInfoConfig {
    item_id?: string | number;
    item_count?: number;
    show_count?: boolean;
    show_tips?: boolean;
    hide_bg?: boolean;
    style?: ServerItemStyleTypes;
}

const ServerItemList = GameUI.CustomUIConfig().KvData.ServerItemList;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

const MainPanel = $.GetContextPanel() as Component_ServerItem;
const ServerItemIcon = $('#ServerItemIcon') as ImagePanel;
const rare_list = [1, 2, 3, 4, 5, 6, 7];

const _SetItemId = (item_id: string | number) => {
    ServerItemIcon.SetHasClass('is_rmb', item_id == 'rmb');
    if (item_id == 'rmb') {
        ServerItemIcon.SetImage('s2r://panorama/images/custom_game/component/server/store_item/rmb_png.vtex');
        return;
    }
    const data = ServerItemList[('' + item_id) as keyof typeof ServerItemList];
    MainPanel.Data<PanelDataObject>().item_id = item_id;
    if (data) {
        const rarity = data.quality;
        for (const rare of rare_list) {
            MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
        }

        const is_card = data.affiliation_class == 23;
        MainPanel.SetHasClass('is_card', is_card);
        MainPanel.SetHasClass('default', !is_card);
        //@ts-ignore
        const image_src = GetTextureSrc(data.AbilityTextureName ?? '');
        ServerItemIcon.SetImage(image_src);
    } else {
        ServerItemIcon.SetImage('');
    }
};
const _SetServerItemInfo = (params: ServerInfoConfig) => {
    const style = params.style ?? 'default';
    const item_id = '' + params.item_id;
    const item_count = params.item_count ?? 0;
    const show_count = params.show_count ?? false;
    const hide_bg = params.hide_bg ?? false;
    const show_tips = params.show_tips ?? false;
    // $.Msg(["SetItemValue",item_id,item_count])
    MainPanel.AddClass(style);
    MainPanel.SetHasClass('zero', !show_count);
    MainPanel.SetHasClass('hide_bg', hide_bg);
    MainPanel.Data<PanelDataObject>().item_id = item_id;
    MainPanel.Data<PanelDataObject>().show_tips = show_tips ?? false;
    MainPanel.Data<PanelDataObject>().show_count = show_count ?? false;

    if (params.item_id != null) {
        const data = ServerItemList[item_id as keyof typeof ServerItemList];
        if (data) {
            _SetItemId(item_id);
            // let rarity = data.quality;
            // MainPanel.Data<PanelDataObject>().rarity = rarity
            // for (let rare of rare_list) {
            //     MainPanel.SetHasClass(`rare_${rare}`, rarity == rare);
            // }
            // if (data.affiliation_class == 23) {

            // } else {
            //     //@ts-ignore
            //     let image_src = GetTextureSrc(data.AbilityTextureName ?? "");
            //     // $.Msg(["image_src", image_src])
            //     ServerItemIcon.SetImage(image_src);
            // }
            MainPanel.SetDialogVariable('count', `${item_count}`);
            MainPanel.Data<PanelDataObject>().count = item_count;
        } else {
            MainPanel.SetHasClass('zero', false);
            MainPanel.SetDialogVariable('count', `${item_id}`);
        }
    }
};

const _SetCount = (count: number) => {
    MainPanel.Data<PanelDataObject>().count = count;
    MainPanel.SetDialogVariable('count', `${count}`);
};

const _UpdateCount = () => {
    const item_id = MainPanel.Data<PanelDataObject>().item_id as string;
    const backpack_table = GameUI.CustomUIConfig().getStorage('backpack_count_table');
    let item_count = 0;
    if (backpack_table != null) {
        item_count = backpack_table[item_id] ?? 0;
    }

    MainPanel.Data<PanelDataObject>().count = item_count;
    MainPanel.SetDialogVariable('count', `${item_count}`);
};

const _GetCount = () => {
    return (MainPanel.Data<PanelDataObject>().count as number) ?? 0;
};

(function () {
    MainPanel._SetServerItemInfo = _SetServerItemInfo;
    MainPanel._SetCount = _SetCount;
    MainPanel._GetCount = _GetCount;
    MainPanel._SetItemId = _SetItemId;
    MainPanel._UpdateCount = _UpdateCount;
    MainPanel.SetPanelEvent('onmouseover', () => {
        const item_id = MainPanel.Data<PanelDataObject>().item_id as string | number;
        const show_tips = MainPanel.Data<PanelDataObject>().show_tips as boolean;
        if (show_tips && item_id != null && item_id != 'undefined' && item_id != -1) {
            const count = MainPanel.Data<PanelDataObject>().count as number;
            const show_count = MainPanel.Data<PanelDataObject>().show_count as boolean;
            const rarity = MainPanel.Data<PanelDataObject>().rarity as number;
            $.DispatchEvent(
                'UIShowCustomLayoutParametersTooltip',
                MainPanel,
                'custom_tooltip_serveritem',
                'file://{resources}/layout/custom_game/tooltip/server_item/layout.xml',
                `item_id=${item_id}&count=${count}&show_count=${show_count ? 1 : 0}&r=${rarity}`
            );
        }
    });

    MainPanel.SetPanelEvent('onmouseout', () => {
        $.DispatchEvent('UIHideCustomLayoutTooltip', 'custom_tooltip_serveritem');
    });
})();
