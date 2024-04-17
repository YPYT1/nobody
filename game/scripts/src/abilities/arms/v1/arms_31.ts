import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 冰霜吐雾	"【冰霜吐雾】：向直径范围1000码最远的敌人进行冰霜吐雾，对一条直线上的敌人造成伤害。并减速50%3秒
cd：4秒
伤害系数：攻击力200%·冰元素伤害
作用范围：1000*200码"

 */
@registerAbility()
export class arms_31 extends BaseArmsAbility {}

@registerModifier()
export class modifier_arms_31 extends BaseArmsModifier { }
