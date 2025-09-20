import { BaseAbility, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';

@registerAbility()
export class special_blood_mage extends BaseAbility {
    // GetIntrinsicModifierName(): string {
    //     return "modifier_special_blood_mage"
    // }
}

// @registerModifier()
// export class modifier_special_blood_mage extends BaseModifier {

//     // DeclareFunctions(): modifierfunction[] {
//     //     return [
//     //         ModifierFunction.CONVERT_MANA_COST_TO_HEALTH_COST
//     //     ]
//     // }

//     // GetModifierConvertManaCostToHealthCost() {}
// }
