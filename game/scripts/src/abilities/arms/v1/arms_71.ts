import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 雷霆锁链	"缠绕目标375范围内所有敌人，持续2秒，并造成伤害。
特效：缚灵索主动
cd：4秒
伤害系数：攻击力200%·雷元素伤害
作用范围：施法距离1100码"

 */
@registerAbility()
export class arms_71 extends BaseArmsAbility {

    root_duration: number;
    aoe_radius:number;
    
    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/items3_fx/gleipnir_root.vpcf", context);
        PrecacheResource("particle", " particles/items3_fx/gleipnir_projectile.vpcf", context);
    }

    _OnUpdateKeyValue(): void {
        this.root_duration = this.GetSpecialValueFor("root_duration")
        this.aoe_radius = this.GetSpecialValueFor("aoe_radius");
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        let vTarget = this.FindRandomEnemyTarget();
        if (vTarget == null) { return }

        ProjectileManager.CreateTrackingProjectile({
            Source: this.caster,
            Target: vTarget,
            Ability: this,
            EffectName: "particles/items3_fx/gleipnir_projectile.vpcf",
            iSourceAttachment: ProjectileAttachment.ATTACK_1,
            iMoveSpeed: 1200,
        })

    }

    OnProjectileHit(target: CDOTA_BaseNPC, location: Vector): boolean | void {
        if (target) {
            let enemies = FindUnitsInRadius(
                this.team,
                location,
                null,
                this.aoe_radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            for (let enemy of enemies) {
                enemy.AddNewModifier(this.caster, this, "modifier_arms_71_root", {
                    duration: this.root_duration
                })
            }
        }
    }
}

@registerModifier()
export class modifier_arms_71 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_71_root extends BaseModifier {

    IsDebuff(): boolean {
        return true
    }
    
    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.ROOTED]: true
        }
    }

    GetEffectName(): string {
        return "particles/items3_fx/gleipnir_root.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.ABSORIGIN_FOLLOW
    }
}
