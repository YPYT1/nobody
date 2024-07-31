import { default as NpcHeroesCustom } from "../../../json/npc_heroes_custom.json";
import { FormatNumberToTime } from "../development/development";

const MainPanel = $.GetContextPanel();
const PlayerStateContainer = $("#PlayerStateContainer");
const HeroesList = $("#HeroesList");
const HeaderTabList = $("#HeaderTabList");
const FocusedHeroSetPreview = $("#FocusedHeroSetPreview");
const HeroConfirm = $("#HeroConfirm") as Button;
let heroModel: ScenePanel;
let HeroIdTable: { [key: number]: string } = {}

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
    $.Msg(["MapChapter_GetPlayerHeroList",event.data])
    MainPanel.Data<PanelDataObject>().start_time = time;
})


GameEvents.Subscribe("MapChapter_GetPlayerSelectHeroList", event => {
    let data = event.data;
    // $.Msg(["MapChapter_GetPlayerSelectHeroList",data])
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


        let HeroCardButton = HeroesList.FindChild(`${hero_id}`) as RadioButton;
        // HeroCardButton.checked = true
        // $.Msg(HeroCardButton)

        if (player_id == Game.GetLocalPlayerID()) {
            heroModel.SetScenePanelToLocalHero(hero_id as HeroID);
            let is_ready = player_data.state == 1;
            HeroConfirm.enabled = !is_ready;
        }
    }
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
    HeroesList.RemoveAndDeleteChildren()
    for (let key in NpcHeroesCustom) {
        let hero_data = NpcHeroesCustom[key as keyof typeof NpcHeroesCustom];
        let hero_id = hero_data.HeroID;
        let hero_name = hero_data.override_hero;
        let HeroCardButton = $.CreatePanel("RadioButton", HeroesList, `${hero_id}`);
        HeroCardButton.BLoadLayoutSnippet("HeroCardButton");

        let HeroIcon = HeroCardButton.FindChildTraverse("HeroIcon") as ImagePanel;
        HeroIcon.SetImage(`file://{images}/heroes/selection/${hero_name}.png`)
        
        // 
        let HeroMovie = HeroCardButton.FindChildTraverse("HeroMovie") as HeroMovie;
        HeroMovie.heroname = hero_name;

        HeroCardButton.SetDialogVariableInt("level", 1)

        HeroCardButton.SetPanelEvent("onactivate", () => {
            HeroCardButton.checked = true
            GameEvents.SendCustomGameEventToServer("MapChapter", {
                event_name: "SelectHero",
                params: {
                    hero_id: hero_id
                }
            })
        })
    }


    FocusedHeroSetPreview.RemoveAndDeleteChildren()
    let Scene = $.CreatePanel("DOTAUIEconSetPreview", FocusedHeroSetPreview, "", {
        class: 'Use3DPreview EconSetPreview full-screen',
        hittest: false,
        // map: "maps/ui/dota_hud/loadout_2022",
        camera: "default_camera",

        displaymode: "loadout_small",
        // light: "global_light",
        allowrotation: true,
        drawbackground: true,
        particleonly: false,
        renderdeferred: true,
    });
    heroModel = Scene.FindChildTraverse('Preview3DItems') as ScenePanel;


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

(function () {
    Init()
})();