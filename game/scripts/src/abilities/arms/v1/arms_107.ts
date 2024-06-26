import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";


/**
 * 感电环绕	"生成一个感应电圈围绕在自身周围，对碰触到的敌人造成伤害。
特效：宙斯雷云的电圈
持续时间：5秒
cd：8秒
伤害系数：攻击力50%·雷元素伤害每0.5秒
作用范围：电圈生成在自身直径450码的地方"

 */
@registerAbility()
export class arms_107 extends BaseArmsAbility {

    // InitCustomAbilityData(): void {
    //     this.buff_duration = this.GetSpecialValueFor("buff_duration")
    //     this.RegisterEvent(["OnArmsInterval"])
    // }

    // OnArmsInterval(): void {
    //     this.caster.AddNewModifier(this.caster, this, "modifier_arms_107_buff", {
    //         duration: this.buff_duration
    //     })
    // }
}

@registerModifier()
export class modifier_arms_107 extends BaseArmsModifier { }

@registerModifier()
export class modifier_arms_107_buff extends BaseModifier {

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
            "particles/custom/arms/arms_107_blot.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(effect_fx, 1, Vector(this.aoe_radius, 1, 1))
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
