import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 94	法阵	"以自身为中心召唤法阵，对法阵内敌人造成持续伤害。
cd：30秒
蓝量消耗：50
持续时间：8/9/10/12/15秒
伤害系数：攻击力350%的技能基础伤害·每秒
作用范围：自身半径600码"

 */
@registerAbility()
export class skywrath_3b extends BaseHeroAbility {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_doom_bringer/doom_bringer_doom_aura.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_3b"
    }

    UpdataAbilityValue(): void {
        this.SetCustomAbilityType("Dot", true)
    }
}
@registerModifier()
export class modifier_skywrath_3b extends BaseHeroModifier {

    duration: number;
    fazhen_duration: number;
    aoe_multiple: number;

    UpdataAbilityValue(): void {
        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value");
        let fazhen_duration = this.caster.GetTalentKv("94", "fazhen_duration");
        this.fazhen_duration = this.ability.GetTypesAffixValue(fazhen_duration,"Dot","skv_dot_duration");
        // print("fazhen_duration",fazhen_duration,this.fazhen_duration)
        this.aoe_multiple = this.ability.GetTypesAffixValue(0, "Aoe", "skv_aoe_chance");
    }

    OnIntervalThink(): void {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();

            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_fazhen", {
                duration: this.fazhen_duration,
                manacost_bonus: manacost_bonus,
                is_clone: 0,
            })

            if (this.CheckClone()) {
                this.caster.clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_3b_fazhen", {
                    duration: this.fazhen_duration,
                    manacost_bonus: manacost_bonus,
                    is_clone: 1,
                })
            }
        }
    }

}

@registerModifier()
export class modifier_skywrath_3b_fazhen extends BaseModifier {

    fazhen_radius: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.GetAbility().SetFrozenCooldown(true)
        this.caster = this.GetCaster();
        this.parent = this.GetParent()
        this.team = this.caster.GetTeam()
        this.is_clone = params.is_clone
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.SelfAbilityMul = this.caster.GetTalentKv("94", "base_value")
        this.fazhen_radius = this.caster.GetTalentKv("94", "fazhen_radius");
        this.manacost_bonus = params.manacost_bonus;
        let effecf_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_doom_bringer/doom_bringer_doom_aura.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.parent
        )
        ParticleManager.SetParticleControl(effecf_fx, 1, Vector(this.fazhen_radius, this.fazhen_radius, this.fazhen_radius))
        this.AddParticle(effecf_fx, false, false, -1, false, false)

        let interval_increase = this.GetAbility().GetTypesAffixValue(0, "Dot", "skv_dot_interval");
        let base_interval = 1
        let dot_interval = base_interval / (1 + interval_increase * 0.01);
        this.OnIntervalThink()
        this.StartIntervalThink(dot_interval)
    }

    OnIntervalThink(): void {
        if (this.GetAbility() == null) {
            this.StartIntervalThink(-1)
            this.Destroy()
            return
        }
        const origin = this.parent.GetAbsOrigin();
        const enemies = FindUnitsInRadius(
            this.team,
            origin,
            null,
            this.fazhen_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HEROES_AND_CREEPS,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.attack_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypes.FIRE,
                is_primary: true,
                // 增伤
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: this.manacost_bonus,
                is_clone: this.is_clone,
            })
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        if (this.GetAbility()) {
            this.GetAbility().SetFrozenCooldown(false)
        }

    }

}