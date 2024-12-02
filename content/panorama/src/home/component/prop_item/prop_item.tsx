export const COMPONENTS_NAME = "prop_item";

const MainPanel = $.GetContextPanel() as GameComponent_PropItem;
const MysteriousShopConfig = GameUI.CustomUIConfig().KvData.MysteriousShopConfig;
const ItemIcon = $("#ItemIcon") as ImagePanel;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;

type PropItemId = keyof typeof MysteriousShopConfig

interface PropItemConfig {
    item_id?: PropItemId;
    star?: number;
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
    let item_data = MysteriousShopConfig[item_id];
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
        let item_data = MysteriousShopConfig[item_id];
        let AbilityTextureName = item_data.AbilityTextureName;
        let src = GetTextureSrc(AbilityTextureName)
        ItemIcon.SetImage(src)
    }

    if (params.star) {
        MainPanel.Data<PanelDataObject>().star = params.star
    }

    if (params.state != null) {
        MainPanel.SetHasClass("state_0", params.state == 0)
        MainPanel.SetHasClass("state_1", params.state == 1)
        MainPanel.SetHasClass("state_1", params.state == 2)
    }

    if (params.show_tips != null) {
        if (params.show_tips == true) {
            MainPanel.SetPanelEvent("onmouseover", () => {

            })
        }

        MainPanel.SetPanelEvent("onmouseout", () => {

        })
    }


}

(function () {
    // MainPanel._SetPropItemId = _SetPropItemId;
    // MainPanel._SetState = _SetState;
    MainPanel._SetConfig = _SetConfig
})();