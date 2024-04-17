import { registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 增肥	每%arms_cd%秒永久增加%gain_hp%生命值
 */
@registerAbility()
export class arms_2 extends BaseArmsAbility {


}

@registerModifier()
export class modifier_arms_2 extends BaseArmsModifier {

    gain_hp: number;

    C_OnCreated(params: any): void {
        this.gain_hp = this.GetSpecialValueFor("gain_hp");
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        GameRules.CustomAttribute.ModifyAttribute(this.caster, {
            "HealthPoints": {
                "Base": this.gain_hp
            }
        })
    }

}



