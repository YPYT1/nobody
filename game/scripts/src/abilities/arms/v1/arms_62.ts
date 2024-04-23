import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 霹雳铁手	"给普通攻击增幅，增加500码攻击距离，同时装配8发加农炮弹，快速发动8次的攻击，对攻击范围内至多3个敌人同时造成伤害。
特效：电炎绝手
cd：5秒
伤害系数：每次攻击造成攻击力50%·火元素伤害
特性：可触发攻击特效（法球）"

 */
@registerAbility()
export class arms_62 extends BaseArmsAbility {}

@registerModifier()
export class modifier_arms_62 extends BaseArmsModifier { }
