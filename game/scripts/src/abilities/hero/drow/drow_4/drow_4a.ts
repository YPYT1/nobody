import { BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 能量回复【增益型】	立即回复60点蓝量。cd：50/40/30秒,无蓝量消耗。
46	源源不断	使用技能《能量恢复》 时，不再是瞬间恢复，而是在%duration%秒内逐渐回复%recover_mana%点蓝量。
47	兼收	使用技能《能量恢复》 时，立即回复%recover_hp_pct%%%最大生命值。

 */
@registerAbility()
export class drow_4a extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_4a"
    }

}

@registerModifier()
export class modifier_drow_4a extends BaseHeroModifier {

    talent_46: boolean;
    recover_mana: number;

    recover_hp_pct: number;
    recover_duration: number;

    UpdataAbilityValue(): void {
        this.recover_mana = this.ability.GetSpecialValueFor("recover_mana")
        this.talent_46 = (this.caster.hero_talent["46"] ?? 0) > 0;
        this.recover_hp_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "47", "recover_hp_pct");
        this.recover_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "46", "duration");
    }

    OnIntervalThink(): void {
        if (this.caster.IsAlive() && this.ability.IsCooldownReady()) {
            this.ability.UseResources(true, true, true, true)
            if (this.talent_46) {
                // 逐渐恢复
                this.caster.AddNewModifier(this.caster, this.ability, "modifier_drow_4a_recover_mana", {
                    duration: this.recover_duration + 0.1
                })
            } else {
                // 立即恢复
                this.caster.GiveMana(this.recover_mana);
                // 回蓝特效

            }

            if (this.recover_hp_pct > 0) {
                // 回血
                let heal_amount = this.caster.GetMaxHealth() * this.recover_hp_pct * 0.01
                this.caster.Heal(heal_amount, this.ability)
            }
        }
    }
}

@registerModifier()
export class modifier_drow_4a_recover_mana extends BaseModifier {

    caster: CDOTA_BaseNPC;
    sec_give_mana: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.OnRefresh(params);

        // 持续回蓝
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        let inter_value = 0.25
        let total_recover_mana = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "46", "recover_mana");
        let duration = this.GetDuration();
        this.sec_give_mana = total_recover_mana / duration * inter_value
        // this.OnIntervalThink()
        this.StartIntervalThink(inter_value)
    }

    OnIntervalThink(): void {
        this.caster.GiveMana(this.sec_give_mana)
    }


}