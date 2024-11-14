
import { CreateCustomComponent, LoadCustomComponent } from "../../../dashboard/_components/component_manager";
import { default as ChapterInfo } from "../../../json/config/chapter_info.json"
import { default as NpcHeroesCustom } from "../../../json/npc_heroes_custom.json"

const CreateServerItem = GameUI.CustomUIConfig().CreateServerItem;
const localPlayer = Game.GetLocalPlayerID();
const MainPanel = $.GetContextPanel();
const ChapterContainer = $("#ChapterContainer")
const PageList = $("#PageList");
// const ChapterList = $("#ChapterList");
const ChapterTooltip = $("#ChapterTooltip");
const ChapterDiffList = $("#ChapterDiffList");
const DroppedInfoList = $("#DroppedInfoList");
const ChapterConfirmBtn = $("#ChapterConfirmBtn") as Button;

const LeftBtn = $("#LeftBtn") as Button;
const RightBtn = $("#RightBtn") as Button;


let DifficultyMaxData: { [key: string]: UserMapSelectDifficulty } = {};
let chapter_page = 1;
let total_page = 0;

export function GetChapterInfoTable() {
    let chapter_table: {
        [in_page: number]: {
            [chapter_key: string]: {
                default_max: number,
                unlock_difficulty: number,
                is_open: number,
                is_boss: number,
            }
        }
    } = {}

    for (let chapter_key in ChapterInfo) {
        let row_data = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
        let in_page = row_data.in_page;
        if (chapter_table[in_page] == null) { chapter_table[in_page] = {} }
        chapter_table[in_page][chapter_key] = {
            default_max: row_data.default_max,
            unlock_difficulty: row_data.unlock_difficulty,
            is_open: row_data.is_open,
            is_boss: row_data.is_boss,
        }
    }

    return chapter_table
}

export const ChapterInfoTable = GetChapterInfoTable();

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

export const ShowChapterInfoTips = (e: Panel, chapter_key: string) => {
    let chapter_data = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
    ChapterTooltip.SetHasClass("is_boss", chapter_data.is_boss == 1);
    ChapterTooltip.AddClass("Show")

    let parentPos = e.GetPositionWithinWindow();
    let offsetX = Math.floor((parentPos["x"] + e.actuallayoutwidth) / e.actualuiscale_x - 160);
    let offsetY = Math.floor((parentPos["y"] + (e.actuallayoutheight / 2) - 100) / e.actualuiscale_y / 2);

    if (offsetX >= 1400) { offsetX -= 540; }
    ChapterTooltip.style.transform = `translatex( ${offsetX}px ) translatey( ${offsetY}px  )`
    // ChapterTooltip.SetPositionInPixels(offsetX, offsetY, 0)
    // ChapterTooltip.SetPositionInPixels(0, 0, 0)
    // ChapterTooltip.style.marginLeft =  "0px";
    // ChapterTooltip.style.marginBottom = "0px";
    ChapterConfirmBtn.enabled = false;

    // 这里需要读取关卡数据
    let local_chapter = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
    // $.Msg(local_chapter)
    let default_max = local_chapter.default_max;
    let curr_chapter_data = DifficultyMaxData[chapter_key];
    // $.Msg("curr_chapter_data", curr_chapter_data);
    let player_max_difficulty = curr_chapter_data.user_difficulty % 100;

    for (let i = 0; i < ChapterDiffList.GetChildCount(); i++) {
        const DifficultyButton = ChapterDiffList.GetChild(i) as RadioButton;
        DifficultyButton.visible = i < default_max;
        DifficultyButton.enabled = i < player_max_difficulty;
        DifficultyButton.checked = false;
        if (i < player_max_difficulty) {
            let diff = local_chapter.chapter_index * 100 + i + 1;
            DifficultyButton.SetPanelEvent("onactivate", () => {
                // 选择关卡
                GameEvents.SendCustomGameEventToServer("MapChapter", {
                    event_name: "SelectDifficulty",
                    params: {
                        difficulty: `${diff}`
                    }
                })
            })
        } else {
            DifficultyButton.SetPanelEvent("onactivate", () => { })
        }
    }
}

export const HideChapterInfoTips = () => {
    ChapterTooltip.RemoveClass("Show")
}



