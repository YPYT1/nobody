import { CreateServerItem } from "../../../common/server_item";

const NextGameBtn = $("#NextGameBtn");
const PlayerList = $("#PlayerList");
const MainPanel = $.GetContextPanel();
const GameEndContainer = $("#GameEndContainer");


const Init = () => {

    GameEvents.Subscribe("ArchiveService_GetPlayerGameOverData", event => {
        PlayerList.RemoveAndDeleteChildren();
        let data = event.data;
        let player_list_data = Object.values(data.player_list_data);
        let play_time = data.time;
        let player_id = 0;
        GameEndContainer.SetDialogVariable("play_time", `${play_time}`)
        for (let row_data of player_list_data) {
            let PlayerInfoRows = $.CreatePanel("Panel", PlayerList, "");
            let playerInfo = Game.GetPlayerInfo(player_id as PlayerID)
            PlayerInfoRows.BLoadLayoutSnippet("PlayerInfoRows");

            // Avatar
            let steam_id = row_data.steam_id;
            let Avater = PlayerInfoRows.FindChildTraverse("Avater") as AvatarImage;
            Avater.accountid = `${steam_id}`;
            Avater.SetPanelEvent("onactivate", () => { })
            Avater.SetPanelEvent("onmouseover", () => { })
            Avater.SetPanelEvent("oncontextmenu", () => { })
            // player and hero
            let hero_id = playerInfo.player_selected_hero_id;
            PlayerInfoRows.SetDialogVariable("hero_name", `${hero_id}`)
            PlayerInfoRows.SetDialogVariable("player_name", playerInfo.player_name)
            // exp 缺经验表
            PlayerInfoRows.SetDialogVariableInt("player_lv", 1)
            PlayerInfoRows.SetDialogVariableInt("bonus_exp", row_data.exp)

            let OriginExp = PlayerInfoRows.FindChildTraverse("OriginExp")!
            let BonusExp = PlayerInfoRows.FindChildTraverse("BonusExp")!
            PlayExpAnimation(OriginExp, BonusExp, 50, 60);

            // Item
            let RewardList = PlayerInfoRows.FindChildTraverse("RewardList")!;
            let pass_item_list = Object.values(row_data.pass_item);

            for (let ItemData of pass_item_list) {
                let RewardItem = CreateServerItem(ItemData.item_id, ItemData.item_number, RewardList);
                RewardItem.AddClass("PassItem");
            }

            let AbilityTypesInfo = PlayerInfoRows.FindChildTraverse("AbilityTypesInfo")!;
            for (let i = 0; i < 7; i++) {
                let AbilityTypesRows = $.CreatePanel("Panel", AbilityTypesInfo, "");
                AbilityTypesRows.BLoadLayoutSnippet("AbilityTypesRows");
                let TypesIcon = AbilityTypesRows.FindChildTraverse("TypesIcon")!;
                TypesIcon.AddClass("bounce");

                let OriginExp = AbilityTypesRows.FindChildTraverse("OriginExp")!
                let BonusExp = AbilityTypesRows.FindChildTraverse("BonusExp")!
                AbilityTypesRows.SetDialogVariableInt("arms_level",1)

                PlayExpAnimation(OriginExp, BonusExp, 50, 60);

               
            }

        }
    })

    GameEvents.SendCustomGameEventToServer("ArchiveService", {
        event_name: "GetPlayerGameOverData",
        params: {},
    })

    NextGameBtn.SetPanelEvent("onactivate", () => {
        GameEndContainer.ToggleClass("Closed");
    })
}

const PlayExpAnimation = (OriginPanel: Panel, BonusPanel: Panel, origin: number, bonus: number) => {
    OriginPanel.style.width = `${origin}%`
    BonusPanel.style.width = `${origin}%`;
    ScrollingLoop(OriginPanel, BonusPanel, origin, bonus);
}

function ScrollingLoop(OriginPanel: Panel, BonusPanel: Panel, origin: number, bonus: number) {
    bonus -= 1;
    origin = origin + 1;
    if (origin > 100) {
        origin = 1
        OriginPanel.style.width = `0%`;
        // 升级
    }
    BonusPanel.style.width = `${origin}%`
    if (bonus <= 0) { return }
    $.Schedule(0, () => {
        ScrollingLoop(OriginPanel, BonusPanel, origin, bonus)
    })
}


(function () {
    Init();
})();