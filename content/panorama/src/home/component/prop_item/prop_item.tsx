export const COMPONENTS_NAME = "prop_item";

const MainPanel = $.GetContextPanel() as GameComponent_PropItem;
const MysteriousShopConfig = GameUI.CustomUIConfig().KvData.MysteriousShopConfig;
const ItemIcon = $("#ItemIcon") as ImagePanel;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

type PropItemId = keyof typeof MysteriousShopConfig

interface PropItemConfig {
    item_id?: string;
    rare?: number;
    state?: number;
    show_tips?: boolean;

}
declare global {
    interface GameComponent_PropItem extends Panel {
        // _SetPropItemId(item_id: PropItemId): void;
        // _SetState(state: number): void;
        _SetConfig(params: PropItemConfig): void;
    }
}

function _SetPropItemId(item_id: PropItemId) {
    let item_data = MysteriousShopConfig[item_id as PropItemId];
    let AbilityTextureName = item_data.AbilityTextureName;
    let src = GetTextureSrc(AbilityTextureName)
    ItemIcon.SetImage(src)
}

/** 0空 1正常 2锁定 */
function _SetState(state: number) {
    MainPanel.SetHasClass("state_0", state == 0)
    MainPanel.SetHasClass("state_1", state == 1)
    MainPanel.SetHasClass("state_1", state == 2)
}

function _SetConfig(params: PropItemConfig) {
    if (params.item_id) {
        let item_id = params.item_id;
        let item_data = MysteriousShopConfig[item_id as PropItemId];
        let AbilityTextureName = item_data.AbilityTextureName;
        let src = GetTextureSrc(AbilityTextureName)
        ItemIcon.SetImage(src)

        MainPanel.Data<PanelDataObject>().item_id = params.item_id
    }

    if (params.rare) {
        for (let i = 1; i < 7; i++) {
            MainPanel.SetHasClass("rare_" + i, i == params.rare)
        }
        MainPanel.Data<PanelDataObject>().rare = params.rare
    }

    if (params.state != null) {
        MainPanel.SetHasClass("state_0", params.state == 0)
        MainPanel.SetHasClass("state_1", params.state == 1)
        MainPanel.SetHasClass("state_1", params.state == 2)
    }

    if (params.show_tips != null) {
        if (params.show_tips == true) {
           
            MainPanel.SetPanelEvent("onmouseover", () => {
                MainPanel.SetDialogVariable("item_desc","test code")
                let rare = MainPanel.Data<PanelDataObject>().rare as number;
                let item_id = MainPanel.Data<PanelDataObject>().item_id as string;
                $.DispatchEvent(
                    "UIShowCustomLayoutParametersTooltip",
                    MainPanel,
                    "custom_tooltip_limititem",
                    "file://{resources}/layout/custom_game/tooltip/limit_item/layout.xml",
                    `item_id=${item_id}&rare=${rare}`
                );
            })
        } else {
            MainPanel.SetPanelEvent("onmouseover", () => { })
        }

        MainPanel.SetPanelEvent("onmouseout", () => {
            $.DispatchEvent('UIHideCustomLayoutTooltip', "custom_tooltip_limititem");
        })
    }


}

(function () {
    // MainPanel._SetPropItemId = _SetPropItemId;
    // MainPanel._SetState = _SetState;
    MainPanel._SetConfig = _SetConfig
})();