// 章节页面下一页
type FlippingPagesType = 1 | -1;
export const ChapterPageTurning = (page_num: FlippingPagesType) => {
    let to_page = chapter_page + page_num;
    if (to_page > total_page || to_page <= 0) { return }
    for (let i = 0; i < PageList.GetChildCount(); i++) {
        let curr_page = i + 1;
        let ChapterPageInfo = PageList.GetChild(i)!;
        ChapterPageInfo.SetHasClass("Show", curr_page == to_page);
    }
    HideChapterInfoTips();
    chapter_page = to_page;
    LeftBtn.enabled = chapter_page > 1;
    RightBtn.enabled = chapter_page < total_page;
}



export const CreatePanel = () => {

    // 生成章节分页
    PageList.RemoveAndDeleteChildren();
    for (let page in ChapterInfoTable) {
        let PageData = ChapterInfoTable[page];
        let ChapterPageInfo = $.CreatePanel("Panel", PageList, `Page_${page}`);
        ChapterPageInfo.BLoadLayoutSnippet("ChapterPageInfo")
        ChapterPageInfo.SetHasClass("Show", page == "1");
        const ChapterList = ChapterPageInfo.FindChildTraverse("ChapterList")!
        for (let chapter_key in PageData) {
            let data = PageData[chapter_key];
            let chapter_data = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
            let ChapterSelectBtn = $.CreatePanel("RadioButton", ChapterList, `Chapter_${chapter_key}`)
            ChapterSelectBtn.BLoadLayoutSnippet("ChapterSelectBtn");
            ChapterSelectBtn.SetHasClass("is_boss", data.is_boss == 1);
            ChapterSelectBtn.SetDialogVariable("chapter_name", chapter_key);
            ChapterSelectBtn.enabled = false;
            ChapterSelectBtn.SetPanelEvent("onactivate", () => {
                ShowChapterInfoTips(ChapterSelectBtn, chapter_key)
            })
            ChapterSelectBtn.style.transform = `translateX(${chapter_data.x}px) translateY(${chapter_data.y}px)`
        }
    }
    total_page = PageList.GetChildCount();
    LeftBtn.enabled = true
    LeftBtn.SetPanelEvent("onactivate", () => {
        ChapterPageTurning(-1)
    })
    RightBtn.enabled = true
    RightBtn.SetPanelEvent("onactivate", () => {
        ChapterPageTurning(1)
    })

    // Tooltip
    ChapterDiffList.RemoveAndDeleteChildren()
    for (let i = 1; i <= 8; i++) {
        let DifficultyButton = $.CreatePanel("RadioButton", ChapterDiffList, "Diff_" + i);
        DifficultyButton.BLoadLayoutSnippet("DifficultyButton");
        DifficultyButton.enabled = false;
        // DifficultyButton.enabled = Math.floor(Math.random() * 2) == 1;
    }

    // DroppedInfoList
    // .ServerItem
    DroppedInfoList.RemoveAndDeleteChildren();
    const xxxx = [1201, 1202, 1203, 1204, 1205,
        1206,
        1279,
        1280
    ]
    for (let item_id of xxxx) {
        let serverItemPanel = CreateCustomComponent(DroppedInfoList, "server_item", ``);
        serverItemPanel._SetServerItemInfo({ item_id: item_id })

    }


    let ChapterCancelBtn = $("#ChapterCancelBtn") as Button;
    ChapterCancelBtn.SetPanelEvent("onactivate", () => {
        HideChapterInfoTips();
    })

    const ClosedBtn = $("#ClosedBtn") as Button;
    // ClosedBtn.SetPanelEvent("onactivate", () => {
    //     ChapterContainer.RemoveClass("Show")
    // })

    const TestToggleBtn = $("#TestToggleBtn") as Button;
    TestToggleBtn.SetPanelEvent("onactivate", () => {
        ChapterContainer.ToggleClass("Show")
    })

    HideChapterInfoTips();
    // // 页面开关按钮
    // let ChapterClosedButton = $("#ChapterClosedButton");
    // ChapterClosedButton.SetPanelEvent("onactivate", () => {
    //     let state = MainPanel.BHasClass("Open");
    //     MainPanel.SetHasClass("Open", !state)
    // })

    // // 章节列表
    // let ChapterList = $("#ChapterList");
    // ChapterList.RemoveAndDeleteChildren();
    // Object.values(ChapterInfo).map((v, k) => {
    //     let SelectChapter = $.CreatePanel("Panel", ChapterList, "");
    //     SelectChapter.BLoadLayoutSnippet("SelectChapter");
    //     SelectChapter.SetDialogVariable("chapter", `${v.name}`);
    //     SelectChapter.Data<PanelDataObject>().chapter = v.name;
    //     SelectChapter.SetPanelEvent("onactivate", () => {
    //         for (let i = 1; i <= 5; i++) {
    //             MainPanel.SetHasClass(`Stage_${i}`, v.name == i);
    //         }
    //     })

    // })
    // // 每个章节的页面
    // let ChapterForDiff = $("#ChapterForDiff")
    // ChapterForDiff.RemoveAndDeleteChildren();
    // Object.values(ChapterInfo).map((v, k) => {
    //     let chapter = v.name;
    //     let StageDifficulty = $.CreatePanel("Panel", ChapterForDiff, "StageDifficulty_" + v.name, {
    //         class: "StageDifficulty row wrap"
    //     });

    //     for (let i = 0; i < v.default_max; i++) {
    //         let StageDifficultyRows = $.CreatePanel("Panel", StageDifficulty, "")
    //         let difficulty = i + 1;
    //         StageDifficultyRows.BLoadLayoutSnippet("StageDifficultyRows");
    //         StageDifficultyRows.SetDialogVariable("chapter", `${v.name}`)
    //         StageDifficultyRows.SetDialogVariable("difficulty", `${difficulty}`)
    //         StageDifficultyRows.SetPanelEvent("onactivate", () => {
    //             let diff = `${chapter * 100 + difficulty}`
    //             $.Msg(["diff", diff])
    //             GameEvents.SendCustomGameEventToServer("MapChapter", {
    //                 event_name: "SelectDifficulty",
    //                 params: {
    //                     difficulty: `${diff}`
    //                 }
    //             })
    //         })
    //     }
    // })

    // let StartGameButton = $("#StartGameButton");
    // StartGameButton.SetPanelEvent("onactivate", () => {
    //     GameEvents.SendCustomGameEventToServer("MapChapter", {
    //         event_name: "SelectDifficultyAffirm",
    //         params: {}
    //     })
    // })

    // let HeroConfirmButton = $("#HeroConfirmButton");
    // HeroConfirmButton.SetPanelEvent("onactivate", () => {
    //     GameEvents.SendCustomGameEventToServer("MapChapter", {
    //         event_name: "SelectHeroAffirm",
    //         params: {}
    //     })
    // })
    // 玩家列表
    // Create_PlayerList();
    // 英雄列表
    // Create_HeroList()
    // MainPanel.SetHasClass("Stage_2", true);


    ChapterConfirmBtn.visible = localPlayer == 0;
}

export const UpdateChapterPage = (data: { [key: string]: UserMapSelectDifficulty }) => {

    for (let chapter_key in data) {
        let chapter_id = `Chapter_${chapter_key}`
        let ChapterSelectBtn = PageList.FindChildTraverse(chapter_id)!;
        // $.Msg(["ChapterSelectBtn",ChapterSelectBtn])
        ChapterSelectBtn.enabled = true;
    }
}

export const Init = () => {

    CreatePanel()

    GameEvents.Subscribe("MapChapter_GetDifficultyMax", event => {
        let data = event.data;
        DifficultyMaxData = data.map_difficulty;
        UpdateChapterPage(data.map_difficulty);

    })

    GameEvents.Subscribe("MapChapter_SelectDifficulty", event => {
        let data = event.data;
        let difficulty = data.select_difficulty;
        $.Msg(["MapChapter_SelectDifficulty", data])

        ChapterConfirmBtn.enabled = true;
        ChapterConfirmBtn.SetPanelEvent("onactivate", () => {
            // $.Msg("difficulty",difficulty)
            GameEvents.SendCustomGameEventToServer("MapChapter", {
                event_name: "SelectDifficultyAffirm",
                params: {}
            })
        })
        // MainPanel.Data<PanelDataObject>()["difficulty"] = difficulty;
        // MainPanel.SetDialogVariable("difficulty", difficulty)
    })

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetDifficultyMax",
        params: {}
    })


}

(function () {
    Init()
})();