import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// 属性
@registerAbility()
export class public_creature extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_creature"
    }
}

@registerModifier()
export class modifier_public_creature extends BaseModifier {

    caster: CDOTA_BaseNPC;
    state: boolean;
    attack_damage: number;
    attack_act: GameActivity;
    isboss: boolean;
    bonus_move: number;
    bonus_value: number;

    IsHidden(): boolean {
        return true
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        let gameDifficulty = GameRules.MapChapter.GameDifficultyNumber;
        if (gameDifficulty > 103) {
            this.bonus_value = this.GetParent().IsBossCreature() ? 5 : 2;
        } else {
            this.bonus_value = 0;
        }
        this.bonus_move = 0;
        this.state = true;
        this.StartIntervalThink(0.1)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
    }

    OnIntervalThink(): void {
        if (this.GetParent().IsAlive() == false) {
            this.StartIntervalThink(-1);
            return
        }
        if (this.state) {
            this.state = false;
            if (this.caster.custom_animation != null && this.caster.custom_animation["attack"]) {
                let attack = this.caster.custom_animation["attack"];
                this.caster.AddActivityModifier(attack.seq);
                this.attack_act = attack.act ?? GameActivity.DOTA_ATTACK;
            }
            this.StartIntervalThink(1)
            return
        }
        this.bonus_move += this.bonus_value;
        let enemies = FindUnitsInRadius(
            DotaTeam.BADGUYS,
            this.GetParent().GetAbsOrigin(),
            null,
            125,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO + UnitTargetType.BASIC,
            UnitTargetFlags.PLAYER_CONTROLLED,
            FindOrder.ANY,
            false
        );
        this.SetStackCount(enemies.length)
        if (enemies.length > 0) {
            this.caster.PerformAttack(this.caster, false, true, true, false, false, true, false);
            let attack_damage = this.caster.GetAverageTrueAttackDamage(null);
            for (let enemy of enemies) {
                ApplyCustomDamage({
                    victim: enemy,
                    attacker: this.caster,
                    damage: attack_damage,
                    damage_type: DamageTypes.MAGICAL,
                    ability: this.GetAbility(),
                    element_type: ElementTypes.NONE,
                    // is_primary: true,
                })
            }
            // 播放声音

            // 动作
            if (this.attack_act) {
                this.caster.StartGesture(this.attack_act)
            }

        }

    }



    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.ATTACKSPEED_BASE_OVERRIDE,
            ModifierFunction.PROCATTACK_FEEDBACK,
            // ModifierFunction.MOVESPEED_BONUS_CONSTANT,
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE,
            ModifierFunction.IGNORE_MOVESPEED_LIMIT
        ]
    }

    GetModifierIgnoreMovespeedLimit(): 0 | 1 {
        return 1
    }

    GetModifierProcAttack_Feedback(event: ModifierAttackEvent): number {
        return -event.damage * 2
    }

    GetModifierAttackSpeedBaseOverride(): number {
        return 0.001
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.bonus_move
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_HEALTH_BAR]: true,
            [ModifierState.ALLOW_PATHING_THROUGH_CLIFFS]: true,
            // [ModifierState.FORCED_FLYING_VISION]: true,
            // [ModifierState.DISARMED]: this.GetStackCount() > 0,
        }
    }


}