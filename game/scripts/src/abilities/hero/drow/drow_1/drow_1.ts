import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";
import { modifier_drow_1a } from "./drow_1a";

/**
 * 攻击1名敌人，
造成攻击力100%的伤害，并回复5点蓝量
间隔基于自身攻击速度,
 */
@registerAbility()
export class drow_1 extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1"
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: object): boolean | void {
        if (target) {
            let ability_damage = this.caster.GetAverageTrueAttackDamage(null);
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                element_type: ElementTypes.NONE,
                is_primary: true,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_1 extends BaseHeroModifier {

    proj_name: string;
   		
    fakeAttack: boolean;
    useProjectile: boolean;
    base_value: number = 0;
    bonus_value: number = 0;
    give_mana: number;


    proj_width: number;
    proj_speed: number;

    C_OnCreated(): void {
        this.fakeAttack = false;
        this.useProjectile = true;
    }

    UpdataAbilityValue(): void {
        this.base_value = this.ability.GetSpecialValueFor("base_value");
        this.give_mana = this.ability.GetSpecialValueFor("give_mana");
    }

    OnIntervalThink(): void {
        if (this.caster.IsAlive() && this.ability.IsActivated()) {
            let attackrange = this.caster.Script_GetAttackRange() + 64;
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                attackrange,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.CLOSEST,
                false
            )
            if (enemies.length <= 0) { return }
            let hTarget = enemies[0];
            this.ability_damage = this.caster.GetAverageTrueAttackDamage(null) * (this.base_value + this.bonus_value) * 0.01
            this.caster.in_process_attack = true;
            this.caster.FadeGesture(GameActivity.DOTA_ATTACK);
            this.caster.StartGesture(GameActivity.DOTA_ATTACK);
            this.caster.GiveMana(this.give_mana);
            this.PlayPerformAttack(this.caster, hTarget, this.ability_damage, this.fakeAttack);
            this.PlayAttackStart({ hTarget: hTarget })
            this.caster.in_process_attack = false;
            let attack_rate = 1 / this.caster.GetAttacksPerSecond(true);

            // print("attack_rate", attack_rate)
            this.StartIntervalThink(attack_rate)
        }
    }


    PlayAttackStart(params: PlayEffectProps) {

    }

}