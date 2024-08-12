import { reloadable } from "../../utils/tstl-utils";
import { UIEventRegisterClass } from "../class_extends/ui_event_register_class";

/** 游戏基础规则 */
@reloadable
export class BasicRules extends UIEventRegisterClass {

    constructor() {
        super("BasicRules");
    }

    MoveState(player_id: PlayerID, params: CGED["BasicRules"]["MoveState"]) {
        const hHero = PlayerResource.GetSelectedHeroEntity(player_id);
        let Direction = params.Direction;
        let State = params.State;
        hHero.AddNewModifier(hHero, null, "modifier_basic_move", {
            [Direction]: State
        })
    }

    /** 治疗触发 */
    Heal(hCaster: CDOTA_BaseNPC, fHealAmount: number, hAbility: CDOTABaseAbility | undefined) {
        hCaster.Heal(fHealAmount, hAbility)
    }
}