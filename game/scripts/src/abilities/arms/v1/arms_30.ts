import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 火焰喷吐	"向1000码最远的敌人进行火焰喷吐，对一条直线上的敌人造成伤害。并灼烧目标3秒
cd：4秒
伤害系数：攻击力200%·火元素伤害
作用范围：1000*200码"

 */
@registerAbility()
export class arms_30 extends BaseArmsAbility {}

@registerModifier()
export class modifier_arms_30 extends BaseArmsModifier { }
