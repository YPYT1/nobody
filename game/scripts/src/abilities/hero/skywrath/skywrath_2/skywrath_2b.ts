import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * "2技能可选技能：
雷电屏障（5/5）"	"生成一次抵挡3次伤害的屏障，受到攻击时会对攻击者造成高额伤害。
伤害系数：攻击力120%/140%/160%/180%/240%·雷元素的技能基础伤害
cd：12秒
持续时间:8秒
蓝量消耗：30"

 */
@registerAbility()
export class skywrath_2b extends BaseHeroAbility {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_antimage/antimage_spellshield.vpcf", context)
        precacheResString("particles/units/heroes/hero_antimage/antimage_counter.vpcf", context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2b"
    }

    UpdataAbilityValue(): void {
        // this.SetCustomAbilityType("Ring",true)
    }
}
@registerModifier()
export class modifier_skywrath_2b extends BaseHeroModifier {

    duration: number;

    UpdataAbilityValue(): void {
        this.duration = this.GetAbility().GetSpecialValueFor("duration")
    }

    OnIntervalThink() {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_shield", {
                duration: this.duration,
                manacost_bonus: manacost_bonus,
            })
        }
    }
}

/** 雷电屏障 */
@registerModifier()
export class modifier_skywrath_2b_shield extends BaseModifier {

    ability_damage: number;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        let hit_count = 3;
        this.caster = this.GetCaster()
        this.ability_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.manacost_bonus = params.manacost_bonus;
        this.damage_type = DamageTypes.MAGICAL;
        this.element_type = ElementTypes.THUNDER;

        this.SetStackCount(hit_count);
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_antimage/antimage_counter.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControlEnt(
            effect_fx, 0,
            this.GetParent(),
            ParticleAttachment.POINT_FOLLOW, "attach_hitloc", Vector(0, 0, 0), true
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(120, 300, 300))
        this.AddParticle(effect_fx, false, false, -1, false, false)
    }

    /** 技能的Ability更新 */
    UpdataAbilityValue() {
        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value");
        // rune_64	法爷#13	雷电屏障系列的技能基础伤害提高100%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_64","value");
    }
    /** 技能的特殊词条更新 */
    UpdataSpecialValue() {

    }

    _OnHit(hTarget: CDOTA_BaseNPC) {
        this.DecrementStackCount();
        // 反击
        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.GetCaster(),
            damage: this.ability_damage,
            damage_type: this.damage_type,
            ability: this.GetAbility(),
            element_type: this.element_type,
            is_primary: true,
            damage_vect: this.GetParent().GetAbsOrigin(),
            SelfAbilityMul: this.SelfAbilityMul,
            DamageBonusMul: this.manacost_bonus,
        })
    }

    OnStackCountChanged(stackCount: number): void {
        if (!IsServer()) { return }
        let stack = this.GetStackCount();
        if (stack == 0) {
            let effect_fx = ParticleManager.CreateParticle(
                "particles/units/heroes/hero_antimage/antimage_spellshield.vpcf",
                ParticleAttachment.POINT_FOLLOW,
                this.GetParent()
            )
            ParticleManager.SetParticleControlEnt(
                effect_fx, 0,
                this.GetParent(),
                ParticleAttachment.POINT_FOLLOW, "attach_hitloc", Vector(0, 0, 0), true
            )
            ParticleManager.ReleaseParticleIndex(effect_fx)
            this.Destroy()
        }
    }
}