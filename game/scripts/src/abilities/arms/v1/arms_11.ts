import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 独狼	自身%check_radius%码范围内没有友军存在时，每秒获得%bonus_soul%灵魂和%bonus_exp%经验。
 */
@registerAbility()
export class arms_11 extends BaseArmsAbility {

    check_radius: number;
    bonus_soul: number;
    bonus_exp: number;

    _OnUpdateKeyValue(): void {
        this.bonus_soul = this.GetSpecialValueFor("bonus_soul")
        this.bonus_exp = this.GetSpecialValueFor("bonus_exp")
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
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (friends.length == 1) {
            GameRules.ResourceSystem.ModifyResource(this.player_id, {
                "Soul": this.bonus_soul,
                "SingleExp": this.bonus_exp,
            })
        }
    }
}

@registerModifier()
export class modifier_arms_11 extends BaseArmsModifier {


}