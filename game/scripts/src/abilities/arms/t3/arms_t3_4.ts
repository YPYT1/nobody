import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 冥想	原地不时，每秒获得%per_soul%点灵魂和%per_exp%点经验值。

 */
@registerAbility()
export class arms_t3_4 extends BaseArmsAbility {

}

@registerModifier()
export class modifier_arms_t3_4 extends BaseArmsModifier {

    per_soul: number;
    per_exp: number;

    last_pos: Vector;
    C_OnCreated(params: any): void {
        this.last_pos = this.caster.GetAbsOrigin();
        this.per_exp = this.ability.GetSpecialValueFor("per_exp");
        this.per_soul = this.ability.GetSpecialValueFor("per_soul");
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        let curr_pos = this.caster.GetAbsOrigin();
        if (curr_pos == this.last_pos) {
            GameRules.ResourceSystem.ModifyResource(this.player_id, {
                "Soul": this.per_soul,
                "SingleExp": this.per_exp,
            })
        }
        this.last_pos = curr_pos
    }
}




