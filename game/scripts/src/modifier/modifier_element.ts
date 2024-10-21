import { BaseModifier, registerModifier } from "../utils/dota_ts_adapter";

/**
 * 灼烧效果
 */
@registerModifier()
export class modifier_element_effect_fire extends BaseModifier {

    dot_damage: number
    dot_interval: number
    total_damage: number;
    element_type: ElementTypes

    parent: CDOTA_BaseNPC;
    caster: CDOTA_BaseNPC;
    playerid: PlayerID;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.parent = this.GetParent();
        this.playerid = this.caster.GetPlayerOwnerID();
        this.element_type = ElementTypes.FIRE;
        let interval_increase: number = params.interval_increase ?? 0;
        let base_interval = params.base_interval ?? 1;
        this.dot_interval = base_interval / (1 + interval_increase * 0.01);
        this.C_OnCreated(params);
        this.OnRefresh(params)
        this.StartIntervalThink(this.dot_interval)

    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        let burn_percent = this.caster.custom_attribute_value["BurningDmg"];
        this.dot_damage = math.floor(this.caster.GetAverageTrueAttackDamage(null) * burn_percent * 0.01);
        this.total_damage = this.dot_damage * this.GetDuration() / this.dot_interval;
    }

    C_OnCreated(params: any): void { }

    OnIntervalThink(): void {
        this.total_damage -= this.dot_damage
        ApplyCustomDamage({
            victim: this.parent,
            attacker: this.caster,
            damage: this.dot_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypes.FIRE,
            is_primary: false,
            special_effect: true,
        });
    }

    SettlementDamage() {
        this.StartIntervalThink(-1)
        ApplyCustomDamage({
            victim: this.parent,
            attacker: this.caster,
            damage: this.total_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            element_type: ElementTypes.FIRE,
            is_primary: false,
            special_effect: true,
        });
        this.Destroy()
    }

    GetEffectName(): string {
        return "particles/units/heroes/hero_ogre_magi/ogre_magi_ignite_debuff.vpcf"
    }
}

/** 冰冻-减速 */
@registerModifier()
export class modifier_element_effect_ice extends BaseModifier {

    move_slow_pct: number = 30;

    GetTexture(): string {
        return "ancient_apparition_cold_feet"
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        let hCaster = this.GetCaster();
        let t16_index = hCaster.hero_talent["16"] ?? 0;
        if (t16_index >= 2) {
            this.move_slow_pct = GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, '16', 'move_slow')
        }
        this.move_slow_pct += GameRules.HeroTalentSystem.GetTalentKvOfUnit(hCaster, '80', 'value')

    }

    IsDebuff(): boolean { return true }

    DeclareFunctions(): modifierfunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ]
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return -1 * this.move_slow_pct
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

/** 冰冻 */
@registerModifier()
export class modifier_element_effect_ice_frozen extends BaseModifier {

    GetTexture(): string {
        return "crystal_maiden_frostbite"
    }

    IsDebuff(): boolean { return true }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.STUNNED]: true,
            [ModifierState.FROZEN]: true,
        }
    }

    GetEffectName(): string {
        return "particles/custom/element/ice/ice_effect_frozen.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment_t {
        return ParticleAttachment.ABSORIGIN_FOLLOW
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_lich_ice_age.vpcf"
    }
}

/** 雷:麻痹 */
@registerModifier()
export class modifier_element_effect_thunder extends BaseModifier {

    IsDebuff(): boolean {
        return false
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.ROOTED]: true,
        }
    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        let hParent = this.GetParent();
        hParent.AddNewModifier(hParent, null, "modifier_element_effect_thunder_immune", {
            duration: 10
        })
    }

    GetEffectName(): string {
        return "particles/custom/element/thunder/thunder_effect_debuff.vpcf"
    }

    GetEffectAttachType(): ParticleAttachment_t {
        return ParticleAttachment.ABSORIGIN_FOLLOW
    }
}

@registerModifier()
export class modifier_element_effect_thunder_immune extends BaseModifier {

    IsHidden(): boolean {
        return true
    }


}

/** 风元素免疫 */
@registerModifier()
export class modifier_element_effect_wind_immune extends BaseModifier {

    IsHidden(): boolean {
        return true
    }

}