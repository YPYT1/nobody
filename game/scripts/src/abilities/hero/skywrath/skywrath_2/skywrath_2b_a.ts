import { StackModifier } from "../../../../modifier/extends/modifier_stack";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_2b, skywrath_2b } from "./skywrath_2b";

/**
 * 76	感电线圈	"在自身700码处生成一个雷电线圈，对触碰到的敌人造成雷元素伤害。
线圈伤害间隔1.0s，额外提升40%/70%/100%的技能基础伤害
77	磁暴	对相同敌人造成的后续伤害，每次递增5%/10%伤害加成 ,无上限
78	控雷	每8/6秒再内圈450码位置再生成一个相同电圈，持续5秒。

 */
@registerAbility()
export class skywrath_2b_a extends skywrath_2b {

    Precache(context: CScriptPrecacheContext): void {
        precacheResString("particles/units/heroes/hero_razor/razor_plasmafield.vpcf", context)
        precacheResString("particles/econ/items/razor/razor_ti6/razor_plasmafield_ti6.vpcf", context)
        precacheResString("particles/custom/hero/skywrath3a/ring_thunder.vpcf",context)
    }

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2b_a"
    }
}
@registerModifier()
export class modifier_skywrath_2b_a extends modifier_skywrath_2b {

    ring_distance: number;

    kl_interval: number;
    kl_ring_distance: number;
    kl_ring_duration: number;
    kl_timer: number = 0;

    UpdataSpecialValue(): void {
        this.duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "76", "ring_duration");
        this.ring_distance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "76", "ring_distance");
        this.kl_interval = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "78", "interval");
        this.kl_ring_distance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "78", "ring_distance");
        this.kl_ring_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "78", "ring_duration");
        // rune_67	法爷#16	控雷生成的电圈将永久存在
        if (this.caster.GetRuneKv("rune_67", "value") > 0 ) {
            this.kl_ring_duration = this.kl_interval + 1;
        }
    }

    OnIntervalThink() {
        if (this.kl_interval > 0) {
            this.kl_timer += 0.1;
            if (this.kl_timer >= this.kl_interval) {
                this.kl_timer = 0;
                this.caster.RemoveModifierByName("modifier_skywrath_2b_a_ring2");
                this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_a_ring2", {
                    duration: this.kl_ring_duration,
                    manacost_bonus: 0,
                    ring_distance: this.kl_ring_distance,
                    ring_dmg_key: 1,
                    is_clone: 0,
                })
                if (this.CheckClone()) {
                    const clone_unit = this.caster.clone_unit;
                    clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_a_ring2", {
                        duration: this.kl_ring_duration,
                        manacost_bonus: 0,
                        ring_distance: this.kl_ring_distance,
                        ring_dmg_key: 1,
                        is_clone: 1,
                    })
                }
            }
        }

        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            this.caster.RemoveModifierByName("modifier_skywrath_2b_a_ring");
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_a_ring", {
                duration: this.duration,
                manacost_bonus: manacost_bonus,
                ring_distance: this.ring_distance,
                ring_dmg_key: 0,
                is_clone: 0,
            })

            if (this.CheckClone()) {
                const clone_unit = this.caster.clone_unit;
                clone_unit.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_a_ring", {
                    duration: this.duration,
                    manacost_bonus: manacost_bonus,
                    ring_distance: this.ring_distance,
                    ring_dmg_key: 0,
                    is_clone: 1,
                })
            }
        }
    }
}

@registerModifier()
export class modifier_skywrath_2b_a_ring extends BaseModifier {

    manacost_bonus: number;
    ring_distance: number;
    attack_damage: number;
    dmg_interval: number;
    ring_dmg_key: string;

    stack_bonus_dmg: number;
    is_clone: number;
    hAbility: skywrath_2b_a;

    ring_d_final: number;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.hAbility = this.GetAbility() as skywrath_2b_a
        this.caster = this.GetCaster()
        this.team = this.caster.GetTeam();
        this.is_clone = params.is_clone;
        this.ring_dmg_key = "2b_a_ring_" + params.ring_dmg_key + this.is_clone;
        this.ring_distance = this.hAbility.GetTypesAffixValue(params.ring_distance, "Ring", "skv_ring_range")
        let ring_fx = ParticleManager.CreateParticle(
            "particles/custom/hero/skywrath3a/ring_thunder.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(ring_fx, 1, Vector(2000, this.ring_distance, 1))
        this.AddParticle(ring_fx, false, false, -1, false, false);
        this.StartIntervalThink(0.1)
        this.OnRefresh(params)
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        this.manacost_bonus = params.manacost_bonus;
        this.ring_distance = this.hAbility.GetTypesAffixValue(params.ring_distance, "Ring", "skv_ring_range")
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        this.damage_type = DamageTypes.MAGICAL;
        this.element_type = ElementTypes.THUNDER;
        this.ring_d_final = this.hAbility.GetTypesAffixValue(0, "Ring", "skv_ring_d_final")
        this.SelfAbilityMul = this.caster.GetTalentKv("75", "base_value")
        this.SelfAbilityMul += this.caster.GetTalentKv("76", "bonus_base")
        // rune_64	法爷#13	雷电屏障系列的技能基础伤害提高100%
        this.SelfAbilityMul += this.caster.GetRuneKv("rune_64", "value")
        this.dmg_interval = 1;
        // rune_65	法爷#14	感电线圈伤害间隔减少50%
        if (this.caster.GetRuneKv("rune_65", "value") > 0) {
            this.dmg_interval = 0.5
        }
        this.dmg_interval = this.dmg_interval * 100 / (100 + this.hAbility.GetTypesAffixValue(0, "Ring", "skv_ring_interval"))
        this.stack_bonus_dmg = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "77", "stack_bonus_dmg");
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRing(
            this.team,
            this.GetParent().GetAbsOrigin(),
            this.ring_distance,
            32,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.FOW_VISIBLE
        )
        for (let enemy of enemies) {
            if (enemy.SpecialMark[this.ring_dmg_key] == null || enemy.SpecialMark[this.ring_dmg_key] < GameRules.GetDOTATime(false, false)) {
                enemy.SpecialMark[this.ring_dmg_key] = GameRules.GetDOTATime(false, false) + this.dmg_interval;
                let stack = enemy.GetModifierStackCount("modifier_skywrath_2b_a_ring_stack", this.caster);
                let bonus_pct = 0
                if (stack > 0 && this.stack_bonus_dmg > 0) {
                    bonus_pct = this.stack_bonus_dmg * stack;
                }
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: this.attack_damage * (1 + bonus_pct * 0.01),
                    damage_type: this.damage_type,
                    ability: this.GetAbility(),
                    element_type: this.element_type,
                    is_primary: true,
                    damage_vect: this.GetParent().GetAbsOrigin(),
                    SelfAbilityMul: this.SelfAbilityMul,
                    FinalDamageMul: this.ring_d_final,
                    is_clone: this.is_clone,

                })

                if (this.stack_bonus_dmg > 0) {
                    enemy.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_a_ring_stack", {
                        max_stack: 99
                    })
                }
            }

        }
    }

}

@registerModifier()
export class modifier_skywrath_2b_a_ring2 extends modifier_skywrath_2b_a_ring {


}
@registerModifier()
export class modifier_skywrath_2b_a_ring_stack extends StackModifier {

    IsHidden(): boolean {
        return true
    }
}