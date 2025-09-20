import { CreateCustomComponent, LoadCustomComponent } from '../../../dashboard/_components/component_manager';
import { default as ChapterInfo } from '../../../json/config/chapter_info.json';
import { default as PageBackground } from '../../../json/config/page_background.json';
import { default as NpcHeroesCustom } from '../../../json/npc_heroes_custom.json';

const CreateServerItem = GameUI.CustomUIConfig().CreateServerItem;
const GetTextureSrc = GameUI.CustomUIConfig().GetTextureSrc;
const localPlayer = Game.GetLocalPlayerID();
const MainPanel = $.GetContextPanel();
const ChapterContainer = $('#ChapterContainer');
const PageList = $('#ChapterPageList');
// const ChapterList = $("#ChapterList");
const ChapterTooltip = $('#ChapterTooltip');
const ChapterDiffList = $('#ChapterDiffList');
const DroppedInfoList = $('#DroppedInfoList');
const ChapterConfirmBtn = $('#ChapterConfirmBtn') as Button;

const LeftBtn = $('#LeftBtn') as Button;
const RightBtn = $('#RightBtn') as Button;

let DifficultyMaxData: { [key: string]: UserMapSelectDifficulty } = {};
let current_page = 1;
let total_page = 0;

function GetChapterInfoTable() {
    const chapter_table: {
        [in_page: number]: {
            [chapter_key: string]: {
                default_max: number;
                unlock_difficulty: number;
                is_open: number;
                is_boss: number;
            };
        };
    } = {};

    for (const chapter_key in ChapterInfo) {
        const row_data = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
        const in_page = row_data.in_page;
        if (chapter_table[in_page] == null) {
            chapter_table[in_page] = {};
        }
        chapter_table[in_page][chapter_key] = {
            default_max: row_data.default_max,
            unlock_difficulty: row_data.unlock_difficulty,
            is_open: row_data.is_open,
            is_boss: row_data.is_boss,
        };
    }

    return chapter_table;
}

const ChapterInfoTable = GetChapterInfoTable();

function InitHeroes() {
    const hero_table: { [heroid: string]: string } = {};
    for (const heroname in NpcHeroesCustom) {
        const row_data = NpcHeroesCustom[heroname as keyof typeof NpcHeroesCustom];
        const enable = row_data.Enable;
        if (enable == 1) {
            const hero_id = row_data.HeroID;
            // let index = row_data.Index;
            hero_table[`${hero_id}`] = heroname;
            // hero_table.push({ heroname, enable, index });
            // heroes_order_table[index] = heroname;
        }
    }
    // hero_table.sort((a, b) => { return a.index - b.index; });
    return hero_table;
}

const heroes_key = InitHeroes();

const Create_HeroList = () => {
    const PickHeroList = $('#PickHeroList');
    PickHeroList.RemoveAndDeleteChildren();
    Object.values(NpcHeroesCustom).map((v, k) => {
        const HeroCardButton = $.CreatePanel('RadioButton', PickHeroList, '');
        const heroname = v.override_hero;
        const heroId = v.HeroID;
        HeroCardButton.BLoadLayoutSnippet('HeroCardButton');

        const HeroIcon = HeroCardButton.FindChildTraverse('HeroIcon') as ImagePanel;
        HeroIcon.SetImage(`file://{images}/heroes/selection/${heroname}.png`);

        const HeroMovie = HeroCardButton.FindChildTraverse('HeroMovie') as HeroMovie;
        HeroMovie.heroname = heroname;

        HeroCardButton.SetPanelEvent('onactivate', () => {
            GameEvents.SendCustomGameEventToServer('MapChapter', {
                event_name: 'SelectHero',
                params: {
                    hero_id: heroId,
                },
            });
        });
        // return <HeroCardButton key={k} heroname={v[0]} hero_id={v[1].HeroID} />
    });
};

const Create_PlayerList = () => {
    const PlayerList = $('#PlayerList');
    PlayerList.RemoveAndDeleteChildren();
    Game.GetAllPlayerIDs().map((Player, k) => {
        const PlayerInfo = Game.GetPlayerInfo(Player);
        // const steamid =
        const PlayerReadyStateItem = $.CreatePanel('Panel', PlayerList, '');
        PlayerReadyStateItem.BLoadLayoutSnippet('PlayerReadyStateItem');
        // PlayerReadyStateItem.visible = false;
        PlayerReadyStateItem.SetHasClass('is_local', Players.GetLocalPlayer() == Player);
        PlayerReadyStateItem.SetDialogVariable('player_name', PlayerInfo.player_name);

        const DOTAAvatarImage = PlayerReadyStateItem.FindChildTraverse('DOTAAvatarImage') as AvatarImage;
        DOTAAvatarImage.steamid = PlayerInfo.player_steamid;
    });

    GameEvents.Subscribe('MapChapter_GetPlayerSelectHeroList', event => {
        const data = event.data;
        const hero_ids = data.hero_ids;
        // let player_state = Object.values(data.hero_ids);
        // $.Msg(["player_state", player_state])
        // setPlayerState(player_state)
        if (PlayerList) {
            for (const k in hero_ids) {
                const index = parseInt(k) - 1;
                const info = hero_ids[k];
                // $.Msg(["k",k])
                const StatePanel = PlayerList.GetChild(index);
                // $.Msg(StatePanel)
                if (StatePanel) {
                    StatePanel.visible = true;
                    const HeroIcon = StatePanel.FindChildTraverse('HeroIcon') as ImagePanel;
                    const heroname = heroes_key[info.hero_id];
                    HeroIcon.SetImage(`file://{images}/heroes/selection/${heroname}.png`);
                    StatePanel.SetHasClass('is_ready', info.state == 1);
                }
            }
        }
    });
};

const ShowChapterInfoTips = (e: Panel, chapter_key: string) => {
    const chapter_data = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
    ChapterTooltip.SetHasClass('is_boss', chapter_data.is_boss == 1);
    ChapterTooltip.AddClass('Show');
    const parentPos = e.GetPositionWithinWindow();
    let offsetX = Math.floor((parentPos['x'] + e.actuallayoutwidth) / e.actualuiscale_x - 160);
    const offsetY = Math.floor((parentPos['y'] + e.actuallayoutheight / 2 - 100) / e.actualuiscale_y / 2);
    if (offsetX >= 1400) {
        offsetX -= 540;
    }
    ChapterTooltip.style.transform = `translatex( ${offsetX}px ) translatey( ${offsetY}px  )`;
    ChapterConfirmBtn.enabled = false;
    // 这里需要读取关卡数据
    const local_chapter = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
    // $.Msg(local_chapter)
    const default_max = local_chapter.default_max;
    const default_difficulty = local_chapter.default_difficulty;
    const curr_chapter_data = DifficultyMaxData[chapter_key];
    const user_difficulty = curr_chapter_data.user_difficulty;

    // 可选择关卡
    // $.Msg(["DifficultyMaxData",DifficultyMaxData])
    for (let i = 0; i < default_max; i++) {
        const DifficultyButton = ChapterDiffList.GetChild(i) as RadioButton;
        const diff_value = i + default_difficulty;
        // DifficultyButton.visible = i < default_max;
        DifficultyButton.enabled = diff_value <= user_difficulty;
        DifficultyButton.checked = false;
        if (diff_value <= user_difficulty) {
            DifficultyButton.SetPanelEvent('onactivate', () => {
                // 选择关卡
                GameEvents.SendCustomGameEventToServer('MapChapter', {
                    event_name: 'SelectDifficulty',
                    params: {
                        difficulty: `${diff_value}`,
                    },
                });
            });
        } else {
            DifficultyButton.SetPanelEvent('onactivate', () => {});
        }
    }

    // 掉落
    const st_drop = chapter_data.st_drop_preinstall;
    const pt_drop = chapter_data.drop_preinstall;
    DroppedInfoList.RemoveAndDeleteChildren();
    for (const item_id of st_drop) {
        if (typeof item_id == 'string') {
            continue;
        }
        const StItemPanel = $.CreatePanel('Panel', DroppedInfoList, '');
        StItemPanel.BLoadLayoutSnippet('StDropItem');
        const ServerItem = StItemPanel.FindChildTraverse('ServerItem')!;
        const serverItemPanel = CreateCustomComponent(ServerItem, 'server_item', ``);
        serverItemPanel._SetServerItemInfo({ item_id: item_id, show_tips: true, show_count: false });
    }

    for (const item_id of pt_drop) {
        if (typeof item_id == 'string') {
            continue;
        }
        const serverItemPanel = CreateCustomComponent(DroppedInfoList, 'server_item', ``);
        serverItemPanel._SetServerItemInfo({ item_id: item_id, show_tips: true, show_count: false });
    }
};

