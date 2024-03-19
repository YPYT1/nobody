import { BaseAbility, registerAbility, BaseModifier, registerModifier } from "../utils/dota_ts_adapter";


@registerModifier()
export class modifier_debuff_disable_special_attack extends BaseModifier {

    IsHidden(): boolean { return true; }
}

@registerModifier()
export class modifier_debuff_break extends BaseModifier {

    IsDebuff(): boolean { return true; }

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        hParent.EmitSound("DOTA_Item.SilverEdge.Target");
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.PASSIVES_DISABLED]: true
        };
    }

    GetEffectName() {
        return "particles/generic_gameplay/generic_break.vpcf";
    }

    GetEffectAttachType() {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }
}

@registerModifier()
export class modifier_debuff_hidden extends BaseModifier {

    IsHidden(): boolean { return true; }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
            [ModifierState.UNSELECTABLE]: true,
            [ModifierState.NOT_ON_MINIMAP]: true,
            [ModifierState.OUT_OF_GAME]: true,
        };
    }
}

@registerModifier()
export class modifier_buff_invisible extends BaseModifier {

    IsHidden(): boolean { return true; }

    // sounds/items/ghost_activate.vsnd
    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.INVISIBLE]: true,
        };
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        // hParent.EmitSound("")
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INVISIBILITY_LEVEL,
            ModifierFunction.ON_ABILITY_EXECUTED,
            ModifierFunction.ON_ATTACK
        ];
    }

    OnAttack(event: ModifierAttackEvent): void {
        if (event.attacker == this.GetParent()) {
            this.Destroy();
        }
    }

    OnAbilityExecuted(event: ModifierAbilityEvent): void {
        if (event.unit == this.GetParent()) {
            this.Destroy();
        }
    }

    GetModifierInvisibilityAttackBehaviorException(): void {
        this.Destroy();
    }

    GetModifierInvisibilityLevel(): number {
        return 20;
    }

}

@registerModifier()
export class modifier_debuff_invincible extends BaseModifier {

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            // [ModifierState.INVULNERABLE]: true,
            [ModifierState.ATTACK_IMMUNE]: true,
            [ModifierState.MAGIC_IMMUNE]: true,
            [ModifierState.INVISIBLE]: true,
            [ModifierState.NO_UNIT_COLLISION]: true,
        };
    }


    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_ancestral_spirit.vpcf";
    }
}


/** 状态免疫模块 */
@registerModifier()
export class modifier_debuff_immune extends BaseModifier {

    IsHidden() { return true; }
    IsDebuff() { return false; }
    IsPurgable() { return false; }
    IsPurgeException() { return true; }
    AllowIllusionDuplicate() { return false; }
    ShouldUseOverheadOffset() { return true; }
}

// 任何免疫
@registerModifier()
class modifier_debuff_immune_any extends modifier_debuff_immune { }
// 免疫眩晕
@registerModifier()
class modifier_debuff_immune_stunned extends modifier_debuff_immune { }
// 免疫减速
@registerModifier()
class modifier_debuff_immune_slow extends modifier_debuff_immune { }
// 免疫沉默
@registerModifier()
class modifier_debuff_immune_silenced extends modifier_debuff_immune { }
// 免疫禁足
@registerModifier()
class modifier_debuff_immune_rooted extends modifier_debuff_immune { }
// 免疫中毒
@registerModifier()
class modifier_debuff_immune_poison extends modifier_debuff_immune { }

// DEBUFF模版
export class modifier_debuff_debuff_template extends BaseModifier {

    IsHidden() { return false; }
    IsDebuff() { return true; }
    IsPurgable() { return true; }
    IsPurgeException() { return true; }
    AllowIllusionDuplicate() { return false; }
    ShouldUseOverheadOffset() { return true; }

    OnIntervalThink() {
        if (this.GetAbility() == null || this.GetCaster() == null) {
            this.Destroy();
            return;
        }
    }
}

@registerModifier()
export class modifier_debuff_stunned extends modifier_debuff_debuff_template {

    IsStunDebuff(): boolean {
        return true;
    }

    GetTexture() {
        return "lich/lich_ti10_immortal_ability_icon/lich_ti10_immortal_sinister_gaze";
    }

    GetEffectName() {
        return "particles/generic_gameplay/generic_stunned.vpcf";
    }

    GetEffectAttachType() {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.STUNNED]: true
        };
    }

    DeclareFunctions() {
        return [
            ModifierFunction.OVERRIDE_ANIMATION
        ];
    }

    GetOverrideAnimation(): GameActivity {
        return GameActivity.DOTA_DISABLED;
    }

}

// 减速
@registerModifier()
class modifier_debuff_slow extends modifier_debuff_debuff_template {

    slow: number;

    OnCreated(params: any) {
        if (!IsServer()) { return; }
        this.slow = -1 * math.abs(params.slow);
        this.SetHasCustomTransmitterData(true);
    }

    OnRefresh(params: any) {
        if (!IsServer()) { return; }
        this.slow = -1 * math.abs(params.slow);
    }

    DeclareFunctions() {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ];
    }

    AddCustomTransmitterData() {
        return {
            value: this.slow
        };
    }

    HandleCustomTransmitterData(data: any) {
        this.slow = data.value;
    }

    GetModifierMoveSpeedBonus_Percentage() {
        return this.slow;
    }
}

/** 嘲讽 */
@registerModifier()
class modifier_debuff_taunt extends modifier_debuff_debuff_template {

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_beserkers_call.vpcf";
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        hParent.SetForceAttackTarget(this.GetCaster());
        hParent.MoveToTargetToAttack(this.GetCaster());
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        hParent.SetForceAttackTarget(this.GetCaster());
        hParent.MoveToTargetToAttack(this.GetCaster());
    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        hParent.SetForceAttackTarget(null);
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.TAUNTED]: true,
            [ModifierState.COMMAND_RESTRICTED]: true,
        };
    }
}
// 禁足
@registerModifier()
class modifier_debuff_rooted extends modifier_debuff_debuff_template {

    GetTexture() {
        return "ancient_apparition_cold_feet";
    }

    // GetEffectName() {
    //     return "particles/units/heroes/hero_crystalmaiden/maiden_frostbite_buff.vpcf";
    // }

    GetEffectAttachType() {
        return ParticleAttachment.ABSORIGIN_FOLLOW;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.ROOTED]: true
        };
    }
}

// 沉默
@registerModifier()
class modifier_debuff_silenced extends modifier_debuff_debuff_template {

    GetTexture() {
        return "silencer_last_word";
    }

    GetEffectName() {
        return "particles/generic_gameplay/generic_silence.vpcf";
    }

    GetEffectAttachType() {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.SILENCED]: true
        };
    }

}

/** 缴械 */
@registerModifier()
class modifier_debuff_disarmed extends modifier_debuff_debuff_template {


    IsPurgable() { return false; }

    GetEffectName() {
        return "particles/generic_gameplay/generic_disarm.vpcf";
    }

    GetEffectAttachType() {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.DISARMED]: true
        };
    }

}

// 中毒
@registerModifier()
class modifier_debuff_poison extends modifier_debuff_debuff_template {

    IsHidden(): boolean { return true; }

    GetTexture() {
        return "viper/ti8_immortal_tail/viper_nethertoxin_immortal";
    }
}

// 处于读条中，禁止其他操作
@registerModifier()
class modifier_debuff_in_channel extends BaseModifier {

    IsHidden() { return true; }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.COMMAND_RESTRICTED]: true
        };
    }
}

/** 相位移动状态 */
@registerModifier()
export class modifier_debuff_phase extends BaseModifier {

    IsHidden(): boolean {
        return false;
    }

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        let effect_fx = ParticleManager.CreateParticle(
            "particles/items2_fx/phase_boots.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.NO_UNIT_COLLISION]: true
        };
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ];
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return 10;
    }
}


@registerModifier()
export class modifier_attack_speed_unslowable extends BaseModifier {

    attack_speed_reduction_pct: number;

    OnCreated(params: any): void {
        if (this.GetAbility() == null && IsServer()) {
            this.attack_speed_reduction_pct = 0;
            if (params.attack_speed_reduction_pct != null) {
                this.attack_speed_reduction_pct = params.attack_speed_reduction_pct;
                if (this.attack_speed_reduction_pct != 0) {
                    this.SetHasCustomTransmitterData(true);
                }
            }
        }
    }

    OnRefresh(params: any): void {
        if (this.GetAbility() != null) {
            this.attack_speed_reduction_pct = this.GetAbility().GetSpecialValueFor("attack_speed_reduction_pct");
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ATTACKSPEED_REDUCTION_PERCENTAGE
        ];
    }

    GetModifierAttackSpeedReductionPercentage() {
        return this.attack_speed_reduction_pct;
    }

    AddCustomTransmitterData() {
        return {
            value: this.attack_speed_reduction_pct
        };
    }

    HandleCustomTransmitterData(data: any) {
        this.attack_speed_reduction_pct = data.value;
    }
}

@registerModifier()
export class modifier_debuff_charm extends BaseModifier {

    GetTexture(): string {
        return "lich_sinister_gaze";
    }

    OnCreated(params: object): void {
        this.OnRefresh(params);
    }

    IsDebuff(): boolean { return true; }
    IsPurgable(): boolean { return true; }

    OnRefresh(params: object): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        if (hParent.HasAbility("public_abyss_boss_state")) {
            this.Destroy();
            return;
        }
        let hCaster = this.GetCaster();
        hParent.SetForceAttackTarget(hCaster);
        hParent.MoveToTargetToAttack(hCaster);
    }

    OnDestroy(): void {
        if (!IsServer()) { return; }
        let hParent = this.GetParent();
        hParent.SetForceAttackTarget(hParent);
        hParent.MoveToTargetToAttack(hParent);
        hParent.SetForceAttackTarget(null);
        hParent.MoveToTargetToAttack(null);
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            // [ModifierState.HEXED]: true,
            [ModifierState.SILENCED]: true,
            [ModifierState.MUTED]: true,
        };
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            // ModifierFunction.MODEL_CHANGE,
            // ModifierFunction.MOVESPEED_BASE_OVERRIDE,
            ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ];
    }

    GetModifierAttackSpeedBonus_Constant() {
        return -500;
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return -70;
    }

    GetEffectName(): string {
        return "particles/custom/generic_charm.vpcf";
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }
}

/** 昏睡 */
@registerModifier()
export class modifier_debuff_lethargy extends BaseModifier {

    awakening_value: number;

    GetTexture(): string {
        return "bane_nightmare";
    }

    OnCreated(params: any): void {
        if (!IsServer()) { return; }
        this.awakening_value = params.awakening_value ?? 0;
        // 昏睡特效
    }


    CheckState(): Partial<Record<ModifierState, boolean>> {

        return {
            [ModifierState.STUNNED]: true,

        };
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE
        ];
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        if (event.original_damage >= this.awakening_value) {
            this.Destroy();
        } else {
            this.awakening_value -= event.original_damage;
        }
        return 0;
    }

    GetEffectName(): string {
        return "particles/generic_gameplay/generic_sleep.vpcf";
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }
}

@registerModifier()
export class modifier_debuff_hexed extends BaseModifier {

    OnCreated(params: any): void {
        this.model_name = "models/props_gameplay/frog.vmdl";
        if (!IsServer()) { return; }
        let effect_fx = ParticleManager.CreateParticle(
            "particles/items_fx/item_sheepstick.vpcf",
            ParticleAttachment.POINT_FOLLOW,
            this.GetParent()
        );
        this.AddParticle(effect_fx, false, false, -1, false, false);
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.HEXED]: true,
            // [ModifierState.DISARMED]: true,
            [ModifierState.SILENCED]: true,
            [ModifierState.MUTED]: true,
        };
    }
    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MODEL_CHANGE,
            ModifierFunction.MOVESPEED_BASE_OVERRIDE,
            ModifierFunction.ATTACKSPEED_BONUS_CONSTANT
        ];
    }

    GetModifierAttackSpeedBonus_Constant() {
        return -500;
    }

    GetModifierMoveSpeedOverride(): number {
        return 100;
    }

    GetModifierModelChange(): string {
        return this.model_name;
    }

    model_name: string;
}


@registerModifier()
export class modifier_debuff_feared extends BaseModifier {

    hCaster: CDOTA_BaseNPC;
    hParent: CDOTA_BaseNPC;

    IsDebuff(): boolean { return true; }
    IsPurgable(): boolean { return true; }

    OnCreated(params: object): void {
        if (!IsServer()) { return; }
        this.hCaster = this.GetCaster();
        this.hParent = this.GetParent();
        this.OnIntervalThink();
        this.StartIntervalThink(0.3);
    }

    OnIntervalThink(): void {
        if (this.hCaster.IsAlive() == false) {
            this.StartIntervalThink(-1);
            return;
        }
        let vCaster = this.hCaster.GetAbsOrigin();
        let vParent = this.hParent.GetAbsOrigin();
        let direction = (vParent - vCaster as Vector).Normalized();
        let distance = direction.Length2D() + 250;
        let end_point = vParent + direction * distance as Vector;
        // DebugDrawCircle(end_point, Vector(255, 0, 0), 10, 128, true, 0.3);
        this.hParent.MoveToPosition(end_point);
        // file://{images}/spellicons/dark_willow/dw_2021_immortal_ability_icon/dw_2021_immortal_terrorize.png
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            [ModifierState.COMMAND_RESTRICTED]: true,
            [ModifierState.FEARED]: true,
        };
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.MOVESPEED_BONUS_PERCENTAGE
        ];
    }

    GetModifierMoveSpeedBonus_Percentage(): number {
        return -50;
    }

    GetStatusEffectName(): string {
        return "particles/status_fx/status_effect_dark_willow_wisp_fear.vpcf";
    }

    GetEffectName(): string {
        return "particles/econ/items/dark_willow/dark_willow_immortal_2021/dw_2021_willow_wisp_spell_debuff.vpcf";
    }

    GetEffectAttachType(): ParticleAttachment {
        return ParticleAttachment.OVERHEAD_FOLLOW;
    }
}
