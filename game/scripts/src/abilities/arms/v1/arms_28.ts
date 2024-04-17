import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 圣龙裁决	
 * "召唤一只不可选取的圣龙,持续%summoned_duration%秒。每次攻击回复英雄1%最大生命值。
 * 对目标造成500范围的aoe伤害。会直接获取被圣龙击杀的敌人的经验球。
攻击间隔：1.0
攻击范围：%summ_attackrange%
攻击伤害：%DamageFormula%"
 */
@registerAbility()
export class arms_28 extends BaseArmsAbility {

    splash_radius: number;

    _OnUpdateKeyValue(): void {
        this.splash_radius = this.GetSpecialValueFor("splash_radius");
        this.ArmsAdd()
    }

    ArmsEffectStart(): void {
        this.ability_damage = this.GetAbilityDamage();
        let summoned_duration = this.GetSpecialValueFor("summoned_duration")
        let vLoc = this.caster.GetAbsOrigin() + RandomVector(200) as Vector;
        let summoned_unit = GameRules.SummonedSystem.CreatedUnit(
            "summoned_light_dragon",
            vLoc,
            this.caster,
            summoned_duration
        )
        summoned_unit.AddNewModifier(this.caster, this, "modifier_arms_28_summoned", {})

    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        if (target) {
            let enemies = FindUnitsInRadius(
                DotaTeam.GOODGUYS,
                location,
                null,
                this.splash_radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            )
            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: this.ability_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this,
                    element_type: this.element_type,
                })
            }

        }
    }
}

@registerModifier()
export class modifier_arms_28 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_28_summoned extends BaseModifier {

    parent: CDOTA_BaseNPC;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.parent = this.GetParent();
        this.StartIntervalThink(1)
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.INVULNERABLE]: true,
            [ModifierState.UNSELECTABLE]: true,
        }
    }

    OnIntervalThink(): void {
        let vParent = this.parent.GetAbsOrigin()
        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            vParent,
            null,
            600,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        if (enemies.length > 0) {
            // 回血
            let target = enemies[0];
            this.parent.StartGesture(GameActivity.DOTA_ATTACK)
            ProjectileManager.CreateTrackingProjectile({
                Source: this.parent,
                Target: enemies[0],
                Ability: this.GetAbility(),
                EffectName: "particles/units/heroes/hero_puck/puck_base_attack.vpcf",
                iSourceAttachment: ProjectileAttachment.ATTACK_1,
                // vSourceLoc: this.parent.GetAbsOrigin(),
                iMoveSpeed: 1200,
            })
        }
    }
}
