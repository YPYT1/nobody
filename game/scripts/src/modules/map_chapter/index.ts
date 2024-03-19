import { reloadable } from "../../utils/tstl-utils";

@reloadable
export class MapChapter {

    MapGroupHandle: SpawnGroupHandle

    constructor() {
        print("[MapChapter]:constructor")
    }

    InitChapterMap() {
        print("InitChapterMap")
        let current_map = GetMapName();
        if (current_map != "main") { return }
        this.MapGroupHandle = DOTA_SpawnMapAtPosition(
            "chapter_1",
            Vector(0, 0, -128),
            true,
            this.OnRoomReadyToSpawn,
            this.OnSpawnRoomComplete,
            this
        );
    }

    OnRoomReadyToSpawn(spawnGroupHandle: SpawnGroupHandle) {
        print("OnRoomReadyToSpawn", spawnGroupHandle);
    }

    OnSpawnRoomComplete(spawnGroupHandle: SpawnGroupHandle) {
        print("OnSpawnRoomComplete", spawnGroupHandle);
        GameRules.GetGameModeEntity().SetFogOfWarDisabled(true);
        for (let hHero of HeroList.GetAllHeroes()) {
            let vect = hHero.GetAbsOrigin();
            vect.z += 128;
            hHero.SetOrigin(vect)
        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID) {

        if (cmd == "-removemap") {
            print("remove map")

            UnloadSpawnGroupByHandle(this.MapGroupHandle)
        }
    }
}