declare global {
    interface Component_ServerItem extends Panel {
        SetItemID(item_id: string): void;
    }
}

export const MainPanel = $.GetContextPanel() as Component_ServerItem;

const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;



const SetItemID = (item_id: string) => {

}



(function () {
    MainPanel.SetItemID = SetItemID;
})();