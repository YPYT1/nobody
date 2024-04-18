import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 断腿增高	降低当前50%的基础攻击力和基础生命值。120秒后自动升级技能，获得150%损失的攻击力及生命值。
 * 注意:未满足条件时移除该技能不会返还降低的属性
 */
@registerAbility()
export class arms_33 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_33 extends BaseArmsModifier {

    timer: number;
    limit_timer: number;
    deduct_ad: number;
    deduct_hp: number;
    income_pct: number;

    IsHidden(): boolean {
        return false
    }

    C_OnCreated(params: any): void {
        let lowering_pct = this.ability.GetSpecialValueFor("lowering_pct") * 0.01;
        this.timer = 0;
        this.income_pct = this.ability.GetSpecialValueFor("income_pct") * 0.01;
        this.limit_timer = this.ability.GetSpecialValueFor("limit_timer");
        this.deduct_ad = this.caster.custom_attribute_table["AttackDamage"]["Base"] * lowering_pct;
        this.deduct_hp = this.caster.custom_attribute_table["HealthPoints"]["Base"] * lowering_pct;

        DeepPrintTable(this.caster.custom_attribute_table)
        print("modifier_arms_33 ", this.deduct_ad, this.deduct_hp, lowering_pct)
        GameRules.CustomAttribute.ModifyAttribute(this.caster, {
            "AttackDamage": {
                "Base": this.deduct_ad
            },
            "HealthPoints": {
                "Base": this.deduct_hp
            }
        })

        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        this.timer += 1;
        this.SetStackCount(this.timer)
        if (this.timer >= this.limit_timer) {
            // 移除该技能
            this.StartIntervalThink(-1);
            GameRules.CustomMechanics.RemoveArmsAbility(this.ability)
        }
    }

    C_OnRemoved(): void {
        const state = this.timer >= this.limit_timer
        if (state) {
            GameRules.CustomAttribute.ModifyAttribute(this.caster, {
                "AttackDamage": {
                    "Base": this.deduct_ad * this.income_pct * -1
                },
                "HealthPoints": {
                    "Base": this.deduct_hp * this.income_pct * -1
                }
            })
        }
    }

}
