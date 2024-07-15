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

}

@registerModifier()
export class modifier_drow_1 extends BaseHeroModifier {

    proj_name: string;
    /** 投射 */
    porj_track = {
        "none": "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf",
        "fire": "fire",
    }

    /** 线型 */
    porj_linear = {
        "none": "particles/units/heroes/hero_drow/drow_multishot_proj_linear_proj.vpcf",
        "fire": "particles/proj/linear/fire/proj_linear_fire.vpcf",
        "ice": "particles/proj/linear/ice/proj_linear_ice.vpcf",
        "wind": "particles/proj/linear/wind/proj_linear_wind.vpcf",
    }

    fakeAttack: boolean;
    useProjectile: boolean;
    base_value: number;
    give_mana: number;

    aoe_radius: number;
    bonus_value: number;
    mul_chance: number;
    mul_value: number;

    lianshe_chance: number;

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
            this.PlayAttackStart({ hTarget: hTarget })
            this.caster.in_process_attack = false;
        }
    }

    PlayAttackStart(params: PlayEffectProps) {
        this.caster.GiveMana(this.give_mana);
    }

}