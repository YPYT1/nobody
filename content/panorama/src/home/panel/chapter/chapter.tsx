import { default as ChapterInfo } from "../../../json/config/chapter_info.json"
import { default as NpcHeroesCustom } from "../../../json/npc_heroes_custom.json"

export function InitHeroes() {
    let hero_table: { [heroid: string]: string } = {};
    for (let heroname in NpcHeroesCustom) {
        let row_data = NpcHeroesCustom[heroname as keyof typeof NpcHeroesCustom];
        let enable = row_data.Enable;
        if (enable == 1) {
            let hero_id = row_data.HeroID;
            // let index = row_data.Index;
            hero_table[`${hero_id}`] = heroname
            // hero_table.push({ heroname, enable, index });
            // heroes_order_table[index] = heroname;
        }

    }
    // hero_table.sort((a, b) => { return a.index - b.index; });
    return hero_table;
}

export const heroes_key = InitHeroes();

export const MainPanel = $.GetContextPanel();

export const CreatePanel = () => {
    // 页面开关按钮
    let ChapterClosedButton = $("#ChapterClosedButton");
    ChapterClosedButton.SetPanelEvent("onactivate", () => {
        let state = MainPanel.BHasClass("Open");
        MainPanel.SetHasClass("Open", !state)
    })

    // 章节列表
    let ChapterList = $("#ChapterList");
    ChapterList.RemoveAndDeleteChildren();
    Object.values(ChapterInfo).map((v, k) => {
        let SelectChapter = $.CreatePanel("Panel", ChapterList, "");
        SelectChapter.BLoadLayoutSnippet("SelectChapter");
        SelectChapter.SetDialogVariable("chapter", `${v.name}`);
        SelectChapter.Data<PanelDataObject>().chapter = v.name;
        SelectChapter.SetPanelEvent("onactivate", () => {
            for (let i = 1; i <= 5; i++) {
                MainPanel.SetHasClass(`Stage_${i}`, v.name == i);
            }
        })

    })
    // 每个章节的页面
    let ChapterForDiff = $("#ChapterForDiff")
    ChapterForDiff.RemoveAndDeleteChildren();
    Object.values(ChapterInfo).map((v, k) => {
        let chapter = v.name;
        let StageDifficulty = $.CreatePanel("Panel", ChapterForDiff, "StageDifficulty_" + v.name, {
            class: "StageDifficulty row wrap"
        });

        for (let i = 0; i < v.default_max; i++) {
            let StageDifficultyRows = $.CreatePanel("Panel", StageDifficulty, "")
            let difficulty = i + 1;
            StageDifficultyRows.BLoadLayoutSnippet("StageDifficultyRows");
            StageDifficultyRows.SetDialogVariable("chapter", `${v.name}`)
            StageDifficultyRows.SetDialogVariable("difficulty", `${difficulty}`)
            StageDifficultyRows.SetPanelEvent("onactivate", () => {
                let diff = `${chapter * 100 + difficulty}`
                $.Msg(["diff", diff])
                GameEvents.SendCustomGameEventToServer("MapChapter", {
                    event_name: "SelectDifficulty",
                    params: {
                        difficulty: `${diff}`
                    }
                })
            })
        }
    })

    let StartGameButton = $("#StartGameButton");
    StartGameButton.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("MapChapter", {
            event_name: "SelectDifficultyAffirm",
            params: {}
        })
    })

    let HeroConfirmButton = $("#HeroConfirmButton");
    HeroConfirmButton.SetPanelEvent("onactivate", () => {
        GameEvents.SendCustomGameEventToServer("MapChapter", {
            event_name: "SelectHeroAffirm",
            params: {}
        })
    })
    // 玩家列表
    Create_PlayerList();
    // 英雄列表
    Create_HeroList()
    // MainPanel.SetHasClass("Stage_2", true);
}

export const Create_HeroList = () => {
    const PickHeroList = $("#PickHeroList");
    PickHeroList.RemoveAndDeleteChildren();
    Object.values(NpcHeroesCustom).map((v, k) => {
        let HeroCardButton = $.CreatePanel("RadioButton", PickHeroList, "");
        let heroname = v.override_hero;
        let heroId = v.HeroID;
        HeroCardButton.BLoadLayoutSnippet("HeroCardButton");

        let HeroIcon = HeroCardButton.FindChildTraverse("HeroIcon") as ImagePanel;
        HeroIcon.SetImage(`file://{images}/heroes/selection/${heroname}.png`)

        let HeroMovie = HeroCardButton.FindChildTraverse("HeroMovie") as HeroMovie;
        HeroMovie.heroname = heroname;

        HeroCardButton.SetPanelEvent("onactivate", () => {
            GameEvents.SendCustomGameEventToServer("MapChapter", {
                event_name: "SelectHero",
                params: {
                    hero_id: heroId,
                }
            })
        })
        // return <HeroCardButton key={k} heroname={v[0]} hero_id={v[1].HeroID} />
    })
}

export const Create_PlayerList = () => {
    const PlayerList = $("#PlayerList");
    PlayerList.RemoveAndDeleteChildren();
    Game.GetAllPlayerIDs().map((Player, k) => {
        const PlayerInfo = Game.GetPlayerInfo(Player);
        // const steamid = 
        let PlayerReadyStateItem = $.CreatePanel("Panel", PlayerList, "");
        PlayerReadyStateItem.BLoadLayoutSnippet("PlayerReadyStateItem");
        // PlayerReadyStateItem.visible = false;
        PlayerReadyStateItem.SetHasClass("is_local", Players.GetLocalPlayer() == Player);
        PlayerReadyStateItem.SetDialogVariable("player_name", PlayerInfo.player_name)

        let DOTAAvatarImage = PlayerReadyStateItem.FindChildTraverse("DOTAAvatarImage") as AvatarImage;
        DOTAAvatarImage.steamid = PlayerInfo.player_steamid;
    })


    GameEvents.Subscribe("MapChapter_GetPlayerSelectHeroList", event => {
        let data = event.data;
        let hero_ids = data.hero_ids
        // let player_state = Object.values(data.hero_ids);
        // $.Msg(["player_state", player_state])
        // setPlayerState(player_state)
        if (PlayerList) {
            for (let k in hero_ids) {
                let index = parseInt(k) - 1;
                let info = hero_ids[k];
                // $.Msg(["k",k])
                let StatePanel = PlayerList.GetChild(index);
                // $.Msg(StatePanel)
                if (StatePanel) {
                    StatePanel.visible = true;
                    let HeroIcon = StatePanel.FindChildTraverse("HeroIcon") as ImagePanel;
                    const heroname = heroes_key[info.hero_id]
                    HeroIcon.SetImage(`file://{images}/heroes/selection/${heroname}.png`)
                    StatePanel.SetHasClass("is_ready", info.state == 1)
                }
            }
        }
    })
}

export const Update_PlayerState = () => {

}

export const Init = () => {
    // GameEvents.Subscribe("")

    // MainPanel.Data<PanelDataObject>()["difficulty"] = "101"
    // MainPanel.SetDialogVariable("difficulty", "101");

    CreatePanel()

    GameEvents.Subscribe("MapChapter_SelectDifficulty", event => {
        let data = event.data;
        $.Msg(["MapChapter_SelectDifficulty1", data])
        let difficulty = data.select_difficulty;
        MainPanel.Data<PanelDataObject>()["difficulty"] = difficulty;
        MainPanel.SetDialogVariable("difficulty", difficulty)
        // setDifficulty(difficulty)
    })

}
(function () {
    Init()
})();