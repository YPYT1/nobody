import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 每击杀%every_kills%个敌人，扣除%every_hp%点生命值.同时获得%every_addad%点攻击力。
 * 上限%limit_kills%个敌人。击杀%limit_kills%个敌人之后自动升级。
 */
@registerAbility()
export class arms_t2_7 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_t2_7 extends BaseArmsModifier {

    every_kills: number;
    every_hp: number;
    every_addad: number;
    limit_kills: number;
    current_kills: number;

    IsHidden(): boolean {
        return false
    }

    C_OnCreated(params: any): void {
        this.every_kills = this.ability.GetSpecialValueFor("every_kills");
        this.every_hp = this.ability.GetSpecialValueFor("every_hp");
        this.every_addad = this.ability.GetSpecialValueFor("every_addad");
        this.limit_kills = this.ability.GetSpecialValueFor("limit_kills");
        this.current_kills = 0;
        this.C_RegisterOnKilled();
        // this.RegisterMdfEvent();
    }

    C_OnKilled(hTarget: CDOTA_BaseNPC): void {
        this.current_kills += 1;
        this.SetStackCount(this.current_kills)
        print("modifier_arms_t2_7 OnKilled", this.current_kills)
        if (this.current_kills % this.every_kills == 0) {
            GameRules.CustomAttribute.ModifyAttribute(this.caster, {
                "HealthPoints": {
                    "Base": this.every_hp
                },
                "AttackDamage": {
                    "Base": this.every_addad,
                }
            })

            if (this.current_kills >= this.limit_kills) {
                this.C_UnRegisterOnKilled();
                print("FullPower")
            }
        }
    }
}

