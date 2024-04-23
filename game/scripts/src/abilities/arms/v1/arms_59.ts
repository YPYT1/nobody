import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";
import { arms_56 } from "./arms_56";

/**
 * 死魂之挽歌	"英雄死亡时，向直径1000码范围内释放魔能。魔能基础数量为10个。

伤害系数：每道魔能攻击力150%·暗元素伤害
作用范围：自身为中心，直径1000码"

 */
@registerAbility()
export class arms_59 extends arms_56 {}

@registerModifier()
export class modifier_arms_59 extends BaseArmsModifier { }
