import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 增肥II	"每2秒永久增加3生命值。每增加300生命值，增大1%体型。
技能范围根据体型增大。1%体型提高1%技能范围。"
 */
@registerAbility()
export class arms_47 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_47 extends BaseArmsModifier {

    gain_hp: number;
    every_hp_shape: number;

    C_OnCreated(params: any): void {
        this.every_hp_shape = this.ability.GetSpecialValueFor("every_hp_shape");
        this.gain_hp = this.ability.GetSpecialValueFor("gain_hp");
        this.StartIntervalThink(2)
    }

    OnIntervalThink(): void {
        GameRules.CustomAttribute.ModifyAttribute(this.caster, {
            "HealthPoints": {
                "Base": this.gain_hp
            }
        })
    }
}
