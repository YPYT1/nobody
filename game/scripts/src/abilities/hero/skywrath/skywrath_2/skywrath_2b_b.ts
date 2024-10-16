import { StackModifier } from "../../../../modifier/extends/modifier_stack";
import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { modifier_skywrath_2b, skywrath_2b } from "./skywrath_2b";

/**
 * 79	极寒冰圈	"在自身550码处生成一个寒冰线圈，对触碰到的敌人造成冰元素伤害。
线圈伤害间隔1.0s，提升30%/50%/70%技能基础伤害
80	急冻	冰元素技能减速效果增加 20%/47%
81	冷气	"极寒冰圈伤害敌人时，会追加一层冷气效果，冷气效果上限5/10层。持续5秒
冷气效果：受到冰元素伤害提高 10%。"

 */
@registerAbility()
export class skywrath_2b_b extends skywrath_2b {

    GetIntrinsicModifierName(): string {
        return "modifier_skywrath_2b_b"
    }
}
@registerModifier()
export class modifier_skywrath_2b_b extends modifier_skywrath_2b {

    ring_distance: number;


    UpdataSpecialValue(): void {
        this.duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "79", 'ring_duration');
        this.ring_distance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "79", "ring_distance")
    }

    OnIntervalThink() {
        if (this.CastingConditions()) {
            this.DoExecutedAbility()
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            this.caster.RemoveModifierByName("modifier_skywrath_2b_b_ring");
            this.caster.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_b_ring", {
                duration: this.duration,
                manacost_bonus: manacost_bonus,
                ring_distance: this.ring_distance,
                ring_dmg_key: 0,
            })
        }
    }
}

@registerModifier()
export class modifier_skywrath_2b_b_ring extends BaseModifier {

    manacost_bonus: number;
    ring_distance: number;
    attack_damage: number;
    dmg_interval: number;
    ring_dmg_key: string;

    lq_stack: number;
    lq_duration: number;
    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.dmg_interval = 1;
        this.caster = this.GetCaster()
        this.team = this.caster.GetTeam();
        this.manacost_bonus = params.manacost_bonus;
        this.ring_distance = params.ring_distance;
        this.attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        this.damage_type = DamageTypes.MAGICAL;
        this.element_type = ElementTypes.ICE;
        this.ring_dmg_key = "skywrath_2b_b_" + params.ring_dmg_key;

        this.SelfAbilityMul = this.GetAbility().GetSpecialValueFor("base_value");
        this.SelfAbilityMul += GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "79", "bonus_base");


        this.lq_stack = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "81", 'lq_stack');
        this.lq_duration = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "81", 'lq_duration');
        let ring_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_razor/razor_plasmafield.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(ring_fx, 1, Vector(9000, this.ring_distance, 1))
        this.AddParticle(ring_fx, false, false, -1, false, false);
        this.StartIntervalThink(0.1)
    }

    _OnCreated(params: any) {

    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRing(
            this.team,
            this.caster.GetAbsOrigin(),
            this.ring_distance,
            32,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.FOW_VISIBLE
        )
        for (let enemy of enemies) {
            if (enemy.SpecialMark[this.ring_dmg_key] == null || enemy.SpecialMark[this.ring_dmg_key] < GameRules.GetDOTATime(false, false)) {
                enemy.SpecialMark[this.ring_dmg_key] = GameRules.GetDOTATime(false, false) + this.dmg_interval;

                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: this.attack_damage,
                    damage_type: this.damage_type,
                    ability: this.GetAbility(),
                    element_type: this.element_type,
                    is_primary: true,
                    damage_vect: this.GetParent().GetAbsOrigin(),
                    SelfAbilityMul: this.SelfAbilityMul,
                    DamageBonusMul: this.manacost_bonus,
                })

                if (this.lq_stack > 0) {
                    enemy.AddNewModifier(this.caster, this.GetAbility(), "modifier_skywrath_2b_b_stack", {
                        max_stack: this.lq_stack,
                        duration: this.lq_duration,
                    })
                }
            }

        }
    }

}

@registerModifier()
export class modifier_skywrath_2b_b_stack extends StackModifier {

    buff_key = "skywrath_2b_b_stack";

    IsHidden(): boolean {
        return true
    }

    OnStackCountChanged(stackCount: number): void {
        if (!IsServer()) { return }
        let stack = this.GetStackCount();
        let lq_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "81", 'lq_value');
        GameRules.EnemyAttribute.SetAttributeInKey(this.parent, this.buff_key, {
            "IceDamageIncome": {
                "Base": stack * lq_value
            }
        })
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.EnemyAttribute.DelAttributeInKey(this.parent, this.buff_key)
    }
}