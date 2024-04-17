import { reloadable } from "../../../utils/tstl-utils";

/** 自定义机制 
 * 治疗 伤害 BUFF 
*/
@reloadable
export class CustomMechanics {

    constructor() {

    }

    Heal(hUnit: CDOTA_BaseNPC, iHealth: number, hAbility: CDOTABaseAbility) {
        hUnit.Heal(iHealth, hAbility)
    }
}