import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";
import { arms_4 } from "./arms_4";

/**
 * 引燃II	"随机引燃范围直径500码敌人，导致其被火焰吞噬。敌人死亡则随机传递给最近的敌人。

持续时间：6秒
cd：4秒
伤害系数：攻击力150%·火元素伤害·每秒
作用范围：以自身中心直径500码"

 */
@registerAbility()
export class arms_43 extends arms_4 {}

@registerModifier()
export class modifier_arms_43 extends BaseArmsModifier { }
