import { modifier_motion_surround } from "../../../modifier/modifier_motion";
import { BaseModifier, registerAbility, registerModifier } from "../../../utils/dota_ts_adapter";
import { BaseArmsAbility, BaseArmsModifier } from "../base_arms_ability";

/**
 * 向敌人射出%projectile_count%支强力的箭矢，每支箭矢穿透一名敌人伤害就会减少%dmg_reduction%%。

伤害公式：%DamageFormula%
 */
@registerAbility()
export class arms_5 extends BaseArmsAbility {

    mdf_name = "modifier_arms_5";

    Precache(context: CScriptPrecacheContext): void {
        PrecacheResource("particle", "particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf", context);
    }

    _OnUpdateKeyValue(): void {
        this.ArmsAdd();
    }
    
    ArmsEffectStart(): void {
        // print("ArmsEffectStart")
        const vPoint = this.caster.GetOrigin();
        const projectile_distance = 600;

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
            "modifier_arms_5_powershot",
            {
            },
            target_vect,
            this.caster.GetTeamNumber(),
            false
        );

        let extra_count = math.min(12, this.GetSpecialValueFor("projectile_count") - 1);
        // print("extra_count",extra_count)
        if (extra_count > 0) {
            for (let i = 0; i < extra_count; i++) {
                let is_even = i % 2 == 0; // 偶数
                let angle_y = is_even ? 20 * math.floor(1 + i / 2) : -20 * math.floor(1 + i / 2);
                // print(i, is_even, angle_y);
                let point = RotatePosition(vPoint, QAngle(0, angle_y, 0), target_vect);
                CreateModifierThinker(
                    this.caster,
                    this,
                    "modifier_arms_5_powershot",
                    {
                        duration: 2
                    },
                    point,
                    this.caster.GetTeamNumber(),
                    false
                );

            }
        }
        // 
    }



    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC, location: Vector, extraData: any): boolean | void {
        let thinker = EntIndexToHScript(extraData.thinker) as CDOTA_BaseNPC;
        if (!thinker) { return; }
        let thinker_buff = thinker.FindModifierByName("modifier_arms_5_powershot") as modifier_arms_5_powershot;
        if (!thinker_buff) { return; }
        if (target) {
            return thinker_buff.ApplyCustomDamage(target);
        } else {
            thinker_buff.Destroy();
        }
    }

}

@registerModifier()
export class modifier_arms_5 extends BaseArmsModifier { }



@registerModifier()
export class modifier_arms_5_powershot extends BaseModifier {

    damage_factor: number;
    ability_damage: number;
    dmg_reduction: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hAbility = this.GetAbility();
        this.damage_factor = 1;
        this.dmg_reduction = hAbility.GetSpecialValueFor("dmg_reduction") * 0.01;
        this.ability_damage = this.GetAbility().GetAbilityDamage();
        let proj_radius = 150;
        let EffectName = "particles/units/heroes/hero_windrunner/windrunner_spell_powershot.vpcf";
        let target_vect = this.GetParent().GetOrigin();
        let speed = 1800;
        let direction = target_vect - this.GetCaster().GetOrigin() as Vector;
        direction.z = 0;
        direction = direction.Normalized();
        // print((direction * speed),direction)
        let projectile_id = ProjectileManager.CreateLinearProjectile({
            EffectName: EffectName,
            Ability: hAbility,
            vSpawnOrigin: this.GetCaster().GetOrigin(),
            fStartRadius: proj_radius,
            fEndRadius: proj_radius,
            vVelocity: (direction * speed) as Vector,
            fDistance: 1000,
            Source: this.GetCaster(),
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.BASIC + UnitTargetType.HERO,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            ExtraData: {
                thinker: this.GetParent().entindex()
            }
        });
    }

    ApplyCustomDamage(hTarget: CDOTA_BaseNPC) {
        ApplyCustomDamage({
            victim: hTarget,
            attacker: this.GetCaster(),
            damage: this.ability_damage * this.damage_factor,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            // element_type: 0,
        });

        this.damage_factor *= (1 + this.dmg_reduction);
    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        UTIL_Remove(this.GetParent());
    }

}