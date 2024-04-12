import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 毒瘤	每秒获得当前(英雄等级*%hero_level%)的经验值。%total_sec%秒后自动升级该技能。无法更换、无法升级。
 */
@registerAbility()
export class arms_t1_7 extends BaseArmsAbility { }

@registerModifier()
export class modifier_arms_t1_7 extends BaseArmsModifier {

    hero_level: number;
    total_sec: number;
    count: number;

    IsHidden(): boolean {
        return false
    }

    C_OnCreated(params: any): void {
        this.hero_level = this.ability.GetSpecialValueFor("hero_level")
        this.total_sec = this.ability.GetSpecialValueFor("total_sec")
        this.count = 0;
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {
        if (this.count < this.total_sec) {
            this.count += 1;
            GameRules.ResourceSystem.ModifyResource(this.player_id, {
                "SingleExp": this.caster.GetLevel() * this.hero_level
            })
            this.SetStackCount(this.count);
            if (this.count >= this.total_sec) {
                this.StartIntervalThink(-1)
            }
        }
    }
}

@registerModifier()
export class modifier_arms_t1_7_stack extends BaseModifier {

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }
}