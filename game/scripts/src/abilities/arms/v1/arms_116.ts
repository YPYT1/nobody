import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 洗劫	每次攻击窃取%steal_soul%点灵魂，并回复等额生命值。
 */
@registerAbility()
export class arms_116 extends BaseArmsAbility {

    steal_soul: number;

    InitCustomAbilityData(): void {
        this.steal_soul = this.GetSpecialValueFor("steal_soul")
        this.RegisterEvent(["OnAttackStart"])
    }

    OnAttackStart(hTarget: CDOTA_BaseNPC): void {
        GameRules.ResourceSystem.ModifyResource(this.player_id, {
            "Soul": this.steal_soul
        })
        this.caster.Heal(this.steal_soul, this)
    }
}

@registerModifier()
export class modifier_arms_116 extends BaseArmsModifier {

}