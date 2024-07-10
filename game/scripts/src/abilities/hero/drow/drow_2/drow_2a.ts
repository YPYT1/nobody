import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";

/**
 * 连续射击【目标型】5	"快速射出4支箭，每支箭造成攻击力130%的伤害。
（2/5）：攻击力160%
（3/5）：攻击力190%
（4/5）：攻击力225%
（5/5）：攻击力260%
cd：3秒
蓝量消耗：20
作用范围：750码内敌对单位

连发 1/3"

 */
@registerAbility()
export class drow_2a extends BaseAbility {

    caster: CDOTA_BaseNPC;

    OnUpgrade(): void {
        this.caster = this.GetCaster();
    }

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2a"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                // element_type: ElementTypeEnum.fire,
                is_primary: true,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2a extends BaseModifier {

    caster: CDOTA_BaseNPC;
    team: DotaTeam;
    ability: CDOTABaseAbility;
    damage_mul: number;
    attack_range: number;
    skv_count: number;
    mana_cost: number;
    proj_speed: number;
    proj_width: number;


    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.team = this.caster.GetTeamNumber();
        this.ability = this.GetAbility();
        this.UpdateSpecialValue();
        this.OnIntervalThink()
        this.StartIntervalThink(0.03)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }

        this.UpdateSpecialValue();
    }

    UpdateSpecialValue() {
        this.damage_mul = 130;
        this.skv_count = 4;
        this.attack_range = 750;
        this.proj_speed = 1400;
        this.mana_cost = this.ability.GetManaCost(0)
        this.proj_width = 96;
    }

    OnIntervalThink() {
        if (this.ability.IsCooldownReady() && this.caster.GetMana() >= this.ability.GetManaCost(0)) {
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                this.attack_range,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            if (enemies.length == 0) { return }
            this.ability.UseResources(true, true, true, true)
            let hTarget = enemies[0];
            this.PlayEffect({ hTarget: hTarget })
        }
    }

    PlayEffect(params: PlayEffectProps) {
        let hTarget = params.hTarget;
        let count = 0;
        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * this.damage_mul * 0.01;
        this.caster.SetContextThink("drow_2a_shot", () => {
            let vCaster = this.caster.GetAbsOrigin() + RandomVector(100) as Vector;
            let vDirection = (hTarget.GetAbsOrigin() - vCaster as Vector).Normalized();
            vDirection.z = 0;
            let vVelocity = vDirection * this.proj_speed as Vector;
            ProjectileManager.CreateLinearProjectile({
                EffectName: "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf",
                Ability: this.GetAbility(),
                // vSpawnOrigin: vCaster,
                vVelocity: vVelocity,
                fDistance: this.attack_range,
                fStartRadius: this.proj_width,
                fEndRadius: this.proj_width,
                Source: this.caster,
                vSpawnOrigin: vCaster,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
                iUnitTargetFlags: UnitTargetFlags.NONE,
                ExtraData: {
                    a: ability_damage,
                }
            })
            count += 1;
            if (count >= this.skv_count) {
                return null
            }
            return 0.1
        }, 0)

    }


}
