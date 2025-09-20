import { CreateCustomComponent } from '../../_components/component_manager';

const ContextPanel = $.GetContextPanel();

const LeftNavBtnList = $('#LeftNavBtnList');
const NavContentFrame = $('#NavContentFrame');

const NavMenuList = [
    'day',
    //"week",
    // "event_day",
    //"event_week",
    //"event_clear"
];

export function Init() {
    LeftNavBtnList.RemoveAndDeleteChildren();
    NavContentFrame.RemoveAndDeleteChildren();
    for (let i = 0; i < NavMenuList.length; i++) {
        const menu = NavMenuList[i];
        const NavRadioBtn = $.CreatePanel('RadioButton', LeftNavBtnList, menu, {
            group: 'Dashboard_Event_Quest',
        });
        NavRadioBtn.BLoadLayoutSnippet('LeftNavButton');
        NavRadioBtn.checked = i == 0;
        NavRadioBtn.SetPanelEvent('onactivate', () => {});

        const NavContent = $.CreatePanel('Panel', NavContentFrame, menu);
        NavContent.BLoadLayoutSnippet('NavContent');

        // 这里延迟加载任务内容
        const QuestList = NavContent.FindChildTraverse('QuestList')!;
        for (let j = 0; j < 6; j++) {
            const QuestRows = $.CreatePanel('Panel', QuestList, `${j}`);
            QuestRows.BLoadLayoutSnippet('QuestRows');

            const QuestRewardItem = QuestRows.FindChildTraverse('QuestRewardItem')!;
            for (let k = 0; k < 4; k++) {
                const ServerItem = CreateCustomComponent(QuestRewardItem, 'server_item', '');
                ServerItem._SetServerItemInfo({ item_id: 1280, show_count: true, item_count: 20, show_tips: true });
            }
        }
    }
}

(() => {
    Init();
})();
