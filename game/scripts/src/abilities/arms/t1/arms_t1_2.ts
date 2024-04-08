import { registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 增肥	每%arms_cd%秒永久增加%gain_hp%生命值
 */
@registerAbility()
export class arms_t1_2 extends BaseArmsAbility {

    mdf_name = "modifier_arms_t1_2";
    gain_hp: number;

    _OnUpdateKeyValue(): void {
        this.gain_hp = this.GetSpecialValueFor("gain_hp");

        this.ArmsAdd()
    }

    ArmsEffectStart(): void {
        GameRules.CustomAttribute.ModifyAttribute(this.caster, {
            "HealthPoints": {
                "Base": this.gain_hp
            }
        })
    }
}

@registerModifier()
export class modifier_arms_t1_2 extends BaseArmsModifier { }



