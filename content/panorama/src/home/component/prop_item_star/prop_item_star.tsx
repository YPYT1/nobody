export const COMPONENTS_NAME = "prop_item_star";

declare global {
    interface GameComponent_PropItemStar extends Panel {
        _Init(max: number, curr: number): void;
        _SetMax(max: number): void;
        _SetStar(curr: number): void;
    }
}

const MainPanel = $.GetContextPanel() as GameComponent_PropItemStar;

function _Init(max: number, curr: number) {
    for (let i = 0; i < MainPanel.GetChildCount(); i++) {
        let StarPanel = MainPanel.GetChild(i)!;
        StarPanel.visible = i < max;
        StarPanel.SetHasClass("On", i < curr)
    }
}
function _SetMax(max: number) {
    for (let i = 0; i < MainPanel.GetChildCount(); i++) {
        let StarPanel = MainPanel.GetChild(i)!;
        StarPanel.visible = i < max;
    }
}

function _SetStar(curr: number) {
    for (let i = 0; i < MainPanel.GetChildCount(); i++) {
        let StarPanel = MainPanel.GetChild(i)!;
        StarPanel.SetHasClass("On", i < curr)
    }
}

(function () {
    MainPanel._Init = _Init;
    MainPanel._SetMax = _SetMax;
    MainPanel._SetStar = _SetStar;
})();