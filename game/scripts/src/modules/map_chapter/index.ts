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

    constructor() {
        print("[MapChapter]:constructor")
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
            let vLocation = Vector(GameRules.MapChapter.MAP_CAMP.x, GameRules.MapChapter.MAP_CAMP.y, 0);
            for (let hHero of HeroList.GetAllHeroes()) {
                if(hHero.IsAlive()){
                    hHero.SetRespawnPosition(hHero.GetAbsOrigin());
                    hHero.RespawnHero(false, false);
                }
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
    /**
     * 英雄选择
     */
    SelectHero(index : number){
        let hname = GameRules.MapChapter.hero_list[index];
        let ChapterData = MapInfo[this.MapIndex];
        if (ChapterData == null) { return };
        if (this.ChapterMapHandle) {
            UnloadSpawnGroupByHandle(this.ChapterMapHandle)
            this.ChapterMapHandle = null
        }

        for (let hHero of HeroList.GetAllHeroes()) {
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
            this.SelectHero(parseInt(hero_index))
        }
    }
}