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

    UpdataAbilityValue(): void {
        // let ability_point = GameRules.NewArmsEvolution.EvolutionPoint[this.player_id]
        // this.ability_bonus_ingame = this.caster.rune_passive_type[""];
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            // let bonus_pct: number = extraData.bp;
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: this.caster.GetAverageTrueAttackDamage(null),
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
        this.base_value = this.ability.GetSpecialValueFor("base_value")
            + (this.caster.custom_attribute_value.BasicAbilityDmg ?? 0);

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
            let attack_damage = this.caster.GetAverageTrueAttackDamage(null)
            this.caster.FadeGesture(GameActivity.DOTA_ATTACK);
            this.caster.StartGesture(GameActivity.DOTA_ATTACK);
            this.caster.GiveMana(this.give_mana);
            this.PlayPerformAttack(this.caster, hTarget, attack_damage, 0, 0);
            this.PlayAttackStart({ hTarget: hTarget })
            let attack_rate = 1 / this.caster.GetAttacksPerSecond(true);
            this.StartIntervalThink(attack_rate)
        }
    }


    PlayAttackStart(params: PlayEffectProps) { }

    PlayPerformAttack(
        hCaster: CDOTA_BaseNPC,
        hTarget: CDOTA_BaseNPC,
        attack_damage: number,
        bp_ingame: number,
        bp_server: number,
    ) {
        if (this.fakeAttack) { return }
        // print("this",this.tracking_proj_name)
        ProjectileManager.CreateTrackingProjectile({
            Source: hCaster,
            Target: hTarget,
            Ability: this.GetAbility(),
            EffectName: this.tracking_proj_name,
            iSourceAttachment: ProjectileAttachment.HITLOCATION,
            vSourceLoc: hCaster.GetAbsOrigin(),
            iMoveSpeed: hCaster.GetProjectileSpeed(),
            ExtraData: {
                a: attack_damage,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
                et: this.element_type,
                dt: this.damage_type,
            } as ProjectileExtraData
        })
    }
}