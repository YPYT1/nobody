import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

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

}

@registerModifier()
export class modifier_drow_1 extends BaseHeroModifier {

    fakeAttack: boolean;
    useProjectile: boolean;
    base_value: number;
    give_mana: number;
    ability_damage: number;

    MdfUpdataAbilityValue(): void {
        this.fakeAttack = false;
        this.useProjectile = true;
        this.ability_damage = 0;
        this.base_value = this.ability.GetSpecialValueFor("base_value");
        this.give_mana = this.ability.GetSpecialValueFor("give_mana");
    }

    OnIntervalThink(): void {
        if (this.caster.AttackReady()) {
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
            this.caster.in_process_attack = true;
            this.caster.GiveMana(this.give_mana);
            this.caster.FadeGesture(GameActivity.DOTA_ATTACK);
            this.caster.StartGesture(GameActivity.DOTA_ATTACK)
            this.caster.PerformAttack(
                hTarget,
                true, // useCastAttackOrb
                true, // processProcs
                false, // skipCooldown
                false, // ignoreInvis
                this.useProjectile, // useProjectile
                this.fakeAttack, // fakeAttack
                false // neverMiss
            );
            this.caster.in_process_attack = false;
            this.PlayAttackStart({ hTarget: hTarget })
        }
    }

    PlayAttackStart(params: PlayEffectProps) { }
    PlayAttackLanded(params: PlayEffectProps) { }
    PlayEffect(params: PlayEffectProps) { }
}