export const ResourcePanel: { [key in PlayerResourceTyps]?: Panel } = {};
export const resource_list: PlayerResourceTyps[] = ['Soul'];

export const CreatePanel = () => {
    const MainPanel = $.GetContextPanel();
    MainPanel.RemoveAndDeleteChildren();
    for (const resource_type of resource_list) {
        const resource_panel = $.CreatePanel('Panel', MainPanel, '');
        resource_panel.BLoadLayoutSnippet('ResourceTypePanel');
        resource_panel.AddClass(resource_type);
        resource_panel.SetDialogVariable('amount', '0');
        resource_panel.Data<PanelDataObject>().amount = 0;
        ResourcePanel[resource_type] = resource_panel;
    }

    GameEvents.Subscribe('ResourceSystem_SendPlayerResources', event => {
        const data = event.data;
        // ResourcePanel["Gold"]?.SetDialogVariable("amount", `${data.Gold}`)
        const SoulPanel = ResourcePanel['Soul']!;
        if (SoulPanel) {
            const show_amount = SoulPanel.Data<PanelDataObject>().amount as number;
            SoulPanel.Data<PanelDataObject>().amount = data.Soul;
            const add_total = data.Soul - show_amount;
            PlayGoldAnimation(SoulPanel, show_amount, add_total);
        }
    });

    GameEvents.SendCustomGameEventToServer('ResourceSystem', {
        event_name: 'GetPlayerResource',
        params: {},
    });
};

/**
 * 播放面板数字滚动
 * @param e  面板[已包含最终值]
 * @param show_amount 显示值
 * @param add_total 变动值
 */
function PlayGoldAnimation(e: Panel, show_amount: number, add_total: number) {
    e.AddClass('Play');
    ScrollingLoop(e, show_amount, add_total, 20);
}

/**
 * 播放面板数字滚动
 * @param e
 * @param show_amount
 * @param add_total
 * @param last_scroll 滚动次数
 * @returns
 */
function ScrollingLoop(e: Panel, show_amount: number, add_total: number, last_scroll: number) {
    if (!add_total) {
        return;
    }
    const add_value = Math.floor(add_total / last_scroll);
    const next_add = add_total - add_value;
    show_amount += add_value;
    e.SetDialogVariable('amount', '' + show_amount);
    if (next_add != 0) {
        // $.Msg(["pow_value",])
        $.Schedule(0, () => {
            ScrollingLoop(e, show_amount, next_add, last_scroll - 1);
        });
        return;
    } else {
        e.RemoveClass('Play');
    }
}

(function () {
    CreatePanel();
})();
