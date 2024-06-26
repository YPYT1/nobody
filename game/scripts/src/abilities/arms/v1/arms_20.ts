import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 小火圈	"生成一个火焰圈围绕在自身周围，对碰
触到的敌人造成伤害。
特效：火猫W的外圈
持续时间：3秒
cd：5秒
伤害系数：攻击力30%·火元素伤害每0.5秒
作用范围：火圈生成在自身直径300码的地方"

 */
@registerAbility()
export class arms_20 extends BaseArmsAbility {

    skv_dot_duration: number;

    InitCustomAbilityData(): void {
        // this.buff_duration = this.GetSpecialValueFor("buff_duration")
        this.RegisterEvent(["OnArmsInterval"])
    }

    UpdataCustomKeyValue(): void {
        this.skv_dot_duration = this.GetSpecialValueFor("skv_dot_duration")
    }
    OnArmsInterval(): void {
        print("this.skv_dot_duration",this.skv_dot_duration)
        this.caster.AddNewModifier(this.caster, this, "modifier_arms_20_buff", {
            duration: this.skv_dot_duration
        })
    }
}

@registerModifier()
export class modifier_arms_20 extends BaseArmsModifier { }


@registerModifier()
export class modifier_arms_20_buff extends BaseModifier {

    skv_ring_range: number;
    skv_ring_width: number;

    team: DotaTeam;
    caster: CDOTA_BaseNPC;
    ability_damage: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        const skv_ring_interval = this.GetAbility().GetSpecialValueFor("skv_ring_interval")
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        this.caster = this.GetCaster();
        this.team = this.GetCaster().GetTeamNumber();
        this.skv_ring_range = this.GetAbility().GetSpecialValueFor("skv_ring_range");
        this.skv_ring_width = this.GetAbility().GetSpecialValueFor("skv_ring_width")


        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_razor/razor_plasmafield.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(9000, this.skv_ring_range, 1))
        this.AddParticle(effect_fx, false, false, -1, false, false);

        this.OnIntervalThink();
        // print("skv_ring_interval",skv_ring_interval)
        this.StartIntervalThink(skv_ring_interval)
    }

    OnIntervalThink(): void {

        let enemies = FindUnitsInRing(
            this.team,
            this.caster.GetAbsOrigin(),
            this.skv_ring_range,
            this.skv_ring_width,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE
        )

        // print("enemies", enemies.length)
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
