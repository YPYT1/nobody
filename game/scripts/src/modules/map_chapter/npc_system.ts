import { reloadable } from '../../utils/tstl-utils';
import { UIEventRegisterClass } from '../class_extends/ui_event_register_class';


import * as MapInfo from "../../json/config/map_info.json"
import * as Interact from "../../json/units/interact.json"

@reloadable
export class NpcSystem extends UIEventRegisterClass {

    /**
     * npc集合
     */
    npc_collection_list: {
        [name: string]: {
            unit: CDOTA_BaseNPC,
            is_refresh: boolean,
        }
    } = {};

    constructor() {
        super("NpcSystem", true);
        for (let [key, RowData] of pairs(Interact)) {
            if (RowData.is_enable == 1) {
                this.npc_collection_list[key] = {
                    unit: null,
                    is_refresh: false,
                };
            }
        }
    }
    // npc_collection
    /**
     * 创建所有npc
     */
    CreationNpc() {
        let index = 0;
        let ChapterData = MapInfo[GameRules.MapChapter.MapIndex];
        let map_centre_x = ChapterData.map_centre_x;
        let map_centre_y = ChapterData.map_centre_y;
        let vLocation = Vector(ChapterData.map_centre_x + 500, ChapterData.map_centre_y, 256);
        for (const key in this.npc_collection_list) {
            if (this.npc_collection_list[key].is_refresh == false) {
                let InteractNpcData = Interact[key as keyof typeof Interact];
                let overhead_effect = InteractNpcData.overhead_effect;

                let target_Vector = RotatePosition(Vector(map_centre_x, map_centre_y, 0), QAngle(0, 23 * (index + 1), 0), vLocation);
                this.npc_collection_list[key].unit = CreateUnitByName(
                    key,
                    target_Vector,
                    true,
                    null,
                    null,
                    DotaTeam.GOODGUYS
                );
                if (overhead_effect.length > 10) {
                    let effect_fx = ParticleManager.CreateParticle(
                        overhead_effect,
                        ParticleAttachment.OVERHEAD_FOLLOW,
                        this.npc_collection_list[key].unit
                    )
                }
                index++;
                this.npc_collection_list[key].is_refresh = true;
            }
        }
    }
    /**
     * 移除所有npc
     */
    RemoveNPC() {
        for (const key in this.npc_collection_list) {
            if (this.npc_collection_list[key].unit) {
                this.npc_collection_list[key].unit.RemoveSelf();
                this.npc_collection_list[key].unit = null;
                this.npc_collection_list[key].is_refresh = false;
            }
        }
    }

    Debug(cmd: string, args: string[], player_id: PlayerID): void {
        if (cmd == "-npc") {
            this.CreationNpc()
        } else if (cmd == "-dnpc") {
            this.RemoveNPC()
        }
    }

}
