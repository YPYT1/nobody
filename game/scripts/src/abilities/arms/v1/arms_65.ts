import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 腾焰	"进入腾焰状态，每释放一次技能提高自身1%伤害增幅，持续18秒。上限50%
cd：10秒"

 */
@registerAbility()
export class arms_65 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        
    }
}

@registerModifier()
export class modifier_arms_65 extends BaseArmsModifier { }
