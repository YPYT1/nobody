
import { CreateCustomComponent, LoadCustomComponent } from "../../../dashboard/_components/component_manager";
import { default as ChapterInfo } from "../../../json/config/chapter_info.json"
import { default as PageBackground } from "../../../json/config/page_background.json"
import { default as NpcHeroesCustom } from "../../../json/npc_heroes_custom.json"

const CreateServerItem = GameUI.CustomUIConfig().CreateServerItem;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;
const localPlayer = Game.GetLocalPlayerID();
const MainPanel = $.GetContextPanel();
const ChapterContainer = $("#ChapterContainer")
const PageList = $("#ChapterPageList");
// const ChapterList = $("#ChapterList");
const ChapterTooltip = $("#ChapterTooltip");
const ChapterDiffList = $("#ChapterDiffList");
const DroppedInfoList = $("#DroppedInfoList");
const ChapterConfirmBtn = $("#ChapterConfirmBtn") as Button;

const LeftBtn = $("#LeftBtn") as Button;
const RightBtn = $("#RightBtn") as Button;


let DifficultyMaxData: { [key: string]: UserMapSelectDifficulty } = {};
let current_page = 1;
let total_page = 0;

function GetChapterInfoTable() {
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

const ChapterInfoTable = GetChapterInfoTable();

function InitHeroes() {
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

const heroes_key = InitHeroes();

const Create_HeroList = () => {
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

const Create_PlayerList = () => {
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

const ShowChapterInfoTips = (e: Panel, chapter_key: string) => {
    let chapter_data = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
    ChapterTooltip.SetHasClass("is_boss", chapter_data.is_boss == 1);
    ChapterTooltip.AddClass("Show")
    let parentPos = e.GetPositionWithinWindow();
    let offsetX = Math.floor((parentPos["x"] + e.actuallayoutwidth) / e.actualuiscale_x - 160);
    let offsetY = Math.floor((parentPos["y"] + (e.actuallayoutheight / 2) - 100) / e.actualuiscale_y / 2);
    if (offsetX >= 1400) { offsetX -= 540; }
    ChapterTooltip.style.transform = `translatex( ${offsetX}px ) translatey( ${offsetY}px  )`
    ChapterConfirmBtn.enabled = false;
    // 这里需要读取关卡数据
    let local_chapter = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
    // $.Msg(local_chapter)
    let default_max = local_chapter.default_max;
    let default_difficulty = local_chapter.default_difficulty;
    let curr_chapter_data = DifficultyMaxData[chapter_key];
    let user_difficulty = curr_chapter_data.user_difficulty;

    for (let i = 0; i < default_max; i++) {
        const DifficultyButton = ChapterDiffList.GetChild(i) as RadioButton;
        const diff_value = i + default_difficulty;
        // DifficultyButton.visible = i < default_max;
        DifficultyButton.enabled = diff_value <= user_difficulty;
        DifficultyButton.checked = false;
        if (diff_value <= user_difficulty) {
            DifficultyButton.SetPanelEvent("onactivate", () => {
                // 选择关卡
                GameEvents.SendCustomGameEventToServer("MapChapter", {
                    event_name: "SelectDifficulty",
                    params: {
                        difficulty: `${diff_value}`
                    }
                })
            })
        } else {
            DifficultyButton.SetPanelEvent("onactivate", () => { })
        }
    }

    // 掉落
    let st_drop = chapter_data.st_drop_preinstall;
    let pt_drop = chapter_data.drop_preinstall;
    DroppedInfoList.RemoveAndDeleteChildren();
    for (let item_id of st_drop) {
        if (typeof (item_id) == "string") { continue }
        let StItemPanel = $.CreatePanel("Panel", DroppedInfoList, "");
        StItemPanel.BLoadLayoutSnippet("StDropItem");
        let ServerItem = StItemPanel.FindChildTraverse("ServerItem")!
        let serverItemPanel = CreateCustomComponent(ServerItem, "server_item", ``);
        serverItemPanel._SetServerItemInfo({ item_id: item_id, show_tips: true, show_count: false })
    }

    for (let item_id of pt_drop) {
        if (typeof (item_id) == "string") { continue }
        let serverItemPanel = CreateCustomComponent(DroppedInfoList, "server_item", ``);
        serverItemPanel._SetServerItemInfo({ item_id: item_id, show_tips: true, show_count: false })
    }
}

const HideChapterInfoTips = () => {
    ChapterTooltip.RemoveClass("Show")
}



// 章节页面下一页
type FlippingPagesType = 1 | -1;
const ChapterPageTurning = (page_num: FlippingPagesType) => {
    let to_page = current_page + page_num;
    // $.Msg(["page_num", page_num, "to_page", to_page, "total_page", total_page])
    if (to_page > total_page || to_page <= 0) { return }

    for (let i = 0; i < PageList.GetChildCount(); i++) {
        let curr_page = i + 1;
        let ChapterPageInfo = PageList.GetChild(i)!;
        ChapterPageInfo.SetHasClass("Show", curr_page == to_page);
    }

    HideChapterInfoTips();
    current_page = to_page;
    // $.Msg(["curr_page",current_page])
    LeftBtn.enabled = current_page > 1;
    RightBtn.enabled = current_page < total_page;
}



const CreateChapterSelectPanel = () => {
    // 生成章节分页
    total_page = Object.keys(ChapterInfoTable).length;
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
            let diff_value = data.is_boss == 1 ? 193 / 2 : 161 / 2;
            ChapterSelectBtn.style.transform = `translateX(${chapter_data.x - diff_value}px) translateY(${chapter_data.y - diff_value}px)`
        }

        // 章节背景
        const ChapterPageBg = ChapterPageInfo.FindChildTraverse("ChapterPageBg") as ImagePanel;
        // $.Msg(["GetChapterInfoTable", page])
        let page_data = PageBackground[page as keyof typeof PageBackground];
        let page_bg = page_data.src;
        let bg_src = GetTextureSrc(page_bg);
        ChapterPageBg.SetImage(bg_src)
        // $.Msg(bg_src)

        let OffsetTest = ChapterPageInfo.FindChildTraverse("OffsetTest") as Button;
        if (OffsetTest) {
            let actualuiscale_x = OffsetTest.actualuiscale_x;
            let actualuiscale_y = OffsetTest.actualuiscale_y;
            OffsetTest.SetPanelEvent("onactivate", () => {
                let offset = GameUI.GetCursorPosition()
                OffsetTest.SetDialogVariable("offset",
                    `${Math.floor((offset[0] - 215) / actualuiscale_x)} , ${Math.floor((offset[1] - 138) / actualuiscale_y)}`
                )
            })
        }

    }


    // $.Msg(["LeftBtn", "set"])
    LeftBtn.enabled = true
    LeftBtn.SetPanelEvent("onactivate", () => {
        // $.Msg(["LeftBtn onactivate"])
        ChapterPageTurning(-1)
    })
    
    RightBtn.enabled = true
    RightBtn.SetPanelEvent("onactivate", () => {
        // $.Msg(["RightBtn onactivate"])
        ChapterPageTurning(1)
    })
    // $.Msg(RightBtn)

    // Tooltip
    ChapterDiffList.RemoveAndDeleteChildren()
    for (let i = 1; i <= 8; i++) {
        let DifficultyButton = $.CreatePanel("RadioButton", ChapterDiffList, "Diff_" + i);
        DifficultyButton.BLoadLayoutSnippet("DifficultyButton");
        DifficultyButton.enabled = false;
        // DifficultyButton.enabled = Math.floor(Math.random() * 2) == 1;
    }

    let ChapterCancelBtn = $("#ChapterCancelBtn") as Button;
    ChapterCancelBtn.SetPanelEvent("onactivate", () => {
        HideChapterInfoTips();
    })

    // const ClosedBtn = $("#ClosedBtn") as Button;
    // ClosedBtn.SetPanelEvent("onactivate", () => {
    //     ChapterContainer.RemoveClass("Show")
    // })

    const TestToggleBtn = $("#TestToggleBtn") as Button;
    TestToggleBtn.SetPanelEvent("onactivate", () => {
        ChapterContainer.ToggleClass("Show")
    })

    HideChapterInfoTips();
    ChapterConfirmBtn.visible = localPlayer == 0;
}

const UpdateChapterPage = (data: { [key: string]: UserMapSelectDifficulty }) => {

    for (let chapter_key in data) {
        let chapter_id = `Chapter_${chapter_key}`
        let ChapterSelectBtn = PageList.FindChildTraverse(chapter_id)!;
        ChapterSelectBtn.enabled = true;
    }
}

export const Init = () => {

    CreateChapterSelectPanel()

    GameEvents.Subscribe("MapChapter_GetDifficultyMax", event => {
        let data = event.data;
        DifficultyMaxData = data.map_difficulty;
        UpdateChapterPage(data.map_difficulty);
    })

    GameEvents.Subscribe("MapChapter_SelectDifficulty", event => {
        let data = event.data;
        let difficulty = data.select_difficulty;
        ChapterConfirmBtn.enabled = true;
        ChapterConfirmBtn.SetPanelEvent("onactivate", () => {
            // $.Msg("difficulty",difficulty)
            GameEvents.SendCustomGameEventToServer("MapChapter", {
                event_name: "SelectDifficultyAffirm",
                params: {}
            })
        })

    })

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetDifficultyMax",
        params: {}
    })


}

(function () {
    Init()
})();