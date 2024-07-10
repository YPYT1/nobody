import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

/**
 * 灼烧效果
 */
@registerModifier()
export class modifier_element_effect_fire extends BaseModifier {

    dot_damage: number
    dot_interval: number
    element_type: ElementTypeEnum

    total_damage: number;

    parent: CDOTA_BaseNPC;
    caster: CDOTA_BaseNPC;
    playerid: PlayerID;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.parent = this.GetParent();
        this.playerid = this.caster.GetPlayerOwnerID();
        this.element_type = ElementTypeEnum.fire;
        this.OnRefresh(params)
        this.C_OnCreated(params);
        this.dot_interval = 1;
        this.StartIntervalThink(this.dot_interval)
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        // let duration = 3;
        // let bond_count = GameRules.NewArmsEvolution.ElementBondDateList[this.playerid].Element["1"];
        let caster_damage = this.caster.GetAverageTrueAttackDamage(null)
        this.dot_damage = caster_damage * 0.25;
        // if (bond_count >= 4) { this.dot_damage += caster_damage * 0.25; }
        // if (bond_count >= 6) { duration = 6 }
        // this.total_damage = this.dot_damage * (this.dot_interval / 1) * duration;
        // this.SetDuration(duration, true)
    }

    C_OnCreated(params: any): void { }

    OnIntervalThink(): void {
        ApplyCustomDamage({
            victim: this.parent,
            attacker: this.caster,
            damage: this.dot_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: this.element_type,
            is_primary: false,
            special_effect: true,
        });
        // this.total_damage -= this.dot_damage
        // print("last damage", this.total_damage)
    }

    /** 引爆DOT,直接造成剩余DOT伤害 */
    Detonate() {

    }

    GetEffectName(): string {
        return "particles/units/heroes/hero_ogre_magi/ogre_magi_ignite_debuff.vpcf"
    }
}

/** 冰冻-减速 */
@registerModifier()
export class modifier_element_effect_ice extends BaseModifier {

    GetTexture(): string {
        return "ancient_apparition_cold_feet"
    }

    IsDebuff(): boolean { return true }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return -30
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_frost.vpcf"
    }

    // CheckState(): Partial<Record<ModifierState, boolean>> {
    //     return {
    //         [ModifierState.STUNNED]: true,
    //         [ModifierState.FROZEN]: true,
    //     }
    // }


}

/** 雷:麻痹 */
@registerModifier()
export class modifier_element_effect_thunder extends BaseModifier {

    IsDebuff(): boolean {
        return false
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.STUNNED]: true,
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent();
        hParent.AddNewModifier(hParent, null, "modifier_element_effect_thunder_immune", {
            duration: 10
        })
    }
}

@registerModifier()
export class modifier_element_effect_thunder_immune extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

}