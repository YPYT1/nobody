import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 雷龙展翅	"召唤一只持续%summoned_duration%秒的雷龙保护召唤者
雷龙伤害：%DamageFormula%
攻击间隔：1.0
攻击范围：直径600码
雷龙特性：攻击时对目标直径150码的敌人造成等额范围伤害"

 */
@registerAbility()
export class arms_23 extends BaseArmsAbility {

    splash_radius:number;

    _OnUpdateKeyValue(): void {
        this.splash_radius = this.GetSpecialValueFor("splash_radius");
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();
        let summoned_duration = this.GetSpecialValueFor("summoned_duration")
        let vLoc = this.caster.GetAbsOrigin() + RandomVector(200) as Vector;
        let summoned_unit = GameRules.SummonedSystem.CreatedUnit(
            "summoned_thunder_dragon",
            vLoc,
            this.caster,
            summoned_duration
        )
        summoned_unit.AddNewModifier(this.caster, this, "modifier_arms_23_summoned", {})

    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
        if (target) {
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: this.element_type,
            })
        }
    }
}

@registerModifier()
export class modifier_arms_23 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_23_summoned extends BaseModifier {

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
        let enemies = FindUnitsInRadius(
            DotaTeam.GOODGUYS,
            this.parent.GetAbsOrigin(),
            null,
            600,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        if (enemies.length > 0) {
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

    // OnDestroy(): void {
    //     if (!IsServer()) { return }
    //     UTIL_RemoveImmediate(this.GetParent())
    // }
}