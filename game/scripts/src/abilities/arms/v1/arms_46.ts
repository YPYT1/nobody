import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";
import { arms_45 } from "./arms_45";

/**
 * 小火球II	"向直径700码以内随机敌人发射一颗小火，并点燃目标3秒。
球对其造成伤害。
cd：2秒
伤害系数：攻击力250%·火元素伤害"

 */
@registerAbility()
export class arms_46 extends arms_45 {

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
        if (target) {
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.fire
            });
            return true
        }
    }

}

@registerModifier()
export class modifier_arms_46 extends BaseArmsModifier { }
