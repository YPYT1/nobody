import { reloadable } from "../../utils/tstl-utils";


/** 启动之后圣坛延迟 */
const ALTAR_START_DELAY = 1;
/** 圣坛功能 */

@reloadable
export class Altar {

    altar_index_list: number[];
    altar_index: number;
    altar_npc: CDOTA_BaseNPC[] = [];
    altar_radius: number;

    vMapCenter: Vector;

    constructor() {
        print("Init Altar");
        GameRules.Debug.RegisterDebug(this.constructor.name)
        this._Init()
    }

    ReLoad() {
        this._Init();
    }

    _Init() {
        this.altar_radius = 250;
        this.altar_index_list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    }

    /** 设置地图中心和尺寸 */
    SetMapCenter() {
        let ChapterData = GameRules.MapChapter.ChapterData
        this.vMapCenter = Vector(ChapterData.map_centre_x, ChapterData.map_centre_y, 128);
    }

    Start(delay: number) {
        // 开始执行圣坛计时
        this.altar_index = 0;
        GameRules.GetGameModeEntity().SetContextThink("ALTAR_FIRST_START", () => {
            GameRules.Altar.StartAltarProcess()
            return null
        }, delay)

    }

    Stop() {
        GameRules.GetGameModeEntity().SetContextThink("ALTAR_FIRST_START", null, 0)
        GameRules.GetGameModeEntity().SetContextThink("ALTAR_START_DELAY", null, 0)
        for (let altar_npc of this.altar_npc) {
            if (altar_npc || IsValid(altar_npc) == false) {
                UTIL_Remove(altar_npc)
            }
        }
        this.altar_npc = [];
    }

    StartAltarProcess() {
        this.altar_index += 1
        if (this.altar_index == 1) {
            this.CreateAltar()
        } else {
            let altar_delay = RandomInt(1, 10);
            print("wait altar_delay:", altar_delay)
            GameRules.GetGameModeEntity().SetContextThink("ALTAR_START_DELAY", () => {
                GameRules.Altar.CreateAltar();
                return null
            }, altar_delay)
        }

    }

    CreateAltar() {
        let vStart = this.vMapCenter + RandomVector(RandomInt(1500, 2500)) as Vector;
        let altar_npc = CreateUnitByName("npc_altar", vStart, false, null, null, DotaTeam.GOODGUYS);
        let altar_index = this.altar_index_list[RandomInt(0, this.altar_index_list.length - 1)]
        altar_npc.AddNewModifier(altar_npc, null, "modifier_altar_npc", {
            altar_index: altar_index,
            altar_radius: this.altar_radius,
            duration: 60
        })

        let hHero = PlayerResource.GetSelectedHeroEntity(0);
        hHero.RemoveModifierByName("modifier_state_movetips")
        hHero.AddNewModifier(hHero, null, "modifier_state_movetips", {
            duration: 60,
            x: vStart.x,
            y: vStart.y,
            z: vStart.z,
        })
    }

    /** 圣坛存在时间超时 */
    Timeout() {
        // 进入下个等待时间
        this.StartAltarProcess()
    }

    /** 获得圣坛效果 */
    ApplayAltarEffect(altar_index: number, hUnits: CDOTA_BaseNPC[]) {
        // print("ApplayEffect",altar_index,hUnits.length)
        for (let hHero of hUnits) {
            hHero.AddNewModifier(hHero, null, "modifier_altar_effect_" + altar_index, {
                duration: 15,
            })
        }
        this.StartAltarProcess()
    }

    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if (cmd == '-altar') {
            this.altar_index = 1;
            this.CreateAltar();
        }

        if (cmd == "-apa") {
            let altar_index = tonumber(args[0] ?? "1");
            for (let hHero of HeroList.GetAllHeroes()) {
                hHero.RemoveModifierByName("modifier_altar_effect_" + altar_index)
                hHero.AddNewModifier(hHero, null, "modifier_altar_effect_" + altar_index, {
                    duration: 15,
                })
            }
        }
    }
}