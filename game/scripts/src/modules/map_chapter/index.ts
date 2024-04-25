import { reloadable } from "../../utils/tstl-utils";

const CHAPTER_MAP_LIST = {
    "1": { name: "wuren", x: -11008, y: 12000 },
    "2": { name: "wuren", x: 0, y: 12000 },
    "3": { name: "wuren", x: 11008, y: 12000 },
}

@reloadable
export class MapChapter {

    CampMapHandle: SpawnGroupHandle;
    // MapGroupHandle: SpawnGroupHandle
    ChapterMapHandle: SpawnGroupHandle

    constructor() {
        print("[MapChapter]:constructor")
    }

    InitChapterMap() {
        print("InitChapterMap")
        let current_map = GetMapName();
        if (current_map != "main") { return }
        // this.MapGroupHandle = DOTA_SpawnMapAtPosition(
        //     "camp",
        //     Vector(0, -64 * 64, 0),
        //     true,
        //     this.OnRoomReadyToSpawn,
        //     this.OnSpawnRoomComplete,
        //     this
        // );
    }

    OnRoomReadyToSpawn(spawnGroupHandle: SpawnGroupHandle) {
        print("OnRoomReadyToSpawn", spawnGroupHandle);
        ManuallyTriggerSpawnGroupCompletion(spawnGroupHandle)
    }

    OnSpawnRoomComplete(spawnGroupHandle: SpawnGroupHandle) {
        print("OnSpawnRoomComplete", spawnGroupHandle);
        // GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        for (let hHero of HeroList.GetAllHeroes()) {
            let vect = hHero.GetAbsOrigin();
            vect.z += 128;
            hHero.SetOrigin(vect)
        }
    }


    OnLoadChapterMap(chapter: keyof typeof CHAPTER_MAP_LIST) {
        let ChapterData = CHAPTER_MAP_LIST[chapter]
        if (ChapterData == null) { return };
        if (this.ChapterMapHandle) {
            UnloadSpawnGroupByHandle(this.ChapterMapHandle)
            this.ChapterMapHandle = null
        }
        let vLocation = Vector(6144, 6144, 0);
        for (let hHero of HeroList.GetAllHeroes()) {
            let vect = hHero.GetAbsOrigin();
            hHero.SetOrigin(vLocation)
        }

        this.ChapterMapHandle = DOTA_SpawnMapAtPosition(
            ChapterData.name,
            vLocation,
            false,
            this.OnRoomReadyToSpawn,
            this.OnSpawnRoomComplete,
            this
        );
    }

    OnRemoveChapterMap() {

    }

    /** 生成营地 */
    OnCreatedCampMap() {
        if (this.CampMapHandle == null) {
            let vLocation = Vector(-6144, -6144, 0);
            for (let hHero of HeroList.GetAllHeroes()) {
                let vect = hHero.GetAbsOrigin();
                hHero.SetOrigin(vLocation)
            }
            this.CampMapHandle = DOTA_SpawnMapAtPosition(
                "camp",
                vLocation,
                false,
                this.OnRoomReadyToSpawn,
                this.OnSpawnRoomComplete,
                this
            );

        }

    }

    ReturntoCamp() {
        let vLocation = Vector(-6144, -6144, 0);
        for (let hHero of HeroList.GetAllHeroes()) {
            hHero.SetOrigin(vLocation)
            PlayerResource.ReplaceHeroWithNoTransfer(
                hHero.GetPlayerOwnerID(),
                "npc_dota_hero_wisp",
                0,
                0
            );

        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {
        let arg_1 = (args[0] ?? "1") as keyof typeof CHAPTER_MAP_LIST;
        if (cmd == "-removemap") {
            // print("remove map")
            // UnloadSpawnGroupByHandle(this.CampMapHandle)
            // this.CampMapHandle = null;
        }

        if (cmd == "-r2camp") {
            this.ReturntoCamp()
        }

        if (cmd == "-camp") {
            this.OnCreatedCampMap()
            // ManuallyTriggerSpawnGroupCompletion(this.MapGroupHandle)
            // if (this.MapGroupHandle == null) {
            //     this.MapGroupHandle = DOTA_SpawnMapAtPosition(
            //         "camp",
            //         Vector(0, 0, 0),
            //         true,
            //         this.OnRoomReadyToSpawn,
            //         this.OnSpawnRoomComplete,
            //         this
            //     );
            // } else {
            //     print("已存在营地")
            // }

        }
        if (cmd == "-chapter") {
            this.OnLoadChapterMap(arg_1)
        }
    }
}