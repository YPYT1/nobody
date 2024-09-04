import { modifier_basic_move } from "../../../../modifier/modifier_basic";
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

    BasicAbilityDmg: number;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1"
    }

    UpdataAbilityValue(): void {
        this.BasicAbilityDmg = this.caster.custom_attribute_value.BasicAbilityDmg;
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            let attack_damage = extraData.a;
            let SelfAbilityMul = extraData.SelfAbilityMul ?? 100;
            let has_run50buff = this.caster.HasModifier("modifier_drow_5_buff_rune50");
            if (has_run50buff) { attack_damage *= 2 }
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: attack_damage,
                damage_type: DamageTypes.PHYSICAL,
                ability: this,
                element_type: ElementTypes.NONE,
                is_primary: true,

                // 增伤
                SelfAbilityMul: SelfAbilityMul + this.BasicAbilityDmg,
                DamageBonusMul: extraData.DamageBonusMul,
                // DamageBonusMul:0,

            })
        }
    }
}

@registerModifier()
export class modifier_drow_1 extends BaseHeroModifier {

    proj_name: string;
    useProjectile: boolean;
    // base_value: number = 0;
    bonus_value: number = 0;
    give_mana: number;

    proj_width: number;
    proj_speed: number;

    SelfAbilityPow: number;

    move_mdf: modifier_basic_move;

    C_OnCreated(): void {
        this.fakeAttack = false;
        this.useProjectile = true;
        this.SelfAbilityPow = 1;

        this.move_mdf = this.caster.FindModifierByName("modifier_basic_move") as modifier_basic_move;
    }

    UpdataAbilityValue(): void {
        this.SelfAbilityMul = this.ability.GetSpecialValueFor("base_value");
        this.give_mana = this.ability.GetSpecialValueFor("give_mana");
    }

    OnIntervalThink(): void {
        if (this.caster.IsAlive()
            && this.ability.IsActivated()
            && this.ability.IsMeetCastCondition()
        ) {
            let attackrange = this.caster.Script_GetAttackRange() + 64;
            let enemies = FindUnitsInRadius(
                this.team,
                this.caster.GetAbsOrigin(),
                null,
                attackrange,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.FOW_VISIBLE,
                FindOrder.CLOSEST,
                false
            )
            if (enemies.length <= 0) { 
                this.caster.FadeGesture(GameActivity.DOTA_ATTACK);
                this.caster.FadeGesture(GameActivity.DOTA_CAST_ABILITY_1);
                return 
            }
            let hTarget = enemies[0];
            let attack_damage = this.caster.GetAverageTrueAttackDamage(null)
            this.ability.ManaCostAndConverDmgBonus()
            // 清空动作
            
            // this.caster.FadeGesture(GameActivity.DOTA_CAST_ABILITY_1);
            // 判断是否为移动状态

            if (this.caster.move_state) {
                this.caster.FadeGesture(GameActivity.DOTA_CAST_ABILITY_1);
                this.caster.StartGesture(GameActivity.DOTA_CAST_ABILITY_1);
            } else {
                this.caster.FadeGesture(GameActivity.DOTA_ATTACK);
                this.caster.StartGesture(GameActivity.DOTA_ATTACK);
            }


            this.caster.GiveMana(this.give_mana);
            this.PlayPerformAttack(this.caster, hTarget, attack_damage, this.SelfAbilityMul, 0);
            this.PlayAttackStart({ hTarget: hTarget })
            let attack_rate = 1 / this.caster.GetAttacksPerSecond(true);
            this.StartIntervalThink(attack_rate)
        }
    }


    PlayAttackStart(params: PlayEffectProps) { }

    /**
     * 发射箭矢
     * @param hCaster 施法者 
     * @param hTarget 目标
     * @param attack_damage 攻击力 
     * @param SelfAbilityMul 技能伤害乘区
     * @param DamageBonusMul 伤害加成
     * @returns 
     */
    PlayPerformAttack(
        hCaster: CDOTA_BaseNPC,
        hTarget: CDOTA_BaseNPC,
        attack_damage: number,
        SelfAbilityMul: number,
        DamageBonusMul: number,
    ) {
        if (this.fakeAttack) { return }
        // print("this",this.tracking_proj_name)
        ProjectileManager.CreateTrackingProjectile({
            Source: hCaster,
            Target: hTarget,
            Ability: this.GetAbility(),
            EffectName: this.tracking_proj_name,
            iSourceAttachment: ProjectileAttachment.ATTACK_1,
            iMoveSpeed: hCaster.GetProjectileSpeed(),
            ExtraData: {
                a: attack_damage,
                et: this.element_type,
                dt: this.damage_type,
                SelfAbilityMul: SelfAbilityMul,
                DamageBonusMul: DamageBonusMul,
            } as ProjectileExtraData
        })
    }
}