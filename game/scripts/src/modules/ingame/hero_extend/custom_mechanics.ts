import { reloadable } from '../../../utils/tstl-utils';

/** 自定义机制
 * 治疗 伤害 BUFF
 */
@reloadable
export class CustomMechanics {
    constructor() {}

    Heal(hUnit: CDOTA_BaseNPC, iHealth: number, hAbility: CDOTABaseAbility) {
        hUnit.Heal(iHealth, hAbility);
    }

    RemoveArmsAbility(hAbility: CDOTABaseAbility) {
        const hUnit = hAbility.GetCaster();
        for (let i = 0; i < 6; i++) {
            const RowAbility = hUnit.GetAbilityByIndex(i);
            if (RowAbility == hAbility) {
                hAbility.RemoveSelf();
                hUnit.RemoveAbilityByHandle(hAbility);
                if (i < 6) {
                    hUnit.AddAbility('arms_passive_' + i);
                }
            }
        }
    }
}
