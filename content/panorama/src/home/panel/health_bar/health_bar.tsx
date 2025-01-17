import { Entities_FindBuffID } from "../../../utils/entities";
import { FormatIntToString, GetUnitModifierStack } from "../../../utils/method";

const OverheadBarContainer = $("#OverheadBarContainer");
const TopHealthBarContent = $("#TopHealthBarContent");
const HudHeathBarContent = $("#HudHeathBarContent");
// const BossHealthBar = $("#BossHealthBar");
const UPDATE_PER_TIME = 0.25;
/** 毎管血多少HP */
const EVER_MAX_HP = 1000;
/** 毎管血为多少百分比 */
const EVER_HP_PCT = 5;
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
    max_hp: number;
    curr_hp: number;
    curr_index: number;
    layer_num: number;
    entitiy: EntityIndex;
}

let health_bar_object: {
    [key: string]: {
        max_hp: number;
        curr_hp: number;
    }
} = {}
const CMsg_GetEntityListHealthBar = (params: NetworkedData<CustomGameEventDeclarations["CMsg_GetEntityListHealthBar"]>) => {
    // $.Msg(["CMsg_GetEntityListHealthBar", params.data.boss_list])
    // let boss_list: { [key: string]: EntityIndex; } =  ;
    overhead_boss_list = Object.values(params.data.boss_list);

    // 移除不存在的
    for (let i = 0; i < TopHealthBarContent.GetChildCount(); i++) {
        let row_healthbar = TopHealthBarContent.GetChild(i);
        if (row_healthbar) {
            let entity = row_healthbar.Data<HealtrBarPanelData>().entitiy;
            if (Entities.IsValidEntity(entity) || !Entities.IsAlive(entity)) {
                // $.Msg(["remove bosshbar"])
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

function UpdateHealthBarRows(pPanel: Panel) {



}

function UpdateTopPanelBoss() {
    overhead_boss_list.forEach((entity) => {
        if (!Entities.IsValidEntity(entity)) { return; }
        let pPanel = overhead_panel_boss[entity];
        if (pPanel === null || pPanel === undefined) {
            // $.Msg("CreatePanel")
            pPanel = $.CreatePanel("Panel", TopHealthBarContent, "");
            pPanel.BLoadLayoutSnippet("TopHealthBar");
            overhead_panel_boss[entity] = pPanel;

            let unit_hp_max = Entities.GetMaxHealth(entity);
            let unit_hp_current = Entities.GetHealth(entity);
            let unitname = Entities.GetUnitName(entity);
            pPanel.SetDialogVariable("boss_name", $.Localize("#" + unitname));
            pPanel.Data<HealtrBarPanelData>().entitiy = entity;
            pPanel.Data<HealtrBarPanelData>().update_time = -1
            pPanel.Data<HealtrBarPanelData>().max_hp = unit_hp_max;
            pPanel.Data<HealtrBarPanelData>().curr_hp = unit_hp_current;
            pPanel.Data<HealtrBarPanelData>().last_update = 0;
            pPanel.Data<HealtrBarPanelData>().curr_index = -1;
            health_bar_object[`${entity}`] = {
                max_hp: unit_hp_max,
                curr_hp: unit_hp_current,
            }
            let ever_hp = unit_hp_max * EVER_HP_PCT * 0.01
            let layer_num = Math.ceil(unit_hp_current / ever_hp); // 还有几根血条
            pPanel.Data<HealtrBarPanelData>().layer_num = layer_num

            pPanel.SetDialogVariable("current_hp", `` + unit_hp_current)
            pPanel.SetDialogVariable("max_hp", `` + unit_hp_max)
            pPanel.SetDialogVariableInt("hp_count", layer_num);

            // 出来的血条必定是偶数先在上面,奇数在下面
            const HealthBarOdd = pPanel.FindChildTraverse("HealthBarOdd")!;
            HealthBarOdd.SetHasClass("Show", false)
            const OddHudHeathBar = HealthBarOdd.FindChildTraverse("HudHeathBar")!
            const OddBossHealthBar = HealthBarOdd.FindChildTraverse("BossHealthBar")!
            OddHudHeathBar.style.washColor = "#000000";
            OddBossHealthBar.style.washColor = "#000000";

            const HealthBarEven = pPanel.FindChildTraverse("HealthBarEven")!;
            HealthBarEven.SetHasClass("Show", true)
            const EvenHudHeathBar = HealthBarEven.FindChildTraverse("HudHeathBar")!
            const EvenBossHealthBar = HealthBarEven.FindChildTraverse("BossHealthBar")!

            EvenHudHeathBar.style.washColor = `${color_list[0]}`;
            EvenBossHealthBar.style.washColor = `${color_list[0]}`;

            let boss_attack = Entities.GetDamageMax(entity);
            pPanel.SetDialogVariable("boss_attack", `${boss_attack}`);

            pPanel.SetDialogVariable("boss_armor", `${0}`);
            pPanel.SetDialogVariable("boss_magice_armor", `${0}`);
        }
        let dotatime = Game.GetDOTATime(false, false);
        let max_layer = Math.ceil(100 / EVER_HP_PCT); // 最大根数
        let CurrentHealthBar: Panel;
        let NextHealthBar: Panel;

        // const HealthBarShine = pPanel.FindChildTraverse("HealthBarShine")!;
        const HealthBarOdd = pPanel.FindChildTraverse("HealthBarOdd")!;
        const OddHudHeathBar = HealthBarOdd.FindChildTraverse("HudHeathBar")!
        const OddBossHealthBar = HealthBarOdd.FindChildTraverse("BossHealthBar")!

        const HealthBarEven = pPanel.FindChildTraverse("HealthBarEven")!;
        const EvenHudHeathBar = HealthBarEven.FindChildTraverse("HudHeathBar")!
        const EvenBossHealthBar = HealthBarEven.FindChildTraverse("BossHealthBar")!

        let is_inv = Entities.IsInvulnerable(entity);
        if (is_inv) {
            // 如果是无敌状态,在这个阶段逐渐变为满血
            let buff_id = Entities_FindBuffID(entity, "modifier_custom_appearance_underground");
            if (buff_id) {
                let ElapsedTime = Buffs.GetElapsedTime(entity, buff_id)
                let duration = Buffs.GetDuration(entity, buff_id)
                let healthWidth = 100 * ElapsedTime / duration;
                // $.Msg(["healthWidth", healthWidth])
                EvenBossHealthBar.style.width = `${healthWidth}%`;
            }
            return
        }
        let curr_hp = Entities.GetHealth(entity);
        let max_hp = Entities.GetMaxHealth(entity);
        let ever_hp = max_hp * EVER_HP_PCT * 0.01
        /** 当前帧扣除的生命 */
        let deduct_hp = health_bar_object[`${entity}`].curr_hp - curr_hp;
        health_bar_object[`${entity}`].curr_hp = Entities.GetHealth(entity);
        // $.Msg(["curr_hp", curr_hp])
        pPanel.SetDialogVariable("current_hp", `` + curr_hp)
        pPanel.SetDialogVariable("max_hp", `` + max_hp)
        if (deduct_hp <= 0) {
            // 更新当前面板
            // HealthBarShine.SetHasClass("Shine",false);
            // let update_time = pPanel.Data<HealtrBarPanelData>().update_time;
            let layer_num = Math.ceil(curr_hp / ever_hp); // 还有几根血条
            pPanel.Data<HealtrBarPanelData>().layer_num = layer_num;
            pPanel.SetDialogVariableInt("hp_count", layer_num);
            let color_index = (max_layer - layer_num) % TOTAL_COLOR_COUNT;
            let next_color_index = (max_layer - layer_num + 1) % TOTAL_COLOR_COUNT;

            /** 当前层数为偶数? */
            let is_even = layer_num % 2 == 0;
            CurrentHealthBar = is_even ? HealthBarEven : HealthBarOdd;
            NextHealthBar = is_even ? HealthBarOdd : HealthBarEven;

            // 当前血条
            // CurrentHealthBar.style.zIndex = 2;
            // CurrentHealthBar.style.washColor = `${color_list[color_index]}`
            let healthWidth = GetNumDecimals((curr_hp - ever_hp * (layer_num - 1)) / ever_hp * 100, 1);
            let currHudHeathBar = CurrentHealthBar.FindChildTraverse("HudHeathBar")!;
            let currBossHealthBar = CurrentHealthBar.FindChildTraverse("BossHealthBar")!;
            currHudHeathBar.style.washColor = `${color_list[color_index]}`
            currBossHealthBar.style.washColor = `${color_list[color_index]}`
            currHudHeathBar.style.width = `${healthWidth}%`;
            currBossHealthBar.style.width = `${healthWidth}%`;


            // HealthBarShine.style.marginLeft = `${healthWidth}%`
            // 下次血条
            let nextHudHeathBar = NextHealthBar.FindChildTraverse("HudHeathBar")!;
            let nextBossHealthBar = NextHealthBar.FindChildTraverse("BossHealthBar")!;
            if (CurrentHealthBar.contentwidth <= 0) {
                CurrentHealthBar.SetHasClass("Show", false);
                NextHealthBar.SetHasClass("Show", true);
            } else {
                CurrentHealthBar.SetHasClass("Show", true);
                NextHealthBar.SetHasClass("Show", false);
                // CurrentHealthBar.style.zIndex = 2
                // NextHealthBar.style.zIndex = -1;
            }

            // $.Msg(nextHudHeathBar.style.washColor)
            if (layer_num <= 1) {
                nextBossHealthBar.style.washColor = `#000000`;
                nextHudHeathBar.style.washColor = `#000000`;
            } else {
                nextHudHeathBar.style.washColor = `${color_list[next_color_index]}`;
                nextBossHealthBar.style.washColor = `${color_list[next_color_index]}`;
                if (layer_num == pPanel.Data<HealtrBarPanelData>().layer_num) {
                    nextHudHeathBar.style.width = "100%";
                    nextBossHealthBar.style.width = "100%";
                }

            }
            return
        }

        // UpdateHealthBar(damage, pPanel);

        // 当前血量是第几层
        let layer_num = pPanel.Data<HealtrBarPanelData>().layer_num
        pPanel.SetDialogVariableInt("hp_count", layer_num);
        let color_index = (max_layer - layer_num) % TOTAL_COLOR_COUNT;
        let next_color_index = (max_layer - layer_num + 1) % TOTAL_COLOR_COUNT;

        /** 当前层数为偶数? */
        let is_even = layer_num % 2 == 0;
        CurrentHealthBar = is_even ? HealthBarEven : HealthBarOdd;
        NextHealthBar = is_even ? HealthBarOdd : HealthBarEven;

        // CurrentHealthBar.style.washColor = `${color_list[color_index]}`;


        // 当前层数血量百分比
        let curr_layer_hp_pct = Math.max(0, (curr_hp - ever_hp * (layer_num - 1)) / ever_hp * 100);
        let currHudHeathBar = CurrentHealthBar.FindChildTraverse("HudHeathBar")!;
        let currBossHealthBar = CurrentHealthBar.FindChildTraverse("BossHealthBar")!;
        // currHudHeathBar.AddClass("opacity");
        currHudHeathBar.style.width = `${curr_layer_hp_pct}%`;
        // currHudHeathBar.RemoveClass("opacity");
        currBossHealthBar.style.width = `${curr_layer_hp_pct}%`;

        // 下一层
        let nextHudHeathBar = NextHealthBar.FindChildTraverse("HudHeathBar")!;
        let nextBossHealthBar = NextHealthBar.FindChildTraverse("BossHealthBar")!;
        nextHudHeathBar.style.width = `100%`;
        nextBossHealthBar.style.width = `100%`;
        nextHudHeathBar.style.washColor = `${color_list[next_color_index]}`;
        nextBossHealthBar.style.washColor = `${color_list[next_color_index]}`;
        // let CurrentBossHealthBar: Panel;
        // let CurrentHudHealthBar: Panel;
        // HealthBarShine.SetHasClass("Shine",true);





        if (curr_layer_hp_pct < 0) {
            pPanel.Data<HealtrBarPanelData>().layer_num = layer_num - 1;
        }

        // $.Schedule(0.01, () => {
        //     nextHudHeathBar.style.width = "100%";
        //     nextBossHealthBar.style.width = "100%";
        // })


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