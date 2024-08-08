import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { drow_1, modifier_drow_1 } from "./drow_1";

/**
 * 分裂箭【目标型】（1/3）：攻击可以同时命中2个敌人。（2/3）：同时命中3个敌人。（3/3）同时命中5个敌人。
9	冰箭	伤害提高%bonus_value%%%，技能赋予冰元素效果，伤害变为冰元素伤害。
10	积蓄	分裂箭命中时会额外回复%add_mana%点蓝量。

 */
@registerAbility()
export class drow_1c extends drow_1 {

    add_mana: number = 0;

    GetIntrinsicModifierName(): string {
        return "modifier_drow_1c"
    }

    UpdataSpecialValue(): void {
        this.add_mana = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, 'drow_ranger', '10', 'add_mana')
    }

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: ProjectileExtraData): boolean | void {
        if (target) {
            this.caster.GiveMana(this.add_mana)
            let attack_damage = extraData.a;
            let element_type = extraData.et;
            let damage_type = extraData.dt;
            let bp_ingame = extraData.bp_ingame;
            let bp_server = extraData.bp_server;

            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: attack_damage,
                damage_type: damage_type,
                ability: this,
                element_type: element_type,
                is_primary: true,
                bp_ingame: bp_ingame,
                bp_server: bp_server,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_1c extends modifier_drow_1 {

    /** 分裂箭 */
    targes: number;

    UpdataSpecialValue(): void {
        this.fakeAttack = true;
        this.targes = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "8", 'targes');
        this.bonus_value = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "9", "bonus_value");
        if (this.bonus_value > 0) {
            this.element_type = ElementTypes.ICE;
            this.damage_type = DamageTypes.MAGICAL;
            this.tracking_proj_name = G_PorjTrack.ice;
        }

    }

    PlayAttackStart(params: PlayEffectProps): void {
        let hTarget = params.hTarget;
        let targets_chance_list = this.ability.GetTypesAffixSpecialValue("Targeting", "skv_targeting_multiple");
        let bonus_targets = this.ability.GetTypesAffixValue(0, "Targeting", "skv_targeting_count");
        let extra_index = GetRandomListIndex(targets_chance_list);
        if (extra_index != -1) {
            bonus_targets += (extra_index + 1)
        }
        let bp_ingame = (this.base_value - 100) + this.bonus_value;
        let bp_server = this.ability.GetServerSkillEffect("21", bonus_targets);
        let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
        let enemies = FindUnitsInRadius(
            this.team,
            this.caster.GetAbsOrigin(),
            null,
            this.caster.Script_GetAttackRange() + 64,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        )
        this.fakeAttack = false;
        let count = 0;
        this.PlayPerformAttack(this.caster, hTarget, attack_damage, bp_ingame, bp_server)
        for (let enemy of enemies) {
            if (enemy != hTarget) {
                count += 1;
                this.PlayPerformAttack(this.caster, enemy, attack_damage, bp_ingame, bp_server)
            }
            if (count >= this.targes + bonus_targets) {
                break
            }
        }
        this.fakeAttack = true;
    }

}