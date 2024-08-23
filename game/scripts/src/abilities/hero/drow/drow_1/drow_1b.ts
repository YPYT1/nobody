import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
5	穿透箭	攻击可以穿透敌人，伤害提高%bonus_value%%%。技能赋予风元素效果，伤害变为风元素伤害。（穿透距离不超过攻击距离）
6	连射	穿透箭攻击时有%lianshe_chance%%%概率再射出一只箭。
 */
@registerAbility()
export class drow_1b extends drow_1 {

    rune_29_chance = 0;
    rune_29_mul = 1;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1b"
    }

    UpdataSpecialValue(): void {
        this.rune_29_chance = GameRules.RuneSystem.GetKvOfUnit(this.caster, "rune_29", 'chance');
        this.rune_29_mul = GameRules.RuneSystem.GetKvOfUnit(this.caster, "rune_29", 'bonus_mul');
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let damage_vect = Vector(extraData.x, extraData.y, 0);
            // rune_29	游侠#4	穿透箭命中时有40%概率造成5倍伤害
            if (RollPercentage(this.rune_29_chance)) {
                ability_damage *= this.rune_29_mul
            }
            ApplyCustomDamage({
                victim: target,
                attacker: this.GetCaster(),
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.WIND,
                is_primary: true,
                damage_vect: damage_vect,
                SelfAbilityMul: extraData.SelfAbilityMul ?? 100,
                DamageBonusMul: extraData.DamageBonusMul ?? 0,
                // bonus_percent: bonus_percent,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_1b extends modifier_drow_1 {

    lianshe_chance: number;
    missile_count: number;
    missile_distance: number;

    UpdataSpecialValue(): void {
        this.proj_width = 90;
        this.fakeAttack = true;
        this.lianshe_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster,  "6", 'lianshe_chance');
        this.missile_count = this.ability.GetTypesAffixValue(1, "Missile", "skv_missile_count");
        this.DamageBonusMul = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster,  "5", "bonus_value");
        this.proj_speed = this.ability.GetTypesAffixValue(this.caster.GetProjectileSpeed(), "Missile", "skv_missile_speed");
        let attackrange = this.caster.Script_GetAttackRange() + 64;
        this.missile_distance = this.ability.GetTypesAffixValue(attackrange, "Missile", "skv_missile_distance");
        // rune_28	游侠#3	穿透箭基础伤害提高200%
        this.SelfAbilityMul += GameRules.RuneSystem.GetKvOfUnit(this.caster, "rune_28", 'base_value');
    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        let vCaster = this.caster.GetAbsOrigin();
        let vTarget = hTarget.GetAbsOrigin();
        let vDirection = (vTarget - vCaster as Vector).Normalized();
        let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        vDirection.z = 0;
        let vVelocity = vDirection * this.proj_speed as Vector;
        let has_run50buff = this.caster.HasModifier("modifier_drow_5_buff_rune50");
        if (has_run50buff) { attack_damage *= 2 }
        // print(this.base_value, this.bonus_value)
        // let bp_ingame = (this.base_value - 100) + this.bonus_value;

        this.LaunchArrows(vCaster, vVelocity, attack_damage);

        if (this.missile_count > 1) {
            for (let i = 0; i < this.missile_count - 1; i++) {
                let vTarget2 = RotatePosition(vCaster, QAngle(0, RandomInt(-30, 30), 0), vTarget);
                let vDirection2 = (vTarget2 - vCaster as Vector).Normalized();
                vDirection2.z = 0;
                let vVelocity2 = vDirection2 * this.proj_speed as Vector;
                this.LaunchArrows(vCaster, vVelocity2, attack_damage);
            }
        }


        if (RollPercentage(this.lianshe_chance)) {
            this.caster.SetContextThink(DoUniqueString("shot"), () => {
                this.LaunchArrows(vCaster, vVelocity, attack_damage);
                return null
            }, 0.3)
        }
    }

    LaunchArrows(vCaster: Vector, vVelocity: Vector, attack_damage: number) {
        ProjectileManager.CreateLinearProjectile({
            EffectName: "particles/econ/items/windrunner/windranger_arcana/windranger_arcana_spell_powershot_combo.vpcf",//G_PorjLinear.wind,
            Ability: this.GetAbility(),
            vSpawnOrigin: vCaster,
            vVelocity: vVelocity,
            fDistance: this.missile_distance,
            fStartRadius: this.proj_width,
            fEndRadius: this.proj_width,
            Source: this.caster,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            ExtraData: {
                a: attack_damage,
                x: vCaster.x,
                y: vCaster.y,
                SelfAbilityMul: this.SelfAbilityMul,
                DamageBonusMul: this.DamageBonusMul,

            } as ProjectileExtraData
        })
        // this.caster.GiveMana(5);
    }
}
