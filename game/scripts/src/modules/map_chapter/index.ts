import { reloadable } from "../../utils/tstl-utils";
import * as MapInfo from "../../json/config/map_info.json"
import * as MapInfoDifficulty from "../../json/config/map_info_difficulty.json"
import * as NpcHeroesCustom from "../../json/npc_heroes_custom.json"



//营地信息

@reloadable
export class MapChapter {

    CampMapHandle: SpawnGroupHandle;

    ChapterMapHandle: SpawnGroupHandle;

    GameDifficulty : keyof typeof MapInfoDifficulty = "101";

    MapIndex : keyof typeof MapInfo = "m1" ;

    MAP_CAMP = { name: "camp", x: -6144, y: -6144 }

    hero_list : { [key : number] : string} = {}

    // 1 选择地图难度 2选择英雄 3游戏开始了
    _game_select_phase: number = 0; //
    //根据等级可用地图
    _map_list: {
        is_unlock: number,
        user_difficulty: number,
        difficulty_max: number,
        map_index: string,
    }[] = [];
    //玩家已通关的难度
    level_difficulty : string[] = [];
    //玩家可用英雄列表
    player_hero_available : number[][] = [];
    //玩家选择英雄记录
    player_select_hero : MapSelectHeroList[] = [];
    //玩家数量
    player_count : number = 1;


    constructor() {
        print("[MapChapter]:constructor")
        for (let index = 0; index < GameRules.MapChapter.player_count; index++) {
            this.player_hero_available.push([1,2,3]);
            this.player_select_hero.push({
                hero_id : 1,
                state : 0, //是否确认
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
            if(RowData.Enable == 1){
                GameRules.MapChapter.hero_list[RowData.sort] = key;
            }
        }
        
    }

    /** 生成营地 */
    OnCreatedCampMap() {
        if (this.CampMapHandle == null) {
            let vLocation = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 0);
            for (let hHero of HeroList.GetAllHeroes()) {
                let vect = hHero.GetAbsOrigin();
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
                    game_select_phase: this._game_select_phase,
                    select_map: this.MapIndex,
                    select_difficulty: this.GameDifficulty,
                    map_difficulty: this._map_list,
                    level_difficulty : this.level_difficulty,
                }
            }
        );
    }

    //选择游戏难度
    SelectDifficulty(player_id: PlayerID, params: CGED["MapChapter"]["SelectDifficulty"]) {

        if(this._game_select_phase == 0){
            this.GameDifficulty = params.difficulty as keyof typeof MapInfoDifficulty;
            this.MapIndex = MapInfoDifficulty[this.GameDifficulty].map_index as keyof typeof MapInfo;
        }
        CustomGameEventManager.Send_ServerToAllClients(
            "MapChapter_SelectDifficulty",
            {
                data: {
                    game_select_phase: this._game_select_phase,
                    select_map: this.MapIndex,
                    select_difficulty: this.GameDifficulty,
                }
            }
        );
    }

    //确认难度
    SelectDifficultyAffirm(player_id: PlayerID, params: CGED["MapChapter"]["SelectDifficultyAffirm"]) {
        if(this._game_select_phase == 0){
            this._game_select_phase = 1; //修改游戏进程
            //发送选择英雄信息
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                GameRules.MapChapter.GetPlayerHeroList(index , {})
            }
        }
    }
    //获取玩家可用英雄列表
    GetPlayerHeroList(player_id: PlayerID, params: CGED["MapChapter"]["GetPlayerHeroList"]){
        CustomGameEventManager.Send_ServerToPlayer(
            PlayerResource.GetPlayer(player_id),
            "MapChapter_GetPlayerHeroList",
            {
                data: {
                    game_select_phase: this._game_select_phase,
                    hero_id: this.player_hero_available[player_id],
                }
            }
        );
    }
    //获取玩家已选英雄列表
    GetPlayerSelectHeroList(player_id: PlayerID, params: CGED["MapChapter"]["GetPlayerSelectHeroList"]){
        CustomGameEventManager.Send_ServerToAllClients(
            "MapChapter_GetPlayerSelectHeroList",
            {
                data: {
                    game_select_phase: this._game_select_phase,
                    hero_ids: this.player_select_hero,
                }
            }
        );
    }
    //选择英雄
    SelectHero(player_id: PlayerID, params: CGED["MapChapter"]["SelectHero"]) {
        if(this._game_select_phase == 1){
            if(this.player_select_hero[player_id].state == 0){
                let hero_id = params.hero_id
                this.player_select_hero[player_id].hero_id = hero_id;
                GameRules.MapChapter.GetPlayerSelectHeroList(player_id , {})
            }
        }
        
    }
    //确认英雄
    SelectHeroAffirm(player_id: PlayerID, params: CGED["MapChapter"]["SelectHeroAffirm"]) {

        if(this._game_select_phase == 1 && this.player_select_hero[player_id].state == 0){
            this.player_select_hero[player_id].state == 1;
            GameRules.MapChapter.GetPlayerSelectHeroList(player_id , {})
        }

        for (const date of this.player_select_hero) {
            if (date.state != 1) {
                return 
            }
        }

        this._game_select_phase == 2;

        let ChapterData = MapInfo[this.MapIndex];
        
        for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
            let hname = GameRules.MapChapter.hero_list[this.player_select_hero[player_id].hero_id];
            let hHero = PlayerResource.GetSelectedHeroEntity(index)
            PlayerResource.ReplaceHeroWithNoTransfer(
                hHero.GetPlayerOwnerID(),
                hname,
                0,
                0
            );
        }

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
    OnLoadChapterMap(map_index : keyof typeof MapInfo , difficulty :  keyof typeof MapInfoDifficulty) {
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
        for (let hHero of HeroList.GetAllHeroes()) {
            hHero.SetOrigin(vLocation);
        }
        this._game_select_phase == 3
        //开始刷怪
        GameRules.Spawn.Init(ChapterData.map_centre_x, ChapterData.map_centre_y)

        GameRules.GetGameModeEntity().SetContextThink(
            "StartSpawn",
            () => {
                GameRules.Spawn._game_start = true;
                GameRules.Spawn.StartSpawn(1)
                return null;
            },
            5
        );
    }


    OnRemoveChapterMap() {

    }

    
    //返回到营地
    ReturntoCamp() {
        if(GameRules.Spawn._game_start == false){
            this._game_select_phase = 0;
            for (let index = 0 as PlayerID; index < GameRules.MapChapter.player_count; index++) {
                this.player_select_hero[index].state = 0;
            }
            let vLocation = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 0);
            for (let hHero of HeroList.GetAllHeroes()) {
                hHero.SetOrigin(vLocation)
                PlayerResource.ReplaceHeroWithNoTransfer(
                    hHero.GetPlayerOwnerID(),
                    "npc_dota_hero_wisp",
                    0,
                    0
                );
            }
            if (this.ChapterMapHandle) {
                UnloadSpawnGroupByHandle(this.ChapterMapHandle)
                this.ChapterMapHandle = null
            }
        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {

        if (cmd == "-fh") {
            this.ReturntoCamp()
        }
        if (cmd == "-di") {
            let map_index = (args[0] ?? "m1") as keyof typeof MapInfo;
            let difficulty = (args[0] ?? "101") as keyof typeof MapInfoDifficulty;
            this.OnLoadChapterMap(map_index , difficulty)
        }
        if (cmd == "-sh") {
            let hero_index = args[0] ?? "0" ;
            this.SelectHero(player_id , { hero_id : parseInt(hero_index)})
        }
    }
}