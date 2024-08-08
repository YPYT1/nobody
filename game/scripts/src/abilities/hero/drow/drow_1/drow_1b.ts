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

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let ability_damage = extraData.a;
            let bp_ingame = extraData.bp_ingame;
            let bp_server = extraData.bp_server;
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
                bp_ingame: bp_ingame,
                bp_server: bp_server,
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
        this.lianshe_chance = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "6", 'lianshe_chance');
        this.missile_count = this.ability.GetTypesAffixValue(1, "Missile", "skv_missile_count");
        this.bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "5", "bonus_value");
        this.proj_speed = this.ability.GetTypesAffixValue(this.caster.GetProjectileSpeed(), "Missile", "skv_missile_speed");
        let attackrange = this.caster.Script_GetAttackRange() + 64;
        this.missile_distance = this.ability.GetTypesAffixValue(attackrange, "Missile", "skv_missile_distance");
    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        let vCaster = this.caster.GetAbsOrigin();
        let vTarget = hTarget.GetAbsOrigin();
        let vDirection = (vTarget - vCaster as Vector).Normalized();
        let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        vDirection.z = 0;
        let vVelocity = vDirection * this.proj_speed as Vector;

        print(this.base_value, this.bonus_value)
        let bp_ingame = (this.base_value - 100) + this.bonus_value;
        let bp_server = 0;

        this.LaunchArrows(vCaster, vVelocity, attack_damage, bp_ingame, bp_server);

        if (this.missile_count > 1) {
            for (let i = 0; i < this.missile_count - 1; i++) {
                let vTarget2 = RotatePosition(vCaster, QAngle(0, RandomInt(-30, 30), 0), vTarget);
                let vDirection2 = (vTarget2 - vCaster as Vector).Normalized();
                vDirection2.z = 0;
                let vVelocity2 = vDirection2 * this.proj_speed as Vector;
                this.LaunchArrows(vCaster, vVelocity2, attack_damage, bp_ingame, bp_server);
            }
        }


        if (RollPercentage(this.lianshe_chance)) {
            this.caster.SetContextThink(DoUniqueString("shot"), () => {
                this.LaunchArrows(vCaster, vVelocity, attack_damage, bp_ingame, bp_server);
                return null
            }, 0.15)
        }
    }

    LaunchArrows(vCaster: Vector, vVelocity: Vector, attack_damage: number, bp_ingame: number, bp_server: number) {
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
                bp_ingame: bp_ingame,
                bp_server: bp_server,
                x: vCaster.x,
                y: vCaster.y,

            } as ProjectileExtraData
        })
        // this.caster.GiveMana(5);
    }
}
