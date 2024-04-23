import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 光击阵	"对自身直径范围500码内的敌人召唤柱状造成火焰伤害并眩人2秒。
特效：火女2技能
cd：4秒
伤害系数：攻击力150%·火元素伤害
作用范围：敌人为中心直径250码。"

 */
@registerAbility()
export class arms_64 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();
        let vPoint = this.FindRandomEnemyVect();
        CreateModifierThinker(
            this.caster,
            this,
            "modifier_arms_64_thinker",
            {

            },
            vPoint,
            this.team,
            false
        )
    }
}

@registerModifier()
export class modifier_arms_64 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_64_thinker extends BaseModifier {

    aoe_radius: number;
    ability_damage: number;
    stun_duration: number;
    caster: CDOTA_BaseNPC;

    OnCreated(params: object): void {
        let delay = 0.4;
        this.aoe_radius = this.GetAbility().GetSpecialValueFor("aoe_radius");
        this.stun_duration = this.GetAbility().GetSpecialValueFor("stun_duration");
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.ability_damage = this.GetAbility().ability_damage;
        let FxIndex = ParticleManager.CreateParticleForTeam(
            "particles/units/heroes/hero_lina/lina_spell_light_strike_array_ray_team.vpcf",
            ParticleAttachment.WORLDORIGIN,
            this.GetCaster(),
            this.GetCaster().GetTeamNumber()
        )
        ParticleManager.SetParticleControl(FxIndex, 0, this.GetParent().GetAbsOrigin())
        ParticleManager.SetParticleControl(FxIndex, 1, Vector(this.aoe_radius, 1, 1))
        ParticleManager.ReleaseParticleIndex(FxIndex)

        this.StartIntervalThink(delay)
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            this.GetCaster().GetTeamNumber(),
            this.GetParent().GetAbsOrigin(),
            null,
            this.aoe_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        for (let enemy of enemies) {
            ApplyCustomDamage({
                victim: enemy,
                attacker: this.caster,
                damage: this.ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this.GetAbility(),
                element_type: ElementTypeEnum.fire
            });

            GameRules.BuffManager.AddGeneralDebuff(this.caster, enemy, DebuffTypes.stunned, this.stun_duration)
        }

        let nFXIndex = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_lina/lina_spell_light_strike_array.vpcf",
            ParticleAttachment.WORLDORIGIN,
            null
        )
        ParticleManager.SetParticleControl(nFXIndex, 0, this.GetParent().GetAbsOrigin())
        ParticleManager.SetParticleControl(nFXIndex, 1, Vector(this.aoe_radius, 1, 1))
        ParticleManager.ReleaseParticleIndex(nFXIndex)

        UTIL_Remove(this.GetParent())
    }
}