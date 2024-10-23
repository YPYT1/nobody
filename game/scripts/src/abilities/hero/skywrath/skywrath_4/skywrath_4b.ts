import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 108	盈能模式	"开启状态，技能cd减少50%，蓝量消耗减少50%，持续5/8/12秒。
109	狂暴	盈能模式cd降低15秒。

 */
@registerAbility()
export class skywrath_4b extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_4b"
    }


}
@registerModifier()
export class modifier_skywrath_4b extends BaseHeroModifier {


    duration: number;
    reduce_cd: number = 0;

    UpdataAbilityValue(): void {
        this.reduce_cd = this.caster.GetTalentKv("109", "reduce_cd");
        this.duration = this.caster.GetTalentKv("108", "duration");
    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility();
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_4b_buff", {
                duration: this.duration,
            })
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.COOLDOWN_REDUCTION_CONSTANT
        ]
    }

    GetModifierCooldownReduction_Constant(event: ModifierAbilityEvent): number {
        if (this.GetAbility() == event.ability) {
            return this.reduce_cd
        }
    }
}

@registerModifier()
export class modifier_skywrath_4b_buff extends BaseModifier {

    buff_key = "skywrath_4b_buff";

    cd_value: number;
    mana_value: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.cd_value = this.caster.GetTalentKv("108", "cd_value");
        this.mana_value = this.caster.GetTalentKv("108", "mana_value");
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_omniknight/omniknight_repel_buff.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.caster
        )
        this.AddParticle(effect_fx, false, false, -1, false, false);

        GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.buff_key, {
            "ManaCostRate": {
                "Base": -this.mana_value,
            },
            "AbilityCooldown2": {
                "Base": this.cd_value,
            }
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.caster, this.buff_key)
    }

}