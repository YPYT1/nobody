import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 愈战愈勇	"生命值越低，攻击力越高、移动速度越快。
每降低1%最大生命值，提升1%攻击力、1%移动速度"

 */
@registerAbility()
export class arms_ extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_ extends BaseArmsModifier {

    bonus_ad_pct: number;
    bonus_mv_pct: number;

    C_OnCreatedBefore(params: any): void {
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
        return this.bonus_ad_pct * (100 - this.caster.GetHealthPercent())
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.bonus_mv_pct * (100 - this.caster.GetHealthPercent())
    }
    // C_OnCreated(params: any): void {
    //     this.StartIntervalThink(0.5)
    // }

    // OnIntervalThink(): void {
    //     let health_lost_pct = 100 - this.caster.GetHealthPercent();
    // }
}
