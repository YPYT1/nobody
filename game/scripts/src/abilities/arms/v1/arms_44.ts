import { modifier_motion_surround } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";
import { arms_1, modifier_arms_1_summoned, modifier_arms_1_summoned_collision } from "./arms_1";

@registerAbility()
export class arms_44 extends arms_1 {

    ArmsEffectStart(): void {
        if (this.spirit_list.length < this.spirit_limit) {
            let summoned_duration = this.GetSpecialValueFor("summoned_duration");
            let hSpirit = GameRules.SummonedSystem.CreatedUnit(
                "npc_summoned_dummy",
                this.caster.GetAbsOrigin() + Vector(0, 300, 0) as Vector,
                this.caster,
                summoned_duration,
                true
            )
            hSpirit.AddNewModifier(this.caster, this, "modifier_arms_44_summoned", {
                duration: summoned_duration,
                surround_distance: 300,
                surround_qangle: 0,
                surround_speed: 900,
                surround_entity: this.caster.entindex(),
            });
            this.spirit_list.push(hSpirit)
        }
    }

}

@registerModifier()
export class modifier_arms_44 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_44_summoned extends modifier_arms_1_summoned {

    GetModifierAura() { return "modifier_arms_44_summoned_collision"; }

}

@registerModifier()
export class modifier_arms_44_summoned_collision extends modifier_arms_1_summoned_collision { }