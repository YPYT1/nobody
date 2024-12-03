import { BaseModifier, registerModifier } from "../../utils/dota_ts_adapter";

/** 通用神秘商店效果 */
@registerModifier()
export class modifier_picture_abilities extends BaseModifier {

    GetAttributes(): DOTAModifierAttribute_t {
        return ModifierAttribute.PERMANENT;
    }

    RemoveOnDeath(): boolean {
        return false
    }
    
    OnCreated(params: object): void {
        
    }


}