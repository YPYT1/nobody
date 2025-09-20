// import { CreateServerItem } from "../../../common/server_item";

import { GetTextureSrc } from '../../../common/custom_kv_method';
import { CreateCustomComponent } from '../../../dashboard/_components/component_manager';

const server_skill_exp = GameUI.CustomUIConfig().KvData.server_skill_exp;

const ShowBtn = $('#ShowBtn');
const ClosedBtn = $('#ClosedBtn');
const PlayerList = $('#PlayerList');
const ModelScene = $('#ModelScene') as ScenePanel;
const MainPanel = $.GetContextPanel();
const GameEndContainer = $('#GameEndContainer');

const CreateServerItem = GameUI.CustomUIConfig().CreateServerItem;

function FormatNumberToTime(time: number) {
    const min = Math.floor(time / 60);
    const sec_num = Math.floor(time % 60);
    const sec = sec_num < 10 ? `0${sec_num}` : `${sec_num}`;
    return [min, sec];
}
export const Init = () => {
    GameEvents.Subscribe('ArchiveService_GetPlayerGameOverData', event => {
        // $.Msg(["ArchiveService_GetPlayerGameOverData"])
        // $.Msg(event)
        PlayerList.RemoveAndDeleteChildren();
        const data = event.data;
        const player_list_data = Object.values(data.player_list_data);
        const TimeLabel = FormatNumberToTime(data.time);
        const player_id = 0;
        GameEndContainer.SetDialogVariable('play_time', `通关时间: ${TimeLabel.join(':')}`);
        GameEndContainer.SetHasClass('is_win', data.state == 1);
        GameEndContainer.RemoveClass('Closed');
        const mvp_player = -1;
        for (const row_data of player_list_data) {
            // $.Msg(["row_data",row_data])
            const PlayerInfoRows = $.CreatePanel('Panel', PlayerList, '');
            const playerInfo = Game.GetPlayerInfo(row_data.player_id);
            PlayerInfoRows.SetHasClass('Local', row_data.player_id == Game.GetLocalPlayerID());
            PlayerInfoRows.BLoadLayoutSnippet('PlayerInfoRows');

            // Avatar
            const steam_id = row_data.steam_id;
            const Avater = PlayerInfoRows.FindChildTraverse('Avater') as AvatarImage;
            Avater.accountid = `${steam_id}`;
            Avater.SetPanelEvent('onactivate', () => {});
            Avater.SetPanelEvent('onmouseover', () => {});
            Avater.SetPanelEvent('oncontextmenu', () => {});
            // player and hero
            const hero_id = playerInfo.player_selected_hero;
            // let heroname = GameUI.SendCustomHUDError
            PlayerInfoRows.SetDialogVariable('hero_name', $.Localize(`#${hero_id}`));
            PlayerInfoRows.SetDialogVariable('player_name', playerInfo.player_name);
            // exp 缺经验表
            PlayerInfoRows.SetDialogVariableInt('player_lv', 0);
            PlayerInfoRows.SetDialogVariableInt('bonus_exp', row_data.exp);

            const OriginExp = PlayerInfoRows.FindChildTraverse('OriginExp')!;
            const BonusExp = PlayerInfoRows.FindChildTraverse('BonusExp')!;
            PlayExpAnimation(OriginExp, BonusExp, 50, 60);

            // Item
            const RewardList = PlayerInfoRows.FindChildTraverse('RewardList')!;
            const pass_item_list = Object.values(row_data.pass_item);
            for (const ItemData of pass_item_list) {
                const item_id = ItemData.item_id;
                // $.Msg(["item_id",item_id])
                const ServerItem = CreateCustomComponent(RewardList, 'server_item', '');
                ServerItem._SetServerItemInfo({
                    item_id: item_id,
                    item_count: ItemData.number,
                    show_count: true,
                    show_tips: true,
                });
                // let RewardItem = CreateServerItem(ItemData.item_id, ItemData.number, RewardList);
                // RewardItem.AddClass("PassItem");
            }

            const skill_exp = row_data.skill_exp;
            const AbilityTypesInfo = PlayerInfoRows.FindChildTraverse('AbilityTypesInfo')!;
            for (const type_id in skill_exp) {
                const _row_data = skill_exp[type_id];
                const old_exp = _row_data.old_exp;
                const exp = _row_data.exp;
                const type_skill_data = server_skill_exp[type_id as keyof typeof server_skill_exp];
                const AbilityTypesRows = $.CreatePanel('Panel', AbilityTypesInfo, '');
                AbilityTypesRows.BLoadLayoutSnippet('AbilityTypesRows');
                AbilityTypesRows.SetDialogVariableInt('bonus_type_exp', exp);
                const TypesIcon = AbilityTypesRows.FindChildTraverse('TypesIcon') as ImagePanel;
                TypesIcon.SetImage(GetTextureSrc(type_skill_data.img));
                const OriginExp = AbilityTypesRows.FindChildTraverse('OriginExp')!;
                const BonusExp = AbilityTypesRows.FindChildTraverse('BonusExp')!;
                AbilityTypesRows.SetDialogVariableInt('arms_level', 1);
                PlayExpAnimation(OriginExp, BonusExp, 0, 100);
            }

            if (row_data.is_mvp == 1) {
                // mvp_player = row_data.player_id
                // 设置MVP单位
                const hero_unit = playerInfo.player_selected_hero;
                // ModelScene.RemoveAndDeleteChildren()
                // let HeroScenePanel = $.CreatePanel("DOTAScenePanel", ModelScene, "", {
                //     class: "full"
                // })
            }
        }
    });

    GameEvents.SendCustomGameEventToServer('ArchiveService', {
        event_name: 'GetPlayerGameOverData',
        params: {},
    });

    ClosedBtn.SetPanelEvent('onactivate', () => {
        GameEndContainer.AddClass('Closed');
    });

    ShowBtn.SetPanelEvent('onactivate', () => {
        GameEndContainer.RemoveClass('Closed');
    });
};

const PlayExpAnimation = (OriginPanel: Panel, BonusPanel: Panel, origin: number, bonus: number) => {
    OriginPanel.style.width = `${origin}%`;
    BonusPanel.style.width = `${origin}%`;
    ScrollingLoop(OriginPanel, BonusPanel, origin, bonus);
};

function ScrollingLoop(OriginPanel: Panel, BonusPanel: Panel, origin: number, bonus: number) {
    bonus -= 1;
    origin = origin + 1;
    if (origin > 100) {
        origin = 1;
        OriginPanel.style.width = `0%`;
        // 升级
    }
    BonusPanel.style.width = `${origin}%`;
    if (bonus <= 0) {
        return;
    }
    $.Schedule(0, () => {
        ScrollingLoop(OriginPanel, BonusPanel, origin, bonus);
    });
}

(function () {
    Init();
})();
