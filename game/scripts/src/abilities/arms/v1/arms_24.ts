import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 风龙翱翔	"召唤一只持续%summoned_duration%秒的风龙保护召唤者
攻击间隔：1.0
攻击范围：直径600码
风龙特性：攻击时对目标150范围的敌人造成伤害和击退效果。
风龙伤害：%DamageFormula%"
 */
@registerAbility()
export class arms_24 extends BaseArmsAbility {

    splash_radius: number;

    _OnUpdateKeyValue(): void {
        this.splash_radius = 150;
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();
        let summoned_duration = this.GetSpecialValueFor("summoned_duration")
        let vLoc = this.caster.GetAbsOrigin() + RandomVector(200) as Vector;
        let summoned_unit = GameRules.SummonedSystem.CreatedUnit(
            "summoned_wind_dragon",
            vLoc,
            this.caster,
            summoned_duration
        )
        summoned_unit.AddNewModifier(this.caster, this, "modifier_arms_24_summoned", {})

    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        if (target) {
            // 
            let vOrigin = Vector(extraData.x, extraData.y, 0);
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

                enemy.AddNewModifier(this.caster, this, "modifier_knockback_lua", {
                    center_x: extraData.x,
                    center_y: extraData.y,
                    duration: 0.1,
                    knockback_distance: 50,
                    knockback_duration: 0.1
                })
            }

        }
    }

}

@registerModifier()
export class modifier_arms_24 extends BaseArmsModifier {}

@registerModifier()
export class modifier_arms_24_summoned extends BaseModifier {

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
                ExtraData: {
                    x: vParent.x,
                    y: vParent.y,
                }
            })
        }
    }
}
