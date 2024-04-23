import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 大火圈	"生成一个火焰圈围绕在自身周围，对碰
触到的敌人造成伤害，并灼烧敌人3秒。
特效：火猫W的外圈
持续时间：5秒
cd：8秒
伤害系数：攻击力50%·火元素伤害每0.5秒
作用范围：火圈生成在自身直径500码的地方"

 */
@registerAbility()
export class arms_74 extends BaseArmsAbility {

    _OnUpdateKeyValue(): void {
        this.buff_duration = this.GetSpecialValueFor("buff_duration")
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        this.caster.AddNewModifier(this.caster, this, "modifier_arms_74_buff", {
            duration: this.buff_duration
        })
    }

}

@registerModifier()
export class modifier_arms_74 extends BaseArmsModifier { }


@registerModifier()
export class modifier_arms_74_buff extends BaseModifier {

    aoe_radius: number;
    team: DotaTeam;
    caster: CDOTA_BaseNPC;
    ability_damage: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        this.caster = this.GetCaster();
        this.team = this.GetCaster().GetTeamNumber();
        this.aoe_radius = this.GetAbility().GetSpecialValueFor("aoe_radius")
        this.OnIntervalThink()
        this.StartIntervalThink(0.5)

        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_razor/razor_plasmafield.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(9000, this.aoe_radius, 1))
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    OnIntervalThink(): void {
        let enemies = FindUnitsInRadius(
            this.team,
            this.caster.GetAbsOrigin(),
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
                element_type: ElementTypeEnum.thunder
            });
        }
    }
}
