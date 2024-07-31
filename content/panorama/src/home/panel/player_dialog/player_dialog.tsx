
const PlayerReviveContainer = $("#PlayerReviveContainer");
const PlayerRuneContainer = $("#PlayerRuneContainer");
const LocalPlayerRuneDialog = $("#LocalPlayerRuneDialog");
const RuneSelectList = $("#RuneSelectList");
const localPlayer = Game.GetLocalPlayerID();
const BarHeight = 250

const StartThinkerLoop = () => {
    // UpdateLocalPlayerReviveState()
    UpdateLocalPlayerRuneDialog();
    $.Schedule(Game.GetGameFrameTime(), StartThinkerLoop)
}

const UpdateLocalPlayerRuneDialog = () => {
    const entity = Players.GetPlayerHeroEntityIndex(localPlayer);
    const pos = Entities.GetAbsOrigin(entity);
    // $.Msg(pos)
    if (pos == null) { return }
    let fOffset = Entities.GetHealthBarOffset(entity);
    fOffset = (fOffset === -1 || fOffset < BarHeight) ? BarHeight : fOffset;
    let xUI = Game.WorldToScreenX(pos[0], pos[1], pos[2] + fOffset);
    let yUI = Game.WorldToScreenY(pos[0], pos[1], pos[2] + fOffset);
    if (xUI < 0 || xUI > Game.GetScreenWidth() || yUI < 0 || yUI > Game.GetScreenHeight()) {
        LocalPlayerRuneDialog.visible = false;
        return;
    }
    LocalPlayerRuneDialog.visible = true;
    const [clampX, clampY] = GameUI.WorldToScreenXYClamped(pos);
    // $.Msg([clampX, clampY])
    const diffX = clampX - 0.5;
    const diffY = clampY - 0.5;
    xUI -= diffX * Game.GetScreenWidth() * 0.16;
    yUI -= diffY * Game.GetScreenHeight() * 0.10;

    let xoffset = 0;
    let yoffset = -30;
    LocalPlayerRuneDialog.SetPositionInPixels(
        (xUI - LocalPlayerRuneDialog.actuallayoutwidth / 2 - xoffset) / LocalPlayerRuneDialog.actualuiscale_x,
        (yUI - LocalPlayerRuneDialog.actuallayoutheight + yoffset) / LocalPlayerRuneDialog.actualuiscale_y,
        0,
    );
}



export const Init = () => {
    // PlayerReviveContainer.RemoveAndDeleteChildren();
    // PlayerRuneContainer.RemoveAndDeleteChildren()
    StartThinkerLoop();

    GameEvents.Subscribe("RuneSystem_GetRuneSelectData", event => {
        let data = event.data;
        $.Msg(["RuneSystem_GetRuneSelectData", data])
        let is_new = data.is_new_fate_check == 1;
        let rune_list = Object.values(data.item_list)
        RuneSelectList.RemoveAndDeleteChildren();
        let select_index = 0;
        for (let rune_data of rune_list) {
            let rune_name = rune_data.name;
            let rune_level = rune_data.level;
            let RuneInfo = $.CreatePanel("Panel", RuneSelectList, "");
            RuneInfo.BLoadLayoutSnippet("RuneInfo");
            // RuneInfo.SetHasClass("level_1",)
            RuneInfo.SetDialogVariable("rune_desc", $.Localize(`#custom_${rune_name}_Description`))

            let RuneIconBtn = RuneInfo.FindChildTraverse("RuneIconBtn") as Button;
            let post_index = select_index
            RuneIconBtn.SetPanelEvent("onactivate", () => {
                $.Msg(["select_index", post_index])
                GameEvents.SendCustomGameEventToServer("RuneSystem", {
                    event_name: "PostSelectRune",
                    params: {
                        index: post_index
                    }
                })

            })
            select_index++
        }
        LocalPlayerRuneDialog.SetHasClass("Show", is_new)
    })

    GameEvents.SendCustomGameEventToServer("RuneSystem", {
        event_name: "GetRuneSelectData",
        params: {}
    })
}

(function () {
    Init()
})();