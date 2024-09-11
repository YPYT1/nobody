import { BaseAbility, BaseModifier, registerAbility, registerModifier } from "../../utils/dota_ts_adapter";

// import * as NpcAbilityCustom from "./../../json/npc_abilities_custom.json"

/** 需要同步的数据 */
const UpdateAttributeKyes: AttributeMainKey[] = [
    "AttackRate",
    "AttackDamage",
    "AttackRange",
    "AttackSpeed",
    "MoveSpeed",
    "MaxHealth",
    "HealthRegen",
    "MaxMana",
    "ManaRegen",
    "PickItemRadius",
    'AbilityHaste',
    'AbilityCooldown',
    'AbilityCooldown2',
    'VisionRange',
];

// 属性
@registerAbility()
export class public_attribute extends BaseAbility {

    GetIntrinsicModifierName(): string {
        return "modifier_public_attribute"
    }
}

@registerModifier()
export class modifier_public_attribute extends BaseModifier {

    bIsHero: boolean;
    BaseKvHp: number;
    AttributeData: CustomAttributeValueType;
    PickItemFx: ParticleID;
    hParent: CDOTA_BaseNPC;
    hAbility: CDOTABaseAbility;
    iParentEntity: EntityIndex;
    // timer: number;
    IsHidden(): boolean { return true }
    RemoveOnDeath(): boolean { return false; }
    GetAttributes(): ModifierAttribute { return ModifierAttribute.PERMANENT }

    /** 初始化属性 */
    OnCreated(params: any): void {
        this.caster = this.GetCaster();
        this.AttributeData = {}
        this.hAbility = this.GetAbility();
        this.BaseKvHp = this.GetParent().GetMaxHealth();
        this.SetHasCustomTransmitterData(true);
        if (!IsServer()) { return; }
        this.hParent = this.GetParent();
        this.iParentEntity = this.GetParent().entindex();
        this.hParent.AddNewModifier(this.hParent, this.hAbility, "modifier_rune_effect", {})
        this.hParent.AddNewModifier(this.hParent, this.hAbility, "modifier_prop_effect", {})
        this.hParent.AddNewModifier(this.hParent, this.hAbility, "modifier_talent_effect", {})
        this.hParent.AddNewModifier(this.hParent, this.hAbility, "modifier_public_attribute_delay", {})


        this.ForceRefresh()
        this.StartIntervalThink(0.1)
    }

    /** 更新属性 */
    OnRefresh(params: any): void {
        if (!IsServer()) { return; }
        this._UpdateAttribute();
    }

    OnIntervalThink(): void {
        if (!this.hParent.IsAlive() || this.AttributeData.PickItemRadius < 1) { return }
        let vPos = this.hParent.GetAbsOrigin();
        let ExpItems = FindUnitsInRadius(
            DotaTeam.NEUTRALS,
            vPos,
            null,
            this.AttributeData.PickItemRadius,
            UnitTargetTeam.FRIENDLY,
            UnitTargetType.OTHER,
            UnitTargetFlags.INVULNERABLE,
            FindOrder.ANY,
            false
        )
        // print("ExpItems",ExpItems.length)
        for (let ExpItem of ExpItems) {
            // print("RowName",ExpItem.GetUnitName())
            if (ExpItem.GetUnitName() == "npc_exp"
                && !ExpItem.HasModifier("modifier_pick_animation")
                && !ExpItem.HasModifier("modifier_generic_arc_lua")
            ) {
                ExpItem.AddNewModifier(ExpItem, null, "modifier_pick_animation", {
                    picker: this.iParentEntity,
                })
            }
        }

    }

    _UpdateAttribute() {
        // print("[modifier_public_attribute]:_UpdateAttribute");
        let hUnit = this.GetParent() as CDOTA_BaseNPC_Hero;
        for (let k of UpdateAttributeKyes) {
            this.AttributeData[k] = hUnit.custom_attribute_value[k];
        }

        this.SendBuffRefreshToClients();
        hUnit.SetBaseDamageMin(hUnit.custom_attribute_value.AttackDamage);
        hUnit.SetBaseDamageMax(hUnit.custom_attribute_value.AttackDamage);
        hUnit.CalculateStatBonus(true);
        // 写入网表
        // DeepPrintTable(hUnit.custom_attribute_value)
        // print("AttackRate:", hUnit.custom_attribute_value.AttackRate)
        CustomNetTables.SetTableValue("unit_attribute", `${hUnit.GetEntityIndex()}`, {
            table: hUnit.custom_attribute_table,
            value: hUnit.custom_attribute_value,
            show: hUnit.custom_attribute_show,
        })
    }

    AddCustomTransmitterData() {
        let hUnit = this.GetParent();
        let TransmitterData: CustomAttributeValueType = {};
        for (let k of UpdateAttributeKyes) {
            TransmitterData[k] = hUnit.custom_attribute_value[k]
        }
        return TransmitterData
    }

    HandleCustomTransmitterData(data: CustomAttributeValueType) {
        this.AttributeData = data;
    }

    CheckState(): Partial<Record<ModifierState, boolean>> {
        return {
            // [ModifierState.PROVIDES_VISION]: true,
            [ModifierState.BLOCK_DISABLED]: true,
            [ModifierState.DISARMED]: true,
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.ATTACK_RANGE_BASE_OVERRIDE,
            ModifierFunction.BASE_ATTACK_TIME_CONSTANT,
            ModifierFunction.ATTACKSPEED_BONUS_CONSTANT,
            ModifierFunction.MOVESPEED_BASE_OVERRIDE,
            ModifierFunction.HEALTH_BONUS,
            ModifierFunction.HEALTH_REGEN_CONSTANT,
            ModifierFunction.MANA_BONUS,
            ModifierFunction.MANA_REGEN_CONSTANT,
            ModifierFunction.COOLDOWN_PERCENTAGE,
            ModifierFunction.FIXED_DAY_VISION,
            ModifierFunction.FIXED_NIGHT_VISION,
            ModifierFunction.BONUS_DAY_VISION,
            ModifierFunction.BONUS_NIGHT_VISION,
        ]
    }

    GetBonusDayVision(): number {
        return this.AttributeData.VisionRange ?? 800
    }

    GetBonusNightVision(): number {
        return this.AttributeData.VisionRange ?? 800
    }

    GetModifierAttackRangeOverride(): number {
        return this.AttributeData.AttackRange
    }

    GetModifierBaseAttackTimeConstant(): number {
        return this.AttributeData.AttackRate
    }

    GetModifierAttackSpeedBonus_Constant(): number {
        return this.AttributeData.AttackSpeed
    }

    GetModifierMoveSpeedOverride(): number {
        return this.AttributeData.MoveSpeed
    }

    GetModifierHealthBonus(): number {
        return math.max(0, (this.AttributeData.MaxHealth ?? 0) - this.BaseKvHp)
    }

    GetModifierConstantHealthRegen(): number {
        return this.AttributeData.HealthRegen
    }

    GetModifierManaBonus(): number {
        return this.AttributeData.MaxMana
    }

    GetModifierConstantManaRegen(): number {
        return this.AttributeData.ManaRegen
    }

    GetModifierPercentageCooldown(event: ModifierAbilityEvent): number {
        if (event.ability == null) { return 100 }
        let hUnit = this.GetParent() as CDOTA_BaseNPC_Hero;
        let ability_name = event.ability.GetAbilityName()
        let ability_cd_limit = 55;
        let base_cd = 100;
        if (IsServer()) {
            ability_cd_limit = hUnit.custom_attribute_table.AbilityCooldown.Limit
            // 复仇冷却
            if (ability_name == "drow_5" && this.caster.rune_level_index.hasOwnProperty("rune_51")) {
                let fuchou_cd = GameRules.RuneSystem.GetKvOfUnit(this.caster, 'rune_51', 'fuchou_cd') * 0.01;
                base_cd *= (1 - fuchou_cd)
            }
        }


        let AbilityHaste = this.AttributeData.AbilityHaste ?? 0;
        let ability_cd = math.min(ability_cd_limit * 0.01, AbilityHaste / (AbilityHaste + 150))
        let AbilityCooldown2 = (this.AttributeData.AbilityCooldown2 ?? 0) * 0.01;
        let TotalCooldown = math.min(0.99, ability_cd + AbilityCooldown2);
        base_cd *= (1 - TotalCooldown);
        return 100 - base_cd
    }


    // GetModifierPercentageManacostStacking(): number {
    //     return -100
    // }
}

/** 延迟给一些无法初始化的属性值 比如蓝量 */
@registerModifier()
export class modifier_public_attribute_delay extends BaseModifier {

    IsHidden(): boolean { return true }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let hParent = this.GetParent();
        hParent.GiveMana(hParent.GetMaxMana());
        this.Destroy()
        this.StartIntervalThink(-1)
    }

}

@registerModifier()
export class modifier_public_revive_thinker extends BaseModifier {

    team: DotaTeam;
    origin: Vector;
    player_id: PlayerID;
    cast_fx: ParticleID;
    state: boolean;
    rescue_time: number;
    rescue_radius: number;

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.rescue_radius = 225;
        this.state = true;
        this.player_id = this.GetCaster().GetPlayerOwnerID()
        this.team = this.GetCaster().GetTeamNumber();
        this.origin = this.GetParent().GetAbsOrigin();
        let duration = this.GetDuration();
        let cast_fx = ParticleManager.CreateParticle(
            "particles/diy_particles/event_ring_anim/event_ring_anim.vpcf",
            ParticleAttachment.POINT,
            this.GetParent()
        )
        ParticleManager.SetParticleControl(cast_fx, 0, Vector(this.origin.x, this.origin.y, this.origin.z + 5))
        ParticleManager.SetParticleControl(cast_fx, 1, Vector(duration, 0, 0))
        ParticleManager.SetParticleControl(cast_fx, 2, Vector(this.rescue_radius, 0, 0))
        ParticleManager.SetParticleControl(cast_fx, 3, Vector(0, 255, 0))
        // this.AddParticle(cast_fx, false, false, -1, false, false);
        this.rescue_time = GameRules.GetDOTATime(false, false) + duration / 2;
        this.cast_fx = cast_fx;
        // print("revive duration", duration)
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let game_select_phase = GameRules.MapChapter._game_select_phase;
        if (game_select_phase == 999) {
            this.StartIntervalThink(-1);
            this.OnDestroy()
            return
        }
        if (this.state) {
            if (this.rescue_time <= GameRules.GetDOTATime(false, false)) {
                this.state = false;
            }
        } else {
            let other_hero = FindUnitsInRadius(
                this.team,
                this.origin,
                null,
                this.rescue_radius,
                UnitTargetTeam.FRIENDLY,
                UnitTargetType.HERO,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            if (other_hero.length > 0) {
                this.StartIntervalThink(-1);
                this.OnDestroy()
                return
            }
        }


    }

    OnDestroy(): void {
        if (!IsServer()) { return }
        GameRules.GameInformation.PlayerRevive(this.player_id);
        ParticleManager.DestroyParticle(this.cast_fx, true)
        UTIL_Remove(this.GetParent())
    }
}