import { LoadCustomComponent } from "../../../dashboard/_components/component_manager";
import { default as NpcHeroesCustom } from "../../../json/npc_heroes_custom.json";
import { FormatNumberToTime } from "../../../utils/method";
// import { FormatNumberToTime } from "../development/development";
// 
// map=
const HeroBackground = $("#HeroBackground")
const MainPanel = $.GetContextPanel();
const PlayerStateContainer = $("#PlayerStateContainer");
const HeroesList = $("#HeroesList");
const HeaderTabList = $("#HeaderTabList");
const FocusedHeroSetPreview = $("#FocusedHeroSetPreview");
const HeroScenePanel = $("#HeroScenePanel") as ScenePanel;
const HeroConfirm = $("#HeroConfirm") as Button;
let heroModel: ScenePanel;
let HeroIdTable: { [key: number]: string } = {}

let local_select_id = 6;
let select_talent_index = 0;
function InitKvTable() {
    for (let k in NpcHeroesCustom) {
        let hero_data = NpcHeroesCustom[k as keyof typeof NpcHeroesCustom];
        let heroid = hero_data.HeroID;
        HeroIdTable[heroid] = hero_data.override_hero;
    }
}

GameEvents.Subscribe("MapChapter_GetPlayerHeroList", event => {
    let heroes = event.data.hero_id;
    let time = event.data.time;
    // $.Msg(["MapChapter_GetPlayerHeroList", event.data])
    MainPanel.Data<PanelDataObject>().start_time = time;
})


GameEvents.Subscribe("MapChapter_GetPlayerSelectHeroList", event => {
    let data = event.data;
    // $.Msg(["MapChapter_GetPlayerSelectHeroList", data])
    let hero_ids = Object.values(data.hero_ids)
    for (let player_id = 0 as PlayerID; player_id < hero_ids.length; player_id++) {
        let PlayerState = PlayerStateContainer.GetChild(player_id)!;
        let player_data = hero_ids[player_id];
        let hero_id = player_data.hero_id;
        let hero_name = HeroIdTable[hero_id];

        let hero_data = NpcHeroesCustom[hero_name as keyof typeof NpcHeroesCustom];
        let PortraitImage = hero_data.PortraitImage
        // $.Msg(["hero_name",hero_name]);

        let HeroIcon = PlayerState.FindChildTraverse("HeroIcon") as ImagePanel;
        // HeroIcon.SetImage(`file://{images}/heroes/selection/${hero_name}.png`)
        HeroIcon.SetImage(`file://{images}/heroes/${PortraitImage}.png`)
        PlayerState.SetDialogVariable("hero_name", $.Localize(`#${hero_name}`))

        let is_enable = hero_data.Enable == 1;

        if (player_id == Game.GetLocalPlayerID()) {
            // $.Msg(["hero_id", hero_id, local_select_id])
            for (let i = 0; i < HeroBackground.GetChildCount(); i++) {
                let row_panel = HeroBackground.GetChild(i) as ScenePanel;
                let row_id = row_panel.id;
                row_panel.SetHasClass("Show", row_id == `${hero_id}`)

                if (local_select_id != hero_id) {
                    local_select_id = hero_id;
                    // row_panel.FireEntityInput("hero_camera_driver", "SetAnimation", "debut_camera_anim")
                    // row_panel.FireEntityInput("qop_arcana", "mapunitname", "npc_dota_hero_axe")
                    // 更新个人天赋信息
                    HeroTalentConfig.SetSelectedIndex(0)
                }

            }

            let is_ready = player_data.state == 1;
            HeroConfirm.enabled = !is_ready;

            for (let i = 0; i < HeroesList.GetChildCount(); i++) {
                let HeroCardButton = HeroesList.GetChild(i) as RadioButton;
                let card_hero_id = HeroCardButton.id;
                HeroCardButton.checked = card_hero_id == `${hero_id}`
            }

            MainPanel.SetDialogVariable("local_heroname",$.Localize(`#${hero_name}`))
            
        }
    }

    // 更新个人天赋
    // HeroesList
})

function StartLoopThinker() {
    const dotaTime = Game.GetDOTATime(false, false);
    let start_time = MainPanel.Data<PanelDataObject>().start_time
    let TimeLabel = FormatNumberToTime(Math.floor(start_time - dotaTime))
    MainPanel.SetDialogVariable("countdown", `${TimeLabel[0]}:${TimeLabel[1]}`)

    $.Schedule(0.5, StartLoopThinker)
}

function CreatePlayerStatePanel() {
    PlayerStateContainer.RemoveAndDeleteChildren();
    let AllPlayerId: PlayerID[] = Game.GetAllPlayerIDs();
    let heroname = "npc_dota_hero_drow_ranger";

    for (let pid of AllPlayerId) {
        let is_local = pid == Players.GetLocalPlayer();
        let playerInfo = Game.GetPlayerInfo(pid);
        let PlayerState = $.CreatePanel("Panel", PlayerStateContainer, "");
        PlayerState.BLoadLayoutSnippet("PlayerState");
        PlayerState.SetHasClass("Local", is_local);

        let HeroIcon = PlayerState.FindChildTraverse("HeroIcon") as ImagePanel;
        HeroIcon.SetImage(`file://{images}/heroes/selection/${heroname}.png`)


        PlayerState.SetDialogVariable("hero_name", $.Localize(`#${heroname}`))
        PlayerState.SetDialogVariable("player_name", "玩家名字")
    }

    // 创建英雄列表搜
    let order = 0;
    HeroesList.RemoveAndDeleteChildren()
    for (let key in NpcHeroesCustom) {
        let hero_data = NpcHeroesCustom[key as keyof typeof NpcHeroesCustom];
        let hero_id = hero_data.HeroID;
        let hero_name = hero_data.override_hero;
        let Enable = hero_data.Enable == 1;
        let HeroCardButton = $.CreatePanel("RadioButton", HeroesList, `${hero_id}`);
        HeroCardButton.BLoadLayoutSnippet("HeroCardButton");
        HeroCardButton.checked = order == 0;
        let HeroIcon = HeroCardButton.FindChildTraverse("HeroIcon") as ImagePanel;
        HeroIcon.SetImage(`file://{images}/heroes/selection/${hero_name}.png`)

        let HeroMovie = HeroCardButton.FindChildTraverse("HeroMovie") as HeroMovie;
        HeroMovie.heroname = hero_name;
        HeroCardButton.SetDialogVariableInt("level", 1)
        HeroCardButton.SetPanelEvent("onactivate", () => {

            GameEvents.SendCustomGameEventToServer("MapChapter", {
                event_name: "SelectHero",
                params: {
                    hero_id: hero_id
                }
            });

            for (let i = 0; i < HeroesList.GetChildCount(); i++) {
                let row_panel = HeroesList.GetChild(i) as RadioButton;
                row_panel.enabled = row_panel.id != `${hero_id}`
                // row_panel.Data<PanelDataObject>().is_check = row_panel.id == `${hero_id}`;
            }
        })
        order += 1
    }

    // FocusedHeroSetPreview.RemoveAndDeleteChildren()
    // let Scene = $.CreatePanel("DOTAUIEconSetPreview", FocusedHeroSetPreview, "", {
    //     class: 'Use3DPreview EconSetPreview full-screen',
    //     hittest: false,
    //     // map: "maps/ui/dota_hud/loadout_2022",
    //     camera: "default_camera",
    //     displaymode: "loadout_small",
    //     // light: "global_light",
    //     allowrotation: true,
    //     drawbackground: true,
    //     particleonly: false,
    //     renderdeferred: true,
    // });
    // heroModel = Scene.FindChildTraverse('Preview3DItems') as ScenePanel;

    HeroConfirm.SetPanelEvent("onactivate", () => {
        HeroConfirm.enabled = false;
        GameEvents.SendCustomGameEventToServer("MapChapter", {
            event_name: "SelectHeroAffirm",
            params: {}
        })
    })

    StartLoopThinker()
}

export const Init = () => {
    InitKvTable()
    InitHeroTalentConfig();
    MainPanel.Data<PanelDataObject>().start_time = -1;
    MainPanel.SetPanelEvent("onactivate", () => { })
    CreatePlayerStatePanel();

    GameEvents.Subscribe("MapChapter_GetGameSelectPhase", event => {
        let game_select_phase = event.data.game_select_phase;
        if (game_select_phase == 1) {
            HeroConfirm.enabled = true
        }
    })

    // 最后执行
    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetPlayerHeroList",
        params: {}
    })

    GameEvents.SendCustomGameEventToServer("MapChapter", {
        event_name: "GetPlayerSelectHeroList",
        params: {}
    })

    // start

}

const TalentTooltips = $("#TalentTooltips")
const TalentConfigTips = $("#TalentConfigTips")
const TalentAttributeList = $("#TalentAttributeList");
const HeroTalentConfig = $("#SelectionHeroTalentConfig") as DropDown;
const InitHeroTalentConfig = () => {

    HeroTalentConfig.RemoveAllOptions();
    for (let i = 0; i < 3; i++) {
        let id = "" + i;
        let optionLabel = $.CreatePanel("Label", HeroTalentConfig, `${id}`, {
            text: "天赋页" + (i + 1),
            html: true,
        });
        optionLabel.Data<PanelDataObject>().index = i;
        HeroTalentConfig.AddOption(optionLabel)
    }

    // const localData = GameUI.CustomUIConfig().getStorage("talent_data")!;

    $.Schedule(0.01, () => {
        HeroTalentConfig.SetSelectedIndex(0);
        HeroTalentConfig.SetPanelEvent("oninputsubmit", () => {
            let select_panel = HeroTalentConfig.GetSelected();
            let config_index = 0;
            if (select_panel == null) {
                config_index = 0
            } else {
                config_index = parseInt(HeroTalentConfig.GetSelected().id);
            }
            select_talent_index = config_index
            // $.Msg(["select talent", local_select_id, select_talent_index])

        })
    })

    TalentConfigTips.SetPanelEvent("onmouseover", () => {
        TalentTooltips.SetHasClass("Show", true)
        UpdateTalentDataInTips()
    })

    TalentConfigTips.SetPanelEvent("onmouseout", () => {
        TalentTooltips.SetHasClass("Show", false)
    })
}
const server_talent_data = GameUI.CustomUIConfig().KvData.server_talent_data;
const CheckAttrIsPercent = GameUI.CustomUIConfig().CheckAttrIsPercent

function UpdateTalentDataInTips() {
    // $.Msg(["select talent", local_select_id, select_talent_index])
    const localData = GameUI.CustomUIConfig().getStorage("talent_data")!;
    const config_data = Object.values(localData[local_select_id])[select_talent_index];
    // $.Msg(config_data)
    TalentTooltips.SetDialogVariable("config_index", "天赋页" + (select_talent_index + 1))

    const config_tree = config_data.i

    let attr_object: { [main: string]: { [sub: string]: number } } = {}
    for (let tire in config_tree) {
        let row_data = config_tree[tire].k;
        for (let id in row_data) {
            let row_talent = row_data[id];
            let rowdata = server_talent_data[id as keyof typeof server_talent_data];
            const ObjectValues = rowdata.ObjectValues as CustomAttributeTableType

            for (let main_key in ObjectValues) {
                if (attr_object[main_key] == null) {
                    attr_object[main_key] = {}
                }
                let main_data = ObjectValues[main_key as keyof typeof ObjectValues];
                for (let sub_key in main_data) {
                    let value = main_data[sub_key as keyof typeof main_data]! * row_talent.uc;
                    if (value > 0) {
                        if (attr_object[main_key][sub_key] == null) {
                            attr_object[main_key][sub_key] = 0
                        }
                        attr_object[main_key][sub_key] += (value)
                    }

                }
            }

        }
    }


    // 生成属性
    TalentAttributeList.RemoveAndDeleteChildren();
    for (let main_key in attr_object) {
        for (let sub_key in attr_object[main_key]) {
            let value = attr_object[main_key][sub_key];
            let _Panel = $.CreatePanel("Panel", TalentAttributeList, "");
            let PanelAttributeRow = LoadCustomComponent(_Panel, "row_attribute");
            PanelAttributeRow.SetAttributeMainKey(main_key, value, 0)
            // PanelAttributeRow.SetAttributeMainKey(attr_main, value);
            let is_pct = CheckAttrIsPercent(main_key, sub_key)

            PanelAttributeRow.IsPercent(is_pct)
            PanelAttributeRow.SetPercentValue(value)
        }

    }

}
(function () {
    Init()
})();