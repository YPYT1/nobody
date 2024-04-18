import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 射出%projectile_count%支冰霜箭矢，对命中的敌人造成伤害
伤害公式：%DamageFormula%
 */
@registerAbility()
export class arms_6 extends BaseArmsAbility {

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf", context);
    }

    _OnUpdateKeyValue(): void {
        this.RegisterEvent(["OnArmsStart"])
    }

    OnArmsStart(): void {
        const vPoint = this.caster.GetOrigin();
        const projectile_distance = 800;

        let enemies = FindUnitsInRadius(
            this.caster.GetTeam(),
            vPoint,
            null,
            projectile_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        let target_vect: Vector;
        if (enemies.length > 0) {
            target_vect = enemies[0].GetOrigin();
        } else {
            target_vect = vPoint + this.caster.GetForwardVector() * 100 as Vector;
        }

        CreateModifierThinker(
            this.caster,
            this,
            "modifier_arms_6_multishot",
            {
            },
            target_vect,
            this.caster.GetTeamNumber(),
            false
        );


    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        let thinker = EntIndexToHScript(extraData.thinker) as CDOTA_BaseNPC;
        if (!thinker) { return; }
        let thinker_buff = thinker.FindModifierByName("modifier_arms_6_multishot") as modifier_arms_6_multishot;
        if (!thinker_buff) { return; }
        if (target) {
            return thinker_buff.ApplyCustomDamage(target);
        } else {
            thinker_buff.Destroy();
        }
    }
}

@registerModifier()
export class modifier_arms_6 extends BaseArmsModifier {

}

@registerModifier()
export class modifier_arms_6_multishot extends BaseModifier {

    unit_list: CDOTA_BaseNPC[];
    ability_damage: number;
    EffectName = "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf";

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hAbility = this.GetAbility();
        let projectile_count = hAbility.GetSpecialValueFor("projectile_count");
        let projectile_speed = hAbility.GetSpecialValueFor("projectile_speed");
        let projectile_distance = 800;
        let projectile_width = 80;
        let target_vect = this.GetParent().GetOrigin();
        let caster_vect = this.GetCaster().GetAbsOrigin();
        this.unit_list = []
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        for (let i = 0; i < projectile_count; i++) {
            let is_even = i % 2 == 0; // 偶数
            let angle_y = is_even ? 10 * math.floor(1 + i / 2) - 5 : -10 * math.floor(1 + i / 2) + 5;
            // print("angle_y", angle_y)
            let point = RotatePosition(caster_vect, QAngle(0, angle_y, 0), target_vect);
            let direction = point - this.GetCaster().GetOrigin() as Vector;
            direction.z = 0;
            direction = direction.Normalized();
            ProjectileManager.CreateLinearProjectile({
                // EffectName: "particles/heroes/windrunner/passive_proj.vpcf",
                EffectName: this.EffectName,
                Ability: this.GetAbility(),
                vSpawnOrigin: this.GetCaster().GetOrigin(),
                fStartRadius: projectile_width,
                fEndRadius: projectile_width,
                vVelocity: (direction * projectile_speed) as Vector,
                fDistance: projectile_distance,
                Source: this.GetCaster(),
                iUnitTargetTeam: UnitTargetTeam.ENEMY,
                iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
                iUnitTargetFlags: UnitTargetFlags.NONE,
                ExtraData: {
                    thinker: this.GetParent().entindex()
                }
            });
        }

    }

    ApplyCustomDamage(hTarget: CDOTA_BaseNPC) {
        let damage_factor = 1;
        // if (this.unit_list.indexOf(hTarget) == -1) {
        //     damage_factor *= 0.35
        // } else {
        //     this.unit_list.push(hTarget);
        // }
        // print("damage_factor", damage_factor, this.ability_damage, this.ability_damage * damage_factor);

        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.GetCaster(),
            damage: this.ability_damage * damage_factor,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypeEnum.ice,
        });


        return true
    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        UTIL_Remove(this.GetParent());
    }

}