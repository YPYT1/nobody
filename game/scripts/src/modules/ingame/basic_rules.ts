import { reloadable } from "../../utils/tstl-utils";
import { UIEventRegisterClass } from "../class_extends/ui_event_register_class";

/** 游戏基础规则 */
@reloadable
export class BasicRules extends UIEventRegisterClass {

    constructor() {
        super("BasicRules");
    }

    /**
     * 掉落经验,
     * @param vPos 位置 
     * @param iExp 经验值
     */
    // DropExpItem(hCaster: CDOTA_BaseNPC, vPos: Vector, iExp: number) {
    //     let exp_unit = CreateUnitByName("npc_exp", vPos, false, null, null, DotaTeam.GOODGUYS)
    //     EmitSoundOn("Custom.ItemDrop", exp_unit)
    //     exp_unit.SetMaterialGroup(`${RandomInt(0, 2)}`)
    //     exp_unit.AddNewModifier(exp_unit, null, "modifier_generic_arc_lua", {
    //         speed: 250,
    //         distance: 0,
    //         duration: 0.5,
    //         height: 150,
    //         // activity: GameActivity.DOTA_STUN_STATUE,
    //         // isStun: 1,
    //     })
    //     exp_unit.AddNewModifier(exp_unit, null, "modifier_pickitem_exp", {})
    // }

    MoveState(player_id: PlayerID, params: CGED["BasicRules"]["MoveState"]) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let Direction = params.Direction;
        let State = params.State;
        hHero.AddNewModifier(hHero, null, "modifier_basic_move", {
            [Direction]: State
        })
    }
}