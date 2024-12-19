import { GetTextureSrc } from "../../../common/custom_kv_method";
import { SetLabelDescriptionExtra } from "../../../utils/ability_description";
import { default as RuneConfigJson } from "./../../../json/config/game/rune/rune_config.json"
import { default as RuneAttrConfig } from "./../../../json/config/game/rune/rune_attr_config.json"

type runeName = keyof typeof RuneConfigJson

const PlayerReviveContainer = $("#PlayerReviveContainer");
const PlayerRuneContainer = $("#PlayerRuneContainer");
const LocalPlayerRuneDialog = $("#LocalPlayerRuneDialog");
const RuneSelectList = $("#RuneSelectList");
const RefreshBtn = $("#RefreshBtn") as Button;
const localPlayer = Game.GetLocalPlayerID();
const BarHeight = 250
const HeroState = $("#HeroState");

const SetHotKey = GameUI.CustomUIConfig().SetHotKey
const ConverAttrAndValueLabel = GameUI.CustomUIConfig().ConverAttrAndValueLabel


var refresh_count = -1;
const StartThinkerLoop = () => {
    // UpdateLocalPlayerReviveState()
    // UpdateHeroStateDialog()
    UpdateLocalPlayerRuneDialog();
    $.Schedule(Game.GetGameFrameTime(), StartThinkerLoop)
}

const UpdateHeroStateDialog = () => {
    const entity = Players.GetPlayerHeroEntityIndex(localPlayer);
    const pos = Entities.GetAbsOrigin(entity);
    // $.Msg(pos)
    if (pos == null) { return }
    let fOffset = Entities.GetHealthBarOffset(entity);
    fOffset = (fOffset === -1 || fOffset < BarHeight) ? BarHeight : fOffset;
    let xUI = Game.WorldToScreenX(pos[0], pos[1], pos[2] + fOffset);
    let yUI = Game.WorldToScreenY(pos[0], pos[1], pos[2] + fOffset);
    if (xUI < 0 || xUI > Game.GetScreenWidth() || yUI < 0 || yUI > Game.GetScreenHeight()) {
        HeroState.visible = false;
        return;
    }
    HeroState.visible = true;
    const [clampX, clampY] = GameUI.WorldToScreenXYClamped(pos);
    const diffX = clampX - 0.5;
    const diffY = clampY - 0.5;
    xUI -= diffX * Game.GetScreenWidth() * 0.16;
    yUI -= diffY * Game.GetScreenHeight() * 0.10;

    let xoffset = 0;
    let yoffset = 160;

    HeroState.SetPositionInPixels(
        Math.floor((xUI - HeroState.actuallayoutwidth / 2 - xoffset) / HeroState.actualuiscale_x),
        Math.floor((yUI - HeroState.actuallayoutheight + yoffset) / HeroState.actualuiscale_y),
        0,
    );
    // 生命属性
    let hp = Entities.GetHealth(entity)
    let max_hp = Entities.GetMaxHealth(entity)
    let mp = Entities.GetMana(entity)
    let max_mp = Entities.GetMaxMana(entity)
    HeroState.SetDialogVariableInt("hp", hp)
    HeroState.SetDialogVariableInt("max_hp", max_hp)
    HeroState.SetDialogVariableInt("mp", mp)
    HeroState.SetDialogVariableInt("max_mp", max_mp)

    HeroState.SetDialogVariableInt("hp_pct", 100 * hp / max_hp)
    HeroState.SetDialogVariableInt("mp_pct", 100 * mp / max_mp)
}

const UpdateLocalPlayerRuneDialog = () => {
    let game_time = Game.GetDOTATime(false, false);
    let over_time = LocalPlayerRuneDialog.Data<PanelDataObject>().over_time ?? 0;
    let select_timer = Math.floor(over_time - game_time)
    LocalPlayerRuneDialog.SetDialogVariableInt("select_timer", select_timer)
}

const SetHokeyPanel = () => {
    SetHotKey("R", SetRuneSelectHotkey_R)
    SetHotKey("1", SetRuneSelectHotkeyOrder_1)
    SetHotKey("2", SetRuneSelectHotkeyOrder_2)
    SetHotKey("3", SetRuneSelectHotkeyOrder_3)
    SetHotKey("4", SetRuneSelectHotkeyOrder_4)
    // $.RegisterKeyBind(RuneSelectList, "key_R", () => {
    //     $.Msg(["RuneSelectList","key_R"])
    //     // $.DispatchEvent("DropInputFocus", e);
    // });
}

const SetRuneSelectHotkey_R = () => {
    // $.Msg(["SetRuneSelectHotkey_R"])
    let is_show = LocalPlayerRuneDialog.BHasClass("Show");
    if (is_show && refresh_count > 0) {
        GameEvents.SendCustomGameEventToServer("RuneSystem", {
            event_name: "ConsumeRefreshCount",
            params: {}
        })
    }
}

const SetRuneSelectHotkeyOrder_1 = () => {
    let is_show = LocalPlayerRuneDialog.BHasClass("Show");
    let childPanel = RuneSelectList.GetChild(0)
    if (is_show && childPanel != null) {
        GameEvents.SendCustomGameEventToServer("RuneSystem", {
            event_name: "PostSelectRune",
            params: {
                index: 0
            }
        })
    }
}

const SetRuneSelectHotkeyOrder_2 = () => {
    let is_show = LocalPlayerRuneDialog.BHasClass("Show");
    let childPanel = RuneSelectList.GetChild(1)
    if (is_show && childPanel != null) {
        GameEvents.SendCustomGameEventToServer("RuneSystem", {
            event_name: "PostSelectRune",
            params: {
                index: 1
            }
        })
    }
}

const SetRuneSelectHotkeyOrder_3 = () => {
    let is_show = LocalPlayerRuneDialog.BHasClass("Show");
    let childPanel = RuneSelectList.GetChild(2)
    if (is_show && childPanel != null) {
        GameEvents.SendCustomGameEventToServer("RuneSystem", {
            event_name: "PostSelectRune",
            params: {
                index: 2
            }
        })
    }
}

const SetRuneSelectHotkeyOrder_4 = () => {
    let is_show = LocalPlayerRuneDialog.BHasClass("Show");
    let childPanel = RuneSelectList.GetChild(3)
    if (is_show && childPanel != null) {
        GameEvents.SendCustomGameEventToServer("RuneSystem", {
            event_name: "PostSelectRune",
            params: {
                index: 3
            }
        })
    }
}
export const Init = () => {
    HeroState.RemoveAndDeleteChildren();
    // HeroState.BLoadLayoutSnippet("HeroState");
    StartThinkerLoop();
    LocalPlayerRuneDialog.SetDialogVariableInt("refresh_count", 99);
    LocalPlayerRuneDialog.SetDialogVariableInt("select_timer", 99);
    SetHokeyPanel();

    RefreshBtn.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("RuneSystem", {
            event_name: "ConsumeRefreshCount",
            params: {}
        })
    })

    GameEvents.Subscribe("RuneSystem_GetRuneSelectData", event => {
        let data = event.data;
        let time = data.time;
        LocalPlayerRuneDialog.Data<PanelDataObject>().over_time = time
        LocalPlayerRuneDialog.SetDialogVariableInt("refresh_count", data.player_refresh_count);
        refresh_count = data.player_refresh_count
        let is_new = data.is_new_fate_check == 1;
        let rune_list = Object.values(data.item_list)
        RuneSelectList.RemoveAndDeleteChildren();
        let select_index = 0;
        let reward_type = data.type;
        LocalPlayerRuneDialog.SetHasClass("type_0", reward_type == 0);
        LocalPlayerRuneDialog.SetHasClass("type_1", reward_type == 1);
        LocalPlayerRuneDialog.SetHasClass("type_2", reward_type == 2);

        for (let _data of rune_list) {
            let post_index = select_index
            let level = _data.level;
            let index = _data.level_index;
            let name = _data.name as runeName;
            let RuneInfo = $.CreatePanel("Panel", RuneSelectList, "");
            RuneInfo.BLoadLayoutSnippet("RuneInfo");
            let row_rune_data = RuneConfigJson[name];
            let ObjectValues = row_rune_data.ObjectValues;
            let AbilityValues = row_rune_data.AbilityValues;
            let textrue = row_rune_data.AbilityTextureName;
            let rune_desc = SetLabelDescriptionExtra($.Localize(`#custom_${name}_Description`), index, AbilityValues, ObjectValues);
            RuneInfo.SetDialogVariable("rune_desc", rune_desc)
            let level_label = Array(index + 1).join("I");
            // $.Msg(["index",index,level_label])
            RuneInfo.SetDialogVariable("rune_name", $.Localize(`#custom_${name}`) + " " + level_label)
            RuneInfo.SetHasClass("rarity_4", level == 4)
            RuneInfo.SetHasClass("rarity_5", level == 5)
            RuneInfo.SetHasClass("rarity_6", level == 6)
            let img_src = GetTextureSrc(textrue)
            let RuneIconBtn = RuneInfo.FindChildTraverse("RuneIconBtn") as Panel;
            RuneIconBtn.RemoveAndDeleteChildren()
            let rune_image_id = `RuneImage${post_index}`
            let RuneImage = $.CreatePanel("Image", RuneIconBtn, rune_image_id, { class: "RuneImage" });
            RuneImage.SetImage(img_src)
            let RunImageShwdow = $.CreatePanel("Image", RuneIconBtn, "", { class: "RunImageShwdow", });
            RunImageShwdow.SetImage(`Panel://${rune_image_id}`);

            // 热键
            RuneInfo.SetDialogVariable("hotkey", `${post_index + 1}`)
            // 符文属性
            // let attr_label = [];
            const RuneAttr = RuneInfo.FindChildTraverse("RuneAttr")!;
            let attr_list = _data.attr_list;
            for (let attr_id in attr_list) {
                let attr_config = RuneAttrConfig[attr_id as keyof typeof RuneAttrConfig]
                let attr_name = $.Localize(`#custom_attribute_${attr_config.AttrName}`).replace("%", "")
                let attr_value = attr_list[attr_id]
                let attr_value_label = ConverAttrAndValueLabel(attr_config.AttrName, attr_value, attr_config.Decimal)
                let attr_rare = 0;
                if (attr_value < attr_config.r_5) {
                    attr_rare = 4
                } else if (attr_value < attr_config.r_6) {
                    attr_rare = 5
                } else {
                    attr_rare = 6
                }
                let RuneAttrRows = $.CreatePanel("Panel", RuneAttr, "");
                RuneAttrRows.BLoadLayoutSnippet("RuneAttrRows");
                RuneAttrRows.SetHasClass("rare_" + attr_rare, true)
                RuneAttrRows.SetDialogVariable("rune_attr", `${attr_name}+${attr_value_label}`);
                // attr_label.push(`${attr_name}+${attr_value_label}`)
            }
            // RuneInfo.SetDialogVariable("rune_attr", attr_label.join("<br>"));
            RuneInfo.SetPanelEvent("onactivate", () => {
                // $.Msg(["select_index", post_index])
                GameEvents.SendCustomGameEventToServer("RuneSystem", {
                    event_name: "PostSelectRune",
                    params: {
                        index: post_index
                    }
                })
            })

            select_index++
        }
        LocalPlayerRuneDialog.SetHasClass("Show", is_new);

        // if (is_new) {
        //     $.DispatchEvent("SetInputFocus", RuneSelectList);
        // } else {
        //     $.DispatchEvent("DropInputFocus", RuneSelectList);
        // }

    })

    GameEvents.SendCustomGameEventToServer("RuneSystem", {
        event_name: "GetRuneSelectData",
        params: {}
    })
}

(function () {
    Init()
})();