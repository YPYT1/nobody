import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 褪生	"英雄阵亡时，化作灵体形态。灵体状态
下移速提升100%，不可攻击，无视碰撞体积。
5秒后复活。
cd：30秒
特性：灵体状态是无敌状态。不扣除复活次数，但算作正常死亡"
 */
@registerAbility()
export class arms_41 extends BaseArmsAbility {


}

@registerModifier()
export class modifier_arms_41 extends BaseArmsModifier { }
