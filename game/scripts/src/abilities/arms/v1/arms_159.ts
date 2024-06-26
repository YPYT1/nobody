import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 冥龙灭世	"召唤一只冥龙。无法被选中。每次攻击损失英雄1%最大生命值，但造成伤害提高25%。
普通攻击变为对地直径500范围的aoe伤害。
冥龙击杀敌人时将获取1~5倍灵魂。

攻击间隔：1.0
攻击范围：%summ_attackrange%
攻击伤害：%DamageFormula%"

 */
@registerAbility()
export class arms_159 extends BaseArmsAbility {}

@registerModifier()
export class modifier_arms_159 extends BaseArmsModifier { }
