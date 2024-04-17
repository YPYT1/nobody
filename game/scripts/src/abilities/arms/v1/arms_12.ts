import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 头狼	自身%check_radius%码范围内每存在一名友军提高自己40攻击力和20点移动速度。"
 */
@registerAbility()
export class arms_12 extends BaseArmsAbility {

    mdf_name = "modifier_arms_12";

    check_radius: number;
    bonus_attackdamage: number;
    bonus_movespeed: number;

    _OnUpdateKeyValue(): void {
        this.bonus_attackdamage = this.GetSpecialValueFor("bonus_attackdamage")
        this.bonus_movespeed = this.GetSpecialValueFor("bonus_movespeed")
        this.check_radius = this.GetSpecialValueFor("check_radius")
        this.ArmsAdd()
    }

    ArmsEffectStart(): void {
        const vPoint = this.caster.GetAbsOrigin();
        const friends = FindUnitsInRadius(
            this.team,
            vPoint,
            null,
            this.check_radius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (friends.length > 1) {
            let count = friends.length - 1;
            GameRules.CustomAttribute.SetAttributeInKey(this.caster, "arms_12", {
                "AttackDamage": {
                    "Fixed": this.bonus_attackdamage * count
                },
                "MoveSpeed": {
                    "Fixed": this.bonus_movespeed * count
                }
            })
        } else {
            GameRules.CustomAttribute.DelAttributeInKey(this.caster, "arms_12")
        }
    }

    _RemoveSelf(): void {
        GameRules.CustomAttribute.DelAttributeInKey(this.caster, "arms_12")
    }
}

@registerModifier()
export class modifier_arms_12 extends BaseArmsModifier {


}