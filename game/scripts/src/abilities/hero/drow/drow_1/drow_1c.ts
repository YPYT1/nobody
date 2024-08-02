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

    OnProjectileHit_ExtraData(target: CDOTA_BaseNPC | undefined, location: Vector, extraData: any): boolean | void {
        if (target) {
            this.caster.GiveMana(this.add_mana)
            let ability_damage: number = extraData.a;
            let element_type = extraData.et;
            let damage_type = extraData.dt;
            ApplyCustomDamage({
                victim: target,
                attacker: this.caster,
                damage: ability_damage,
                damage_type: damage_type,
                ability: this,
                element_type: element_type,
                is_primary:true,
            })
        }
    }
}

@registerModifier()
export class modifier_drow_1c extends modifier_drow_1 {

    /** 分裂箭 */
    targes: number;

    UpdataSpecialValue(): void {
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
        // let ability_damage = math.floor(this.caster.GetAverageTrueAttackDamage(null) * (1 + this.bonus_value * 0.01))
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
        let count = 0;
        for (let enemy of enemies) {
            if (enemy != hTarget) {
                count += 1;
                this.PlayPerformAttack(this.caster, enemy, this.ability_damage)
            }
            if (count >= this.targes) {
                break
            }
        }
    }

    // PlayPerformAttack(hCaster: CDOTA_BaseNPC, hTarget: CDOTA_BaseNPC, fakeAttack: boolean = false) {
    //     if (fakeAttack) { return }
    //     ProjectileManager.CreateTrackingProjectile({
    //         Source: hCaster,
    //         Target: hTarget,
    //         Ability: this.GetAbility(),
    //         EffectName: this.tracking_proj_name,
    //         iSourceAttachment: ProjectileAttachment.HITLOCATION,
    //         vSourceLoc: hCaster.GetAbsOrigin(),
    //         iMoveSpeed: hCaster.GetProjectileSpeed(),
    //         ExtraData: {
    //             attack: 1,

    //         }
    //     })
    // }

    // GetModifierProcAttack_Feedback(event: ModifierAttackEvent): number {
    //     if (this.talent_10 > 0) {
    //         // 额外回蓝
    //         this.caster.GiveMana(2);
    //     }
    //     // 寒冰箭150 / 300
    //     if (this.talent_9 > 0) {
    //         ApplyCustomDamage({
    //             victim: event.target,
    //             attacker: this.GetCaster(),
    //             damage: this.ability_damage,
    //             damage_type: DamageTypes.MAGICAL,
    //             ability: this.ability,
    //             element_type: ElementTypes.ICE
    //         })
    //         return -1 * event.original_damage
    //     }
    //     return 0
    // }

    // GetModifierProjectileName(): string {
    //     return "particles/econ/items/drow/drow_arcana/drow_arcana_frost_arrow.vpcf"
    // }
}