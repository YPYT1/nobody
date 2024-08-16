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

    /**
     * 扣除生命
     * @param hCaster 
     * @param fAmount 
     * @param bInjured 
     */
    CostHealth(hCaster: CDOTA_BaseNPC, fAmount: number, bInjured: boolean = false) {
        hCaster.SetHealth(hCaster.GetHealth() - fAmount)
    }


    PickAllExp(hUnit: CDOTA_BaseNPC) {
        let ExpItems = FindUnitsInRadius(
            DotaTeam.NEUTRALS,
            hUnit.GetAbsOrigin(),
            null,
            99999,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.OTHER,
            UnitTargetFlags.INVULNERABLE,
            FindOrder.ANY,
            false
        )
        for (let ExpItem of ExpItems) {
            if (ExpItem.GetUnitName() == "npc_exp") {
                if (!ExpItem.HasModifier("modifier_pick_animation")) {
                    // 无敌状态只能自己给自己上BUFF
                    ExpItem.AddNewModifier(ExpItem, null, "modifier_pick_animation", {
                        picker: hUnit.entindex(),
                    })
                }
            }
        }
    }
}