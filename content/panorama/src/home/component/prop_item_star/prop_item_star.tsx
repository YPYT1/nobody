export const __COMPONENTS_NAME = "prop_item_star";

declare global {
    interface GameComponent_PropItemStar extends Panel {
        _Init(max: number, curr: number, size: number): void;
        _SetMax(max: number): void;
        _SetStar(curr: number): void;
        _SetSize(size: number): void;
    }
}

const MainPanel = $.GetContextPanel() as GameComponent_PropItemStar;

function _Init(max: number, curr: number, size: number) {
    for (let i = 0; i < MainPanel.GetChildCount(); i++) {
        let StarPanel = MainPanel.GetChild(i)!;
        StarPanel.visible = i < max;
        StarPanel.SetHasClass("On", i < curr)
    }
    _SetSize(size);
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

function _SetSize(size: number) {
    for (let i = 0; i < MainPanel.GetChildCount(); i++) {
        let StarPanel = MainPanel.GetChild(i)!;
        StarPanel.style.width = `${size}px`;
        StarPanel.style.height = `${size}px`;
    }
}
(function () {
    MainPanel._Init = _Init;
    MainPanel._SetMax = _SetMax;
    MainPanel._SetStar = _SetStar;
    MainPanel._SetSize = _SetSize;
})();