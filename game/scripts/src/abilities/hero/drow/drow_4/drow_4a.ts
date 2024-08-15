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
        let recover_mana = this.ability.GetSpecialValueFor("recover_mana")
        this.recover_mana = this.ability.GetTypesAffixValue(recover_mana, "Buff", "skv_buff_increase");
        this.talent_46 = (this.caster.hero_talent["46"] ?? 0) > 0;
        let recover_hp_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "47", "recover_hp_pct");
        this.recover_hp_pct = this.ability.GetTypesAffixValue(recover_hp_pct, "Buff", "skv_buff_increase");
        this.recover_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "46", "duration");
    }

    OnIntervalThink(): void {
        if (this.ability.IsActivated() && this.caster.IsAlive() && this.ability.IsCooldownReady()) {
            this.DoExecutedAbility()
            this.ability.UseResources(true, true, true, true)
            if (this.talent_46) {
                // 逐渐恢复
                this.caster.AddNewModifier(this.caster, this.ability, "modifier_drow_4a_recover_mana", {
                    duration: this.recover_duration + 0.1
                })
            } else {
                // 立即恢复
                // print("this.recover_mana", this.recover_mana)
                this.caster.GiveMana(this.recover_mana);
            }

            if (this.recover_hp_pct > 0) {
                // 回血
                let heal_amount = this.caster.GetMaxHealth() * this.recover_hp_pct * 0.01
                this.caster.Heal(heal_amount, this.ability)
            }
            this.PlayEffect({});
            // rune_48	游侠#23	使用能量回复后，获得35%伤害减免，持续15秒
            if (this.caster.rune_level_index.hasOwnProperty("rune_48")) {
                let dmg_reduction = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_48', 'dmg_reduction')
                let duration = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_48', 'duration');
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, "rune_48_effect", {
                    "DmgReductionPct": {
                        "Base": dmg_reduction
                    }
                }, duration)
            }

            // rune_49	游侠#24	使用能量回复后，获得35% 伤害加成 ，持续15秒
            if (this.caster.rune_level_index.hasOwnProperty("rune_49")) {
                let bonus_ingame = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_49', 'bonus_ingame')
                let duration = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_49', 'duration');
                print("bonus_ingame", bonus_ingame, "duration", duration)
                GameRules.CustomAttribute.SetAttributeInKey(this.caster, 'rune_49_effect', {
                    'DamageBonusMul': {
                        "Base": bonus_ingame
                    }
                }, duration)
            }
        }
    }

    PlayEffect(params: PlayEffectProps): void {
        let cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_keeper_of_the_light/keeper_chakra_magic.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.caster
        )
        ParticleManager.SetParticleControl(cast_fx, 1, this.caster.GetAbsOrigin())
        ParticleManager.ReleaseParticleIndex(cast_fx)
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
        let cast_fx = ParticleManager.CreateParticle(
            "particles/items_fx/healing_clarity.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        this.AddParticle(cast_fx, false, false, -1, false, false)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        let inter_value = 0.25
        let total_recover_mana = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "46", "recover_mana");
        total_recover_mana = this.GetAbility().GetTypesAffixValue(total_recover_mana, "Buff", "skv_buff_increase");
        let duration = this.GetDuration();
        this.sec_give_mana = total_recover_mana / duration * inter_value
        this.StartIntervalThink(inter_value)
    }

    OnIntervalThink(): void {
        this.caster.GiveMana(this.sec_give_mana)
    }


}