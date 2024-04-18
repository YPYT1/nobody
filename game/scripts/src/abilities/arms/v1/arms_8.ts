import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 雷鸣震击	"向目标400码数个敌人制造出分叉闪电造成伤害。
特效：类似暗影萨满1技能
技能逻辑也类似（仅对同一个方向扇形45°敌人生效）
cd：3秒
伤害系数：攻击力100%·雷元素伤害
作用范围：直径400码，3名敌军"

 */
@registerAbility()
export class arms_8 extends BaseArmsAbility {

    particleName = "particles/units/heroes/hero_shadowshaman/shadowshaman_ether_shock.vpcf";

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_shadowshaman/shadowshaman_ether_shock.vpcf", context);
    }

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        const ability_damage = this.GetAbilityDamage()
        const vPoint = this.caster.GetOrigin();
        const aoe_radius = this.GetSpecialValueFor("aoe_radius")
        let targets = FindUnitsInRadius(
            this.caster.GetTeam(),
            vPoint,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        if (targets.length > 0) {
            let targets_shocked = 0;
            let extra_count = this.GetSpecialValueFor("extra_count");
            let main_target = targets[0];

            let cast_fx = ParticleManager.CreateParticle(
                this.particleName,
                ParticleAttachment.WORLDORIGIN,
                this.caster
            )
            ParticleManager.SetParticleControl(cast_fx, 0, vPoint);
            ParticleManager.SetParticleControl(cast_fx, 1, main_target.GetAbsOrigin());
            ParticleManager.ReleaseParticleIndex(cast_fx);

            ApplyCustomDamage({
                victim: main_target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypeEnum.thunder,
            })

            let enemies = FindUnitsInRadius(
                this.caster.GetTeam(),
                main_target.GetAbsOrigin(),
                null,
                aoe_radius,
                UnitTargetTeam.ENEMY,
                UnitTargetType.BASIC + UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );

            for (let enemy of enemies) {
                if (targets_shocked >= extra_count) { break }
                if (enemy != main_target) {
                    targets_shocked += 1;
                    let cast_fx = ParticleManager.CreateParticle(
                        this.particleName,
                        ParticleAttachment.WORLDORIGIN,
                        this.caster
                    )
                    ParticleManager.SetParticleControl(cast_fx, 0, vPoint);
                    ParticleManager.SetParticleControl(cast_fx, 1, enemy.GetAbsOrigin());
                    ParticleManager.ReleaseParticleIndex(cast_fx);

                    ApplyCustomDamage({
                        victim: enemy,
                        attacker: this.caster,
                        damage: ability_damage,
                        damage_type: DamageTypes.MAGICAL,
                        ability: this,
                        element_type: ElementTypeEnum.thunder,
                    })
                }
            }
        }
    }
}

@registerModifier()
export class modifier_arms_8 extends BaseArmsModifier { }




