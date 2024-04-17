import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 盾击	"丢出一个盾，围绕英雄一圈后回到手里，
对触碰到的敌人造成单体伤害。
（盾飞行时间：2s）
CD：3秒
伤害系数：护甲值500%·风元素伤害"

 */
@registerAbility()
export class arms_50 extends BaseArmsAbility {

    
}

@registerModifier()
export class modifier_arms_50 extends BaseArmsModifier { }
