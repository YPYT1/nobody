import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 自爆	"英雄阵亡时，造成爆炸伤害。

伤害系数：攻击力500%·火元素伤害
作用范围：自身为中心直径500码"

 */
@registerAbility()
export class arms_40 extends BaseArmsAbility {

    OnDeath(): void {
        print("arms_40 OnDeath")
    }
}

@registerModifier()
export class modifier_arms_40 extends BaseArmsModifier { }
