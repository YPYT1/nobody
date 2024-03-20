import { reloadable } from "../../utils/tstl-utils";



/** 修改技能SV值 */
@reloadable
export class CustomOverrideAbility {

    constructor() {

    }

    /**
     * 初始化该技能的SV值
     * @param ability_entity 
     */
    InitAbilitySpecialValue(ability_entity: EntityIndex) {

    }

    SetSpecialValue(ability_entity: EntityIndex, sKey: string, value: number, sType: AttributeSubKey) {

    }

    ModifySpecialValue() {

    }
}