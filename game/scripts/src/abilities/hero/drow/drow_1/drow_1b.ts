import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
5	穿透箭	攻击可以穿透敌人，伤害提高%bonus_value%%%。技能赋予风元素效果，伤害变为风元素伤害。（穿透距离不超过攻击距离）
6	连射	穿透箭攻击时有%lianshe_chance%%%概率再射出一只箭。
 */
@registerAbility()
export class drow_1b extends drow_1 {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1b"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            let ability_damage = extraData.a as number;
            let damage_vect = Vector(extraData.x, extraData.y, 0);
            // print("damage_vect", damage_vect)
            ApplyCustomDamage({
                victim: target,
                attacker: this.GetCaster(),
                damage: ability_damage,
                damage_type: DamageTypes.MAGICAL,
                ability: this,
                element_type: ElementTypes.WIND,
                is_primary: true,
                damage_vect: damage_vect,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_1b extends modifier_drow_1 {

    lianshe_chance: number;

    UpdataSpecialValue(): void {
        this.proj_width = 90;
        this.fakeAttack = true;
        this.lianshe_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "6", 'lianshe_chance')
    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        let proj_speed = this.caster.GetProjectileSpeed();
        let attackrange = this.caster.Script_GetAttackRange() + 64;
        let vCaster = this.caster.GetAbsOrigin();
        let vTarget = hTarget.GetAbsOrigin()
        let vDirection = (vTarget - vCaster as Vector).Normalized();
        let ability_damage = this.caster.GetAverageTrueAttackDamage(null) * (1 + 0.3);
        vDirection.z = 0;
        let vVelocity = vDirection * proj_speed as Vector;

        // this.caster.in_process_attack = false;
        this.LaunchArrows(vCaster, vVelocity, attackrange * 1.3, ability_damage);
        if (RollPercentage(this.lianshe_chance)) {
            this.caster.SetContextThink(DoUniqueString("shot"), () => {
                this.LaunchArrows(vCaster, vVelocity, attackrange, ability_damage);
                return null
            }, 0.15)

        }
    }

    LaunchArrows(vCaster: Vector, vVelocity: Vector, fDistance: number, ability_damage: number) {
        ProjectileManager.CreateLinearProjectile({
            EffectName: "particles/econ/items/windrunner/windranger_arcana/windranger_arcana_spell_powershot_combo.vpcf",//G_PorjLinear.wind,
            Ability: this.GetAbility(),
            vSpawnOrigin: vCaster,
            vVelocity: vVelocity,
            fDistance: fDistance,
            fStartRadius: this.proj_width,
            fEndRadius: this.proj_width,
            Source: this.caster,
            iUnitTargetTeam: UnitTargetTeam.ENEMY,
            iUnitTargetType: UnitTargetType.HERO + UnitTargetType.BASIC,
            iUnitTargetFlags: UnitTargetFlags.NONE,
            ExtraData: {
                a: ability_damage,
                x: vCaster.x,
                y: vCaster.y,
            }
        })
        // this.caster.GiveMana(5);
    }
}
