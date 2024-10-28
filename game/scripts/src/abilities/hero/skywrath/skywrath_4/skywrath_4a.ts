import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 105	充沛	最大蓝量提升50/70/100点。
106	能量补充	每秒回复蓝量5/10点。
107	聪慧（1/1）	技能释放时每消耗1点蓝量提高该次技能1%的技能强度

 */
@registerAbility()
export class skywrath_4a extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_4a"
    }

}
@registerModifier()
export class modifier_skywrath_4a extends BaseHeroModifier {

    buff_key = "skywrath_4a";
    max_mana: number;
    mana_regen: number;

    UpdataAbilityValue(): void {
        this.max_mana = this.caster.GetTalentKv("105", "value");
        this.mana_regen = this.caster.GetTalentKv("106", "value");

        this.max_mana = this.ability.GetTypesAffixValue(this.max_mana, "Buff", "skv_buff_increase");
        this.mana_regen = this.ability.GetTypesAffixValue(this.mana_regen, "Buff", "skv_buff_increase");
        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            "MaxMana": {
                "Base": this.max_mana,
            },
            "ManaRegen": {
                "Base": this.mana_regen
            }
        })
    }


    OnIntervalThink(): void {
        this.StartIntervalThink(-1);
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.caster, this.buff_key)
    }
}