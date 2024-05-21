import { reloadable } from "../../utils/tstl-utils";
import * as MapInfo from "../../json/config/map_info.json"
import * as MapInfoDifficulty from "../../json/config/map_info_difficulty.json"
import * as NpcHeroesCustom from "../../json/npc_heroes_custom.json"
import { UIEventRegisterClass } from "../class_extends/ui_event_register_class";



//营地信息

@reloadable
export class MapChapter extends UIEventRegisterClass {

    CampMapHandle: SpawnGroupHandle;

    ChapterMapHandle: SpawnGroupHandle;

    GameDifficulty: keyof typeof MapInfoDifficulty = "101";

    MapIndex: keyof typeof MapInfo = "m1";

    MAP_CAMP = { name: "camp", x: -6144, y: -6144 }

    hero_list: { [key: number]: string } = {}

    // 1 选择地图难度 2选择英雄 3游戏开始了
    _game_select_phase: number = 0; //
    //根据等级可用地图
    _map_list: UserMapSelectDifficulty[] = [];
    //玩家已通关的难度
    level_difficulty: string[] = [];
    //玩家可用英雄列表
    player_hero_available: number[][] = [];
    //玩家选择英雄记录
    player_select_hero: MapSelectHeroList[] = [];
    //玩家数量
    player_count: number = 1;


    constructor() {
        super("MapChapter")
        print("[MapChapter]:constructor")
        for (let index = 0; index < this.player_count; index++) {
            this.player_hero_available.push([57, 102, 22]);
            this.player_select_hero.push({
                hero_id: 57,
                state: 0, //是否确认
            });
        }
    }

    InitChapterMap() {
        print("InitChapterMap")
        let current_map = GetMapName();
        if (current_map != "main") { return }
        //加载营地
        GameRules.MapChapter.OnCreatedCampMap();

        for (let [key, RowData] of pairs(NpcHeroesCustom)) {
            if (RowData.Enable == 1) {
                GameRules.MapChapter.hero_list[RowData.HeroID] = key;
            }
        }

        this._map_list.push({
            is_unlock: 0, // 是否锁定
            user_difficulty: 103, // 玩家最高可选难度
            difficulty_max: 105, // 地图最高难度
            chapter_key: "z1", //地图编号 m1 m2 
        })
        this._map_list.push({
            is_unlock: 0, // 是否锁定
            user_difficulty: 202, // 玩家最高可选难度
            difficulty_max: 205, // 地图最高难度
            chapter_key: "z2", //地图编号 m1 m2 
        })
        this._map_list.push({
            is_unlock: 0, // 是否锁定
            user_difficulty: 302, // 玩家最高可选难度
            difficulty_max: 305, // 地图最高难度
            chapter_key: "z3", //地图编号 m1 m2 
        })
        this._map_list.push({
            is_unlock: 1, // 是否锁定
            user_difficulty: 401, // 玩家最高可选难度
            difficulty_max: 405, // 地图最高难度
            chapter_key: "z4", //地图编号 m1 m2 
        })
        this._map_list.push({
            is_unlock: 1, // 是否锁定
            user_difficulty: 501, // 玩家最高可选难度
            difficulty_max: 505, // 地图最高难度
            chapter_key: "z5", //地图编号 m1 m2 
        })

    }

    /** 生成营地 */
    OnCreatedCampMap() {
        if (this.CampMapHandle == null) {
            let vLocation = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 0);
            for (let hHero of HeroList.GetAllHeroes()) {
                hHero.SetOrigin(vLocation)
            }
            this.CampMapHandle = DOTA_SpawnMapAtPosition(
                "camp",
                vLocation,
                false,
                this.OnCampReadyToSpawn,
                this.OnSpawnCampComplete,
                this
            );
        }
    }

    //营地创建前置
    OnCampReadyToSpawn(spawnGroupHandle: SpawnGroupHandle) {
        print("OnCampReadyToSpawn", spawnGroupHandle);
        ManuallyTriggerSpawnGroupCompletion(spawnGroupHandle)
    }

    //营地创建后置
    OnSpawnCampComplete(spawnGroupHandle: SpawnGroupHandle) {
        print("OnSpawnCampComplete", spawnGroupHandle);
        // GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        // for (let hHero of HeroList.GetAllHeroes()) {
        //     let vect = hHero.GetAbsOrigin();
        //     vect.z += 128;
        //     hHero.SetOrigin(vect)
        // }
    }


    //获取游戏最高难度
    GetDifficultyMax(player_id: PlayerID, params: CGED["MapChapter"]["GetDifficultyMax"]) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MapChapter_GetDifficultyMax",
            {
                data: {
                    map_difficulty: this._map_list,
                    level_difficulty: this.level_difficulty,
                }
            }
        );
    }

    //选择游戏难度
    SelectDifficulty(player_id: PlayerID, params: CGED["MapChapter"]["SelectDifficulty"]) {
        if (this._game_select_phase == 0 && player_id == 0 && params.difficulty != "-1") {
            this.GameDifficulty = params.difficulty as keyof typeof MapInfoDifficulty;
            this.MapIndex = MapInfoDifficulty[this.GameDifficulty].map_key as keyof typeof MapInfo;
        }
        CustomGameEventManager.Send_ServerToAllClients(
            "MapChapter_SelectDifficulty",
            {
                data: {
                    select_map: this.MapIndex,
                    select_difficulty: this.GameDifficulty,
                }
            }
        );
    }

    //确认难度
    SelectDifficultyAffirm(player_id: PlayerID, params: CGED["MapChapter"]["SelectDifficultyAffirm"]) {
        if (this._game_select_phase == 0) {
            this._game_select_phase = 1; //修改游戏进程
            this.GetGameSelectPhase(-1, {})
            //发送选择英雄信息
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                GameRules.MapChapter.GetPlayerHeroList(index, {})
            }
        }
    }

    /**
     * 从选择英雄返回到选择难度
     * @param player_id 
     * @param params 
     */
    ReturnSelectDifficulty(player_id: PlayerID, params: CGED["MapChapter"]["ReturnSelectDifficulty"]) {
        if (this._game_select_phase == 1 && player_id == 0) {
            this._game_select_phase = 0; //返回到选择难度
            this.GetGameSelectPhase(-1, {})
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                //清空玩家选择状态
                this.player_select_hero[index].state = 0;
            }
            GameRules.MapChapter.SelectDifficulty( -1 , { difficulty : "-1"})
        }
    }

    //获取玩家可用英雄列表
    GetPlayerHeroList(player_id: PlayerID, params: CGED["MapChapter"]["GetPlayerHeroList"]) {
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MapChapter_GetPlayerHeroList",
            {
                data: {
                    hero_id: this.player_hero_available[player_id],
                }
            }
        );
    }
    //获取玩家已选英雄列表
    GetPlayerSelectHeroList(player_id: PlayerID, params: CGED["MapChapter"]["GetPlayerSelectHeroList"]) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "MapChapter_GetPlayerSelectHeroList",
                {
                    data: {
                        hero_ids: this.player_select_hero,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MapChapter_GetPlayerSelectHeroList",
                {
                    data: {
                        hero_ids: this.player_select_hero,
                    }
                }
            )
        }
    }

    //获取当前游戏流程
    GetGameSelectPhase(player_id: PlayerID, params: CGED["MapChapter"]["GetGameSelectPhase"]) {
        if (player_id == -1) {
            CustomGameEventManager.Send_ServerToAllClients(
                "MapChapter_GetGameSelectPhase",
                {
                    data: {
                        game_select_phase: this._game_select_phase,
                    }
                }
            );
        } else {
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(player_id),
                "MapChapter_GetGameSelectPhase",
                {
                    data: {
                        game_select_phase: this._game_select_phase,
                    }
                }
            )
        }
    }

    //选择英雄
    SelectHero(player_id: PlayerID, params: CGED["MapChapter"]["SelectHero"]) {
        if (this._game_select_phase == 1) {
            if (this.player_select_hero[player_id].state == 0) {
                let hero_id = params.hero_id
                this.player_select_hero[player_id].hero_id = hero_id;
                GameRules.MapChapter.GetPlayerSelectHeroList(-1, {})
            }
        }

    }
    //确认英雄
    SelectHeroAffirm(player_id: PlayerID, params: CGED["MapChapter"]["SelectHeroAffirm"]) {
        if (this._game_select_phase == 1 && this.player_select_hero[player_id].state == 0) {
            this.player_select_hero[player_id].state = 1;
            GameRules.MapChapter.GetPlayerSelectHeroList(-1, {})
        }

        for (const date of this.player_select_hero) {
            if (date.state != 1) {
                return
            }
        }
        //修改流程
        this._game_select_phase = 2;
        this.GetGameSelectPhase(-1, {})

        let ChapterData = MapInfo[this.MapIndex];

        GameRules.MapChapter.GetPlayerSelectHeroList(-1, {})
        let vLocation = Vector(ChapterData.map_centre_x, ChapterData.map_centre_y, 0);
        this.ChapterMapHandle = DOTA_SpawnMapAtPosition(
            ChapterData.map_name,
            vLocation,
            false,
            this.OnRoomReadyToSpawn,
            this.OnSpawnRoomComplete,
            this
        );
    }

    //根据选择刷出地图
    OnLoadChapterMap(map_index: keyof typeof MapInfo, difficulty: keyof typeof MapInfoDifficulty) {
        this.MapIndex = map_index;
        this.GameDifficulty = difficulty;
    }

    //游戏地图创建前置
    OnRoomReadyToSpawn(spawnGroupHandle: SpawnGroupHandle) {
        print("OnCampReadyToSpawn", spawnGroupHandle);
        ManuallyTriggerSpawnGroupCompletion(spawnGroupHandle)
    }
    //游戏地图创建后置
    OnSpawnRoomComplete(spawnGroupHandle: SpawnGroupHandle) {
        print("OnSpawnRoomComplete", spawnGroupHandle);
        GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        let ChapterData = MapInfo[this.MapIndex];
        let vLocation = Vector(ChapterData.map_centre_x, ChapterData.map_centre_y, 0);

        for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
            let hHero = PlayerResource.GetSelectedHeroEntity(index)
            hHero.SetOrigin(vLocation);
            let hname = GameRules.MapChapter.hero_list[this.player_select_hero[index].hero_id];
            PlayerResource.ReplaceHeroWith(
                index,
                hname,
                0,
                0
            );

            UTIL_Remove(hHero)
        }

        this._game_select_phase = 3
        this.GetGameSelectPhase(-1, {})
        //开始刷怪
        GameRules.Spawn.Init(ChapterData.map_centre_x, ChapterData.map_centre_y)
        GameRules.GetGameModeEntity().SetContextThink(
            "StartSpawn",
            () => {
                GameRules.Spawn._game_start = true;
                GameRules.Spawn.StartSpawn()
                return null;
            },
            5
        );
    }


    OnRemoveChapterMap() {

    }


    //返回到营地
    ReturntoCamp() {
        let hDropItemList = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            Vector(0,0,0),
            null,
            99999,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.OTHER,
            UnitTargetFlags.INVULNERABLE,
            FindOrder.ANY,
            false
        )
        for(let hItem of hDropItemList){
            hItem.RemoveSelf()
        }
        // let unitlist = Entities.FindAllByClassname("npc_exp");
        // print("unitlist", unitlist.length)
        if (GameRules.Spawn._game_start == false && this._game_select_phase == 999) {
            this._game_select_phase = 0;
            this.GetGameSelectPhase(-1, {})
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                this.player_select_hero[index].state = 0;
                //初始化可选技能 == 清理
                GameRules.NewArmsEvolution.InitPlayerUpgradeStatus(index)
                //初始化可用符文 == 清理
                GameRules.RuneSystem.InitPlayerUpgradeStatus(index)
                //初始化神秘商店
                GameRules.MysticalShopSystem.InitPlayerUpgradeStatus(index)

            }
            let vLocation = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 0);
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                let hHero = PlayerResource.GetSelectedHeroEntity(index)
                hHero.SetOrigin(vLocation);
                let hname = GameRules.MapChapter.hero_list[this.player_select_hero[index].hero_id];
                
                PlayerResource.ReplaceHeroWith(
                    index,
                    "npc_dota_hero_wisp",
                    0,
                    0
                );
                UTIL_Remove(hHero)
            }
    
            if (this.ChapterMapHandle) {
                UnloadSpawnGroupByHandle(this.ChapterMapHandle)
                this.ChapterMapHandle = null
            }
            GameRules.MapChapter.SelectDifficulty( -1 , { difficulty : "-1"})

            GameRules.ResourceSystem.InitAllPlayer();


        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {

        if (cmd == "-fh") {
            this.ReturntoCamp()
        }
        if (cmd == "-qzfh") {
            GameRules.Spawn._game_start = false
            this._game_select_phase = 999
            this.ReturntoCamp()
        }
        if (cmd == "-di") {
            let map_index = (args[0] ?? "m1") as keyof typeof MapInfo;
            let difficulty = (args[0] ?? "101") as keyof typeof MapInfoDifficulty;
            this.OnLoadChapterMap(map_index, difficulty)
        }
        if (cmd == "-sh") {
            let hero_index = args[0] ?? "0";
            this.SelectHero(player_id, { hero_id: parseInt(hero_index) })
        }
        if (cmd == "-mapinfo") {
            print("GameRules.Spawn._game_start", GameRules.Spawn._game_start)
            print("this._game_select_phase", this._game_select_phase)
            this.ReturnSelectDifficulty(player_id, {})
        }

    }
}