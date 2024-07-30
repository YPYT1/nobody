
const PlayerReviveContainer = $("#PlayerReviveContainer");
const localPlayer = Game.GetLocalPlayerID();

const StartThinkerLoop = () => {
    // UpdateLocalPlayerReviveState()
    $.Schedule(Game.GetGameFrameTime(), StartThinkerLoop)
}

const UpdateLocalPlayerReviveState = () => {
    const entity = Players.GetPlayerHeroEntityIndex(localPlayer);

    let cur_panel = PlayerReviveContainer.FindChild(String(entity));
    const pos = Entities.GetAbsOrigin(entity);
    let fOffset = Entities.GetHealthBarOffset(entity);
    fOffset = (fOffset === -1 || fOffset < 350) ? 350 : fOffset;
    let xUI = Game.WorldToScreenX(pos[0], pos[1], pos[2] + fOffset);
    let yUI = Game.WorldToScreenY(pos[0], pos[1], pos[2] + fOffset);
    if (xUI < 0 || xUI > Game.GetScreenWidth() || yUI < 0 || yUI > Game.GetScreenHeight()) {
        if (cur_panel) { cur_panel.DeleteAsync(0); }
        return;
    }

    if (cur_panel == null) {
        cur_panel = $.CreatePanel('Panel', PlayerReviveContainer, String(entity));
        cur_panel.BLoadLayoutSnippet("PlayerRevivePanel");
    }

    const [clampX, clampY] = GameUI.WorldToScreenXYClamped(pos);
    const diffX = clampX - 0.5;
    const diffY = clampY - 0.5;
    xUI -= diffX * Game.GetScreenWidth() * 0.16;
    yUI -= diffY * Game.GetScreenHeight() * 0.10;

    let xoffset = 0;
    let yoffset = 0;
    cur_panel.SetPositionInPixels(
        (xUI - cur_panel.actuallayoutwidth / 2 - xoffset) / cur_panel.actualuiscale_x,
        (yUI - cur_panel.actuallayoutheight + yoffset) / cur_panel.actualuiscale_y,
        0,
    );
}

export const Init = () => {
    PlayerReviveContainer.RemoveAndDeleteChildren();
    // StartThinkerLoop()
}

(function () {
    // Init()
})();