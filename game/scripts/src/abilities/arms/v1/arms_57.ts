import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 收割死灵	"每击杀一个敌人，有30%概率收割其灵魂。每一个收割的灵魂增加自身1%攻击力。
上限15个死灵。"

 */
@registerAbility()
export class arms_57 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        // this.RegisterOnKill()
    }

    OnKill(hTarget: CDOTA_BaseNPC): void {
        
    }
}

@registerModifier()
export class modifier_arms_57 extends BaseArmsModifier { }
