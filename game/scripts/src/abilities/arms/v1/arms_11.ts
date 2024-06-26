import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 增肥	每2秒永久增加2生命值
 */
@registerAbility()
export class arms_11 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_11 extends BaseArmsModifier {

    skv_grow_value: number;

    C_OnCreated(params: any): void {
        let fix_interval = this.ability.GetSpecialValueFor("fix_interval")
        this.StartIntervalThink(fix_interval)
    }

    C_UpdateKeyvalue(): void {
        this.skv_grow_value = this.ability.GetSpecialValueFor("skv_grow_value");
    }

    OnIntervalThink(): void {
        GameRules.CustomAttribute.ModifyAttribute(this.caster, {
            "HealthPoints": {
                "Base": this.skv_grow_value
            }
        })
    }
}
