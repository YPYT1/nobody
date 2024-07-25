import { FormatIntToString, GetUnitModifierStack } from "../../../utils/method";

const OverheadBarContainer = $("#OverheadBarContainer");
const TopHealthBarContent = $("#TopHealthBarContent");
const HudHeathBarContent = $("#HudHeathBarContent");
// const BossHealthBar = $("#BossHealthBar");
const UPDATE_PER_TIME = 0.25;
/** 毎管血多少HP */
const EVER_MAX_HP = 10000;
/** 有几种颜色 */
const color_list = [
    '#EB4B4B', // 远古 // Boss 开始颜色
    '#e4ae39', // 不朽 max
    '#ADE55C', // 至宝
    '#b0c3d9', // 普通
    '#5e98d9', // 罕见
    '#4b69ff', // 稀有
    '#8847ff', // 神话
    '#d32ce6', // 传说
]
const TOTAL_COLOR_COUNT = color_list.length;


let overhead_boss_list: EntityIndex[] = [];
let overhead_panel_boss: { [key: EntityIndex]: Panel; } = {};

interface HealtrBarPanelData {
    update_time: number;
    last_update: number;
    last_hp: number;
    curr_index: number;
    entitiy: EntityIndex;
}

const CMsg_GetEntityListHealthBar = (params: NetworkedData<CustomGameEventDeclarations["CMsg_GetEntityListHealthBar"]>) => {
    $.Msg(["CMsg_GetEntityListHealthBar", params.data.boss_list])
    // let boss_list: { [key: string]: EntityIndex; } =  ;
    overhead_boss_list = Object.values(params.data.boss_list);

    // 移除不存在的
    for (let i = 0; i < TopHealthBarContent.GetChildCount(); i++) {
        let row_healthbar = TopHealthBarContent.GetChild(i);
        if (row_healthbar) {
            let entity = row_healthbar.Data<HealtrBarPanelData>().entitiy;
            if (entity == 0) {
                row_healthbar.SetHasClass("Closed", true);
                row_healthbar.DeleteAsync(1);
            } else if (!Entities.IsValidEntity(entity) || !Entities.IsAlive(entity)) {
                if (overhead_panel_boss[entity]) {
                    delete overhead_panel_boss[entity];
                }
                row_healthbar.SetHasClass("Closed", true);
                row_healthbar.DeleteAsync(1);
            }
        }
    }

}

function StartUpdateHealthBar() {
    UpdateTopPanelBoss();
    // UpdateOverheadThinker();
    $.Schedule(Game.GetGameFrameTime(), StartUpdateHealthBar);
}


function UpdateTopPanelBoss() {
    // $.Msg(["overhead_boss_list",overhead_boss_list])
    overhead_boss_list.forEach((entity) => {
        if (!Entities.IsValidEntity(entity)) {
            return;
        }
        let pPanel = overhead_panel_boss[entity];

        // $.Msg(["pPanel", pPanel,OverheadBarContainer])
        if (pPanel === null || pPanel === undefined) {
            pPanel = $.CreatePanel("Panel", TopHealthBarContent, "");
            pPanel.BLoadLayoutSnippet("TopHealthBar");
            overhead_panel_boss[entity] = pPanel;
            let unitname = Entities.GetUnitName(entity);
            let max_hp = Entities.GetMaxHealth(entity)
            pPanel.SetDialogVariable("boss_name", $.Localize("#" + unitname));
            pPanel.Data<HealtrBarPanelData>().entitiy = entity;
            pPanel.Data<HealtrBarPanelData>().update_time = Game.GetDOTATime(false, false) + UPDATE_PER_TIME;
            pPanel.Data<HealtrBarPanelData>().last_hp = 0;
            pPanel.Data<HealtrBarPanelData>().last_update = 0;
            pPanel.Data<HealtrBarPanelData>().curr_index = -1;
        }

        let update_time = pPanel.Data<HealtrBarPanelData>().update_time;
        let curr_index = pPanel.Data<HealtrBarPanelData>().curr_index

        let unit_hp_max = Entities.GetMaxHealth(entity);
        let unit_hp_current = Entities.GetHealth(entity);

        let mod_hp_value = Math.ceil(unit_hp_current / EVER_MAX_HP);
        let mod_hp_max_value = Math.ceil(unit_hp_max / EVER_MAX_HP);
        let color_index = (mod_hp_max_value - mod_hp_value) % TOTAL_COLOR_COUNT;
        let next_color_index = (mod_hp_max_value - mod_hp_value + 1) % TOTAL_COLOR_COUNT;

        let HudHeathBar_0 = pPanel.FindChildTraverse("HudHeathBar_0")!;
        if (mod_hp_value <= 1) {
            HudHeathBar_0.style.washColor = `#000000`
        } else {
            HudHeathBar_0.style.washColor = `${color_list[next_color_index]}`
        }

        let HudHeathBar_2 = pPanel.FindChildTraverse("HudHeathBar_2")!;
        HudHeathBar_2.style.washColor = `${color_list[color_index]}`
        let healthWidth = GetNumDecimals((unit_hp_current % EVER_MAX_HP) / EVER_MAX_HP * 100, 1);

        // $.Msg(["healthWidth",healthWidth])
        pPanel.FindChildTraverse("HudHeathBar_2")!.style.width = `${healthWidth}%`;
        if (curr_index != mod_hp_value && mod_hp_value > 1) {
            pPanel.Data<HealtrBarPanelData>().curr_index = mod_hp_value;
            let HudHeathBar_0 = pPanel.FindChildTraverse("HudHeathBar_1")!;
            HudHeathBar_0.SetHasClass("DisTransition", true)
            HudHeathBar_0.style.width = `100%`;
            HudHeathBar_0.SetHasClass("DisTransition", false)
            pPanel.Data<HealtrBarPanelData>().update_time = 0
        } else if (update_time <= Game.GetDOTATime(false, false)) {
            pPanel.FindChildTraverse("HudHeathBar_1")!.style.width = `${healthWidth}%`;
            pPanel.Data<HealtrBarPanelData>().update_time = Game.GetDOTATime(false, false) + UPDATE_PER_TIME;
        }

        pPanel.SetDialogVariable("current_hp", `` + Entities.GetHealth(entity))
        pPanel.SetDialogVariable("max_hp", `` + Entities.GetMaxHealth(entity))
        pPanel.SetDialogVariableInt("hp_count", mod_hp_value);

    });
}


function UpdateOverheadThinker() {
    let entities = Entities.GetAllEntitiesByName('npc_dota_creature');
    entities.forEach((entity) => {
        let cur_panel = OverheadBarContainer.FindChild(String(entity));
        const unit_label = Entities.GetUnitLabel(entity);
        // $.Msg(["unit_label",unit_label])
        if (
            !Entities.IsValidEntity(entity)
            || !Entities.IsAlive(entity)
            || unit_label === 'dummy'
            || unit_label === 'event'
            || (unit_label != "unit_elite")
        ) {
            if (cur_panel) {
                cur_panel.DeleteAsync(0);
            }
            return;
        }
        
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
            cur_panel = $.CreatePanel('Panel', OverheadBarContainer, String(entity));
            cur_panel.BLoadLayoutSnippet("OverheadBar");
            if (unit_label == "unit_elite") {
                cur_panel.AddClass("elite")
            }
        }

        let healthWidth = GetNumDecimals((Entities.GetHealth(entity) / Entities.GetMaxHealth(entity)) * 100, 1);
        if (cur_panel.FindChildTraverse("HealthBar0")) {
            cur_panel.FindChildTraverse("HealthBar0")!.style.width = `${healthWidth}%`;
            cur_panel.FindChildTraverse("HealthBar")!.style.width = `${healthWidth}%`;
        }

        const [clampX, clampY] = GameUI.WorldToScreenXYClamped(pos);
		const diffX = clampX - 0.5;
		const diffY = clampY - 0.5;
		xUI -= diffX * Game.GetScreenWidth() * 0.16;
		yUI -= diffY * Game.GetScreenHeight() * 0.10;

        let xoffset = 0;
        let yoffset = 30;
        cur_panel.SetPositionInPixels(
            (xUI - cur_panel.actuallayoutwidth / 2 - xoffset) / cur_panel.actualuiscale_x,
            (yUI - cur_panel.actuallayoutheight + yoffset) / cur_panel.actualuiscale_y,
            0,
        );

    })
}

const GetNumDecimals = (num: number, count: number) => {
    let numStr = num + ""
    var result = numStr
    if (numStr.indexOf(".") >= 0) {
        result = numStr.substring(0, numStr.indexOf(".") + count);
    }
    return result;
}

const Init = () => {
    TopHealthBarContent.RemoveAndDeleteChildren();
    OverheadBarContainer.RemoveAndDeleteChildren();
    GameEvents.Subscribe('CMsg_GetEntityListHealthBar', CMsg_GetEntityListHealthBar);
    GameEvents.SendCustomGameEventToServer('CMsg', {
        event_name: "GetEntityListHealthBar",
        params: {}
    });
    // overhead_boss_list = [];
    StartUpdateHealthBar();

}

(function () {
    Init()
})();