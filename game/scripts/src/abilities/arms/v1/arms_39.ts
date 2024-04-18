import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 从容不迫	"生命值越高，攻击力越高、移动速度越快。
每拥有1%最大生命值，提升1%攻击力、1%移动速度"

 */
@registerAbility()
export class arms_39 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_39 extends BaseArmsModifier {

    bonus_ad_pct: number;
    bonus_mv_pct: number;

    C_OnCreatedBefore(params: any): void {
        print("C_OnCreatedBefore", IsServer())
        this.bonus_ad_pct = this.ability.GetSpecialValueFor("bonus_ad_pct");
        this.bonus_mv_pct = this.ability.GetSpecialValueFor("bonus_mv_pct");
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.BASEDAMAGEOUTGOING_PERCENTAGE,
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
        ]
    }

    GetModifierBaseDamageOutgoing_Percentage(event: ModifierAttackEvent): number {
        return this.bonus_ad_pct * (this.caster.GetHealthPercent())
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.bonus_mv_pct * (this.caster.GetHealthPercent())
    }

}
