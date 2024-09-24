import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 连续射击【目标型】5	"快速射出4支箭，每支箭造成攻击力130%的伤害。
cd：3秒
蓝量消耗：20
作用范围：750码内敌对单位
连发 1/3"

 */
@registerAbility()
export class drow_2a extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_2a"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            // let bp_ingame = extraData.bp_ingame;
            // let bp_server = extraData.bp_server;
            let SelfAbilityMul = extraData.SelfAbilityMul;
            let DamageBonusMul = extraData.DamageBonusMul;
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                is_primary: true,
                SelfAbilityMul:SelfAbilityMul,
                DamageBonusMul:DamageBonusMul,
                // bp_ingame: bp_ingame,
                // bp_server: bp_server,
            })
            return true
        }
    }
}

@registerModifier()
export class modifier_drow_2a extends BaseHeroModifier {

    // base_value: number;
    // bonus_value: number = 0;

    action_range: number;
    proj_count: number;
    proj_speed: number;
    proj_width: number;
    proj_name: string;

    UpdataAbilityValue(): void {
        const hAbility = this.GetAbility();
        this.SelfAbilityMul = hAbility.GetSpecialValueFor("base_value");
        this.ElementDmgMul = 0;
        // rune_32	游侠#7	连续射击的基础伤害提高200%
        this.SelfAbilityMul += GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_32', 'base_value')
        this.DamageBonusMul = 0;
        this.proj_count = hAbility.GetSpecialValueForTypes("proj_count", "Targeting", "skv_targeting_count");
        this.proj_speed = hAbility.GetSpecialValueFor("proj_speed");
        this.proj_width = hAbility.GetSpecialValueFor("proj_width");
        this.action_range = this.caster.Script_GetAttackRange();
        this.proj_name = G_PorjLinear.none;
    }


    OnIntervalThink() {
        if (this.CastingConditions()) {
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                this.action_range,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            if (enemies.length == 0) { return }
            let manacost_bonus = this.ability.ManaCostAndConverDmgBonus();
            let hTarget = enemies[0];
            this.DoExecutedAbility()
            this.PlayEffect({ hTarget: hTarget, value: manacost_bonus })
        }
    }

    PlayEffect(params: PlayEffectProps) {
        let hTarget = params.hTarget;
        let vTarget = hTarget.GetAbsOrigin();
        let count = 0;
        let attack_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.caster.SetContextThink("drow_2a_shot", () => {
            // print("proj_width",this.proj_width)
            let vCaster = this.caster.GetAbsOrigin() + RandomVector(100) as Vector;
            let vDirection = (vTarget - vCaster as Vector).Normalized();
            vDirection.z = 0;
            let vVelocity = vDirection * this.proj_speed as Vector;
            ProjectileManager.CreateLinearProjectile({
                EffectName: this.proj_name,
                Ability: this.GetAbility(),
                // vSpawnOrigin: vCaster,
                vVelocity: vVelocity,
                fDistance: this.action_range,
                fStartRadius: this.proj_width,
                fEndRadius: this.proj_width,
                Source: this.caster,
                vSpawnOrigin: vCaster,
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
                iUnitTargetFlags: UnitTargetFlags.NONE,
                ExtraData: {
                    a: attack_damage,
                    x: vCaster.x,
                    y: vCaster.y,
                    SelfAbilityMul: this.SelfAbilityMul,
                    DamageBonusMul: this.DamageBonusMul + params.value,
                    ElementDmgMul: this.ElementDmgMul,
                } as ProjectileExtraData
            })
            count += 1;
            if (count >= this.proj_count) {
                return null
            }
            return 0.1
        }, 0)

    }


}