const HideChapterInfoTips = () => {
    ChapterTooltip.RemoveClass('Show');
};

// 章节页面下一页
type FlippingPagesType = 1 | -1;
const ChapterPageTurning = (page_num: FlippingPagesType) => {
    const to_page = current_page + page_num;
    // $.Msg(["page_num", page_num, "to_page", to_page, "total_page", total_page])
    if (to_page > total_page || to_page <= 0) {
        return;
    }

    for (let i = 0; i < PageList.GetChildCount(); i++) {
        const curr_page = i + 1;
        const ChapterPageInfo = PageList.GetChild(i)!;
        ChapterPageInfo.SetHasClass('Show', curr_page == to_page);
    }

    HideChapterInfoTips();
    current_page = to_page;
    // $.Msg(["curr_page",current_page])
    LeftBtn.enabled = current_page > 1;
    RightBtn.enabled = current_page < total_page;
};

const numToText = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

const CreateChapterSelectPanel = () => {
    // 生成章节分页
    total_page = Object.keys(ChapterInfoTable).length;
    PageList.RemoveAndDeleteChildren();
    for (const page in ChapterInfoTable) {
        const PageData = ChapterInfoTable[page];
        const ChapterPageInfo = $.CreatePanel('Panel', PageList, `Page_${page}`);
        ChapterPageInfo.BLoadLayoutSnippet('ChapterPageInfo');
        ChapterPageInfo.SetHasClass('Show', page == '1');
        const ChapterList = ChapterPageInfo.FindChildTraverse('ChapterList')!;
        let chapter_num = 1;
        for (const chapter_key in PageData) {
            const data = PageData[chapter_key];
            const chapter_data = ChapterInfo[chapter_key as keyof typeof ChapterInfo];
            const ChapterSelectBtn = $.CreatePanel('RadioButton', ChapterList, `Chapter_${chapter_key}`);
            ChapterSelectBtn.BLoadLayoutSnippet('ChapterSelectBtn');
            ChapterSelectBtn.SetHasClass('is_boss', data.is_boss == 1);
            ChapterSelectBtn.SetDialogVariable('chapter_name', '区域 ' + numToText[chapter_num]);
            ChapterSelectBtn.enabled = false;
            ChapterSelectBtn.SetPanelEvent('onactivate', () => {
                ShowChapterInfoTips(ChapterSelectBtn, chapter_key);
            });
            const diff_value = data.is_boss == 1 ? 193 / 2 : 161 / 2;
            ChapterSelectBtn.style.transform = `translateX(${chapter_data.x - diff_value}px) translateY(${chapter_data.y - diff_value}px)`;
            chapter_num++;
        }

        // 章节背景
        const ChapterPageBg = ChapterPageInfo.FindChildTraverse('ChapterPageBg') as ImagePanel;
        // $.Msg(["GetChapterInfoTable", page])
        const page_data = PageBackground[page as keyof typeof PageBackground];
        const page_bg = page_data.src;
        const bg_src = GetTextureSrc(page_bg);
        ChapterPageBg.SetImage(bg_src);
        // $.Msg(bg_src)

        const ChapterBpRouteBtn = ChapterPageInfo.FindChildTraverse('ChapterBpRouteBtn') as Button;
        ChapterBpRouteBtn.SetPanelEvent('onactivate', () => {
            GameUI.CustomUIConfig().DashboardRoute('event', 'bp');
        });
        const OffsetTest = ChapterPageInfo.FindChildTraverse('OffsetTest') as Button;
        if (OffsetTest) {
            const actualuiscale_x = OffsetTest.actualuiscale_x;
            const actualuiscale_y = OffsetTest.actualuiscale_y;
            OffsetTest.SetPanelEvent('onactivate', () => {
                const offset = GameUI.GetCursorPosition();
                OffsetTest.SetDialogVariable(
                    'offset',
                    `${Math.floor((offset[0] - 215) / actualuiscale_x)} , ${Math.floor((offset[1] - 138) / actualuiscale_y)}`
                );
            });
        }
    }

    // $.Msg(["LeftBtn", "set"])
    LeftBtn.enabled = true;
    LeftBtn.SetPanelEvent('onactivate', () => {
        // $.Msg(["LeftBtn onactivate"])
        ChapterPageTurning(-1);
    });

    RightBtn.enabled = true;
    RightBtn.SetPanelEvent('onactivate', () => {
        // $.Msg(["RightBtn onactivate"])
        ChapterPageTurning(1);
    });
    // $.Msg(RightBtn)

    // Tooltip
    ChapterDiffList.RemoveAndDeleteChildren();
    for (let i = 1; i <= 8; i++) {
        const DifficultyButton = $.CreatePanel('RadioButton', ChapterDiffList, 'Diff_' + i);
        DifficultyButton.BLoadLayoutSnippet('DifficultyButton');
        DifficultyButton.enabled = false;
        // DifficultyButton.enabled = Math.floor(Math.random() * 2) == 1;
    }

    const ChapterCancelBtn = $('#ChapterCancelBtn') as Button;
    ChapterCancelBtn.SetPanelEvent('onactivate', () => {
        HideChapterInfoTips();
    });

    // const ClosedBtn = $("#ClosedBtn") as Button;
    // ClosedBtn.SetPanelEvent("onactivate", () => {
    //     ChapterContainer.RemoveClass("Show")
    // })

    const TestToggleBtn = $('#TestToggleBtn') as Button;
    TestToggleBtn.SetPanelEvent('onactivate', () => {
        ChapterContainer.ToggleClass('Show');
    });

    HideChapterInfoTips();
    ChapterConfirmBtn.visible = localPlayer == 0;
};

const UpdateChapterPage = (data: { [key: string]: UserMapSelectDifficulty }) => {
    for (const chapter_key in data) {
        const chapter_id = `Chapter_${chapter_key}`;
        const ChapterSelectBtn = PageList.FindChildTraverse(chapter_id)!;
        ChapterSelectBtn.enabled = true;
    }
};

export const Init = () => {
    CreateChapterSelectPanel();

    GameEvents.Subscribe('MapChapter_GetDifficultyMax', event => {
        const data = event.data;
        DifficultyMaxData = data.map_difficulty;
        UpdateChapterPage(data.map_difficulty);
    });

    GameEvents.Subscribe('MapChapter_SelectDifficulty', event => {
        const data = event.data;
        const difficulty = data.select_difficulty;
        ChapterConfirmBtn.enabled = true;
        ChapterConfirmBtn.SetPanelEvent('onactivate', () => {
            // $.Msg("difficulty",difficulty)
            GameEvents.SendCustomGameEventToServer('MapChapter', {
                event_name: 'SelectDifficultyAffirm',
                params: {},
            });
            HideChapterInfoTips();
        });
    });

    GameEvents.SendCustomGameEventToServer('MapChapter', {
        event_name: 'GetDifficultyMax',
        params: {},
    });
};

(function () {
    Init();
})();
