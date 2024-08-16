import { BaseModifier, registerAbility, registerModifier } from "../../../../utils/dota_ts_adapter";
import { BaseHeroAbility, BaseHeroModifier } from "../../base_hero_ability";

/**
 * 迷踪步【持续性】	获得10%/20%/30%移动速度加成，持续6秒。cd：15秒,蓝耗：30
49	娴熟	迷踪步的cd缩减%ability_cd_reduce%秒。
50	相位	迷踪步获得相位效果，可以穿越单位。
 */
@registerAbility()
export class drow_4b extends BaseHeroAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_drow_4b"
    }

    GetCooldown(level: number): number {
        let player_id = this.GetCaster().GetPlayerOwnerID();
        let netdata = CustomNetTables.GetTableValue("hero_talent", `${player_id}`);
        if (netdata && netdata["49"]) {
            let ability_cd_reduce = netdata["49"].uc * 3;
            return super.GetCooldown(level) - ability_cd_reduce
        }
        return super.GetCooldown(level)
    }
}

@registerModifier()
export class modifier_drow_4b extends BaseHeroModifier {

    move_pct: number;
    duration: number;

    ability_cd_reduce: number;

    UpdataAbilityValue(): void {
        let duration = this.ability.GetSpecialValueFor("duration");
        this.duration = this.ability.GetTypesAffixValue(duration, "Dot", "skv_dot_duration");
        this.ability_cd_reduce = GameRules.HeroTalentSystem.GetTalentKvOfUnit(this.caster, "drow_ranger", "49", 'ability_cd_reduce')
    }

    OnIntervalThink(): void {
        if (this.ability.IsActivated()
            && this.caster.IsAlive()
            && this.ability.IsCooldownReady()
            && this.ability.IsMeetCastCondition()
        ) {
            this.DoExecutedAbility()
            this.ability.ManaCostAndConverDmgBonus()
            this.caster.AddNewModifier(this.caster, this.ability, "modifier_drow_4b_buff", {
                duration: this.duration
            })
        }
    }


    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.COOLDOWN_REDUCTION_CONSTANT
        ]
    }

    // GetModifierCooldownReduction_Constant(event: ModifierAbilityEvent): number {
    //     if (event.ability != this.ability) { return 0 }
    //     print("cooldown ", IsServer(), event.ability.GetAbilityName())
    //     return 0
    // }

}

@registerModifier()
export class modifier_drow_4b_buff extends BaseModifier {

    move_pct: number;
    phase_state: boolean;
    caster: CDOTA_BaseNPC;

    OnCreated(params: object): void {
        this.caster = this.GetCaster()
        this.phase_state = false;
        this.OnRefresh(params)
        let effect_fx = ParticleManager.CreateParticle(
            "particles/units/heroes/hero_windrunner/windrunner_windrun.vpcf",
            ParticleAttachment.ABSORIGIN_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    OnRefresh(params: object): void {
        this.move_pct = this.GetAbility().GetSpecialValueFor("move_pct");
        if (IsServer()) {
            this.phase_state = (this.caster.hero_talent["50"] ?? 0) > 0
        }
    }

    CheckState(): Partial<Record<modifierstate, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: this.phase_state
        }
    }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return this.move_pct
    }
}