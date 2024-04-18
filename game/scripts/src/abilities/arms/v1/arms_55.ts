import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 生命吸取	"吸取%search_radius%码范围内至多5名敌人的生命值并补充自己，补充收益仅有20%。
特效：骨法大招（金、红色）
持续3秒，cd：6秒
伤害系数：每秒攻击力100%·光元素伤害"

"
 */
@registerAbility()
export class arms_55 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.ability_damage = this.GetAbilityDamage();

        let vPoint = this.caster.GetAbsOrigin();
        let origin_radius = this.GetSpecialValueFor("origin_radius");
        let extra_count = this.GetSpecialValueFor("extra_count");
        let debuff_duration = this.GetSpecialValueFor("debuff_duration");
        let count = 0;

        let enemies = FindUnitsInRadius(
            this.team,
            vPoint,
            null,
            origin_radius,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        for (let enemy of enemies) {
            if (count < extra_count) {
                count += 1;
                enemy.AddNewModifier(this.caster, this, "modifier_arms_55_life_drain", {
                    duration: debuff_duration
                })
            } else {
                break
            }
        }
    }
}

@registerModifier()
export class modifier_arms_55 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_55_life_drain extends BaseModifier {

    cast_fx: ParticleID;
    ability_damage: number;

    IsHidden(): boolean { return true }
    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.ability_damage = this.GetAbility().ability_damage;
        this.cast_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_pugna/pugna_life_drain.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetCaster()
        );
        ParticleManager.SetParticleControlEnt(
            this.cast_fx,
            1,
            this.GetParent(),
            ParticleAttachment.POINT_FOLLOW,
            "attach_hitloc",
            Vector(0, 0, 0),
            true
        )
        ParticleManager.SetParticleControl(this.cast_fx, 60, Vector(255, 197, 90));
        ParticleManager.SetParticleControl(this.cast_fx, 61, Vector(1, 0, 0));

        this.OnIntervalThink()
        this.StartIntervalThink(1)
    }

    OnIntervalThink(): void {

    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        ParticleManager.DestroyParticle(this.cast_fx, true)
    }

}