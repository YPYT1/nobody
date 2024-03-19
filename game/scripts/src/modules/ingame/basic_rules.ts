import { reloadable } from "../../utils/tstl-utils";


const test_rules = {
    "A": {
        "A_1": { "A_1_1": {} }
    },
    "B": {
        "B_1": { "B_1_1": {} },
        "B_2": { "B_2_1": {} },
    },
    "C": {
        "C_1": { "C_1_1": {} },
    },
    "D": {
        "D_1": { "D_1_1": {} }
    }
}



/** 游戏基础规则 */
@reloadable
export class BasicRules {

    /**
     * 掉落经验,
     * @param vPos 位置 
     * @param iExp 经验值
     */
    DropExpItem(hCaster: CDOTA_BaseNPC, vPos: Vector, iExp: number) {
        let exp_unit = CreateUnitByName("npc_exp", vPos, false, null, null, DotaTeam.GOODGUYS)
        EmitSoundOn("Custom.ItemDrop", exp_unit)
        exp_unit.SetMaterialGroup(`${RandomInt(0, 2)}`)
        exp_unit.AddNewModifier(exp_unit, null, "modifier_generic_arc_lua", {
            speed: 250,
            distance: 0,
            duration: 0.5,
            height: 150,
            // activity: GameActivity.DOTA_STUN_STATUE,
            // isStun: 1,
        })
        exp_unit.AddNewModifier(exp_unit, null, "modifier_pickitem_exp", {})
    }
}