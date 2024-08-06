import { BaseAbility, BaseItem, BaseModifier, registerAbility, registerModifier } from '../../utils/dota_ts_adapter';


type MdfEventTyps =
    | "OnAbilityKill"
    | "OnArmsInterval"
    | "OnArmsStart"
    | "OnAffected"
    | "OnKill"
    | "OnArmsExecuted"
    | "OnAttackStart";


/**
 * 自定义Arms技能系统.
 * @ 属性变更时自动更新伤害
 * @ 注册相关事件触发
 * 
 */
export class BaseArmsAbility extends BaseAbility {

    // Precache(context: CScriptPrecacheContext): void {
    //     PrecacheResource("particle", "particles/units/heroes/hero_crystalmaiden/maiden_crystal_nova.vpcf", context);
    // }
    slot_index: number;
    is_init: boolean;
    // mdf_name: string;
    key: string;
    arms_cd: number;
    caster: CDOTA_BaseNPC;
    dmg_formula: string;
    player_id: PlayerID;
    ability_damage: number;
    team: DOTATeam_t;
    mana_cost: number;
    // search_radius: number;
    /** 附近单位最近多少码可触发 */
    trigger_distance: number;
    buff: CDOTA_Buff;
    unit_list: CDOTA_BaseNPC[];

    /**
     * 查找范围内随机敌人
     * @returns 
     */
    FindRandomEnemyTarget() {
        const vCaster = this.caster.GetOrigin();
        let targets = FindUnitsInRadius(
            this.team,
            vCaster,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        if (targets.length > 0) {
            return targets[0]
        } else {
            return null
        }
    }

    /**
     * 查找范围内随机敌人的坐标
     * @returns 
     */
    FindRandomEnemyVect() {
        const vCaster = this.caster.GetOrigin();
        let targets = FindUnitsInRadius(
            this.team,
            vCaster,
            null,
            this.trigger_distance,
            UnitTargetTeam.ENEMY,
            UnitTargetType.BASIC + UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );

        let vTarget: Vector;
        if (targets.length > 0) {
            vTarget = targets[0].GetAbsOrigin()
        } else {
            vTarget = vCaster + RandomVector(RandomInt(100, this.trigger_distance)) as Vector
        }

        return vTarget
    }

    // SetLinkBuff(hBuff: CDOTA_Buff) { this.buff = hBuff }

    /**
     * 技能升级事件
     */
    OnUpgrade() {
        if (this.is_init == null) {
            this.is_init = true;
            this.dmg_formula = "0";
            this.element_type = 0;
            this.caster = this.GetCaster();
            this.player_id = this.caster.GetPlayerOwnerID();
            this.arms_cd = this.GetCooldown(0);
            this.team = this.caster.GetTeamNumber();
            this.key = this.GetAbilityName();
            this.ArmsActTime = GameRules.GetDOTATime(false, false) + 1;
            this.AffectedActTime = GameRules.GetDOTATime(false, false) + 1;
            this.trigger_distance = this.GetCastRange(this.caster.GetAbsOrigin(), this.caster);
            let KeyValues = this.GetAbilityKeyValues() as any;
            if (KeyValues.Element) { this.element_type = tonumber(KeyValues.Element) }

            for (let i = 0; i < 6; i++) {
                let hAbility = this.caster.GetAbilityByIndex(i);
                if (hAbility == this) {
                    this.slot_index = i;
                    break
                }
            }
            GameRules.ArmsCombo.AddComboAbility(this.caster, this.GetAbilityName())
            // GameRules.NewArmsEvolution.SetElementBondDate(this.player_id, this.element_type, 1, this.slot_index);
            if (this.element_type != 0) {
                // GameRules.CustomOverrideAbility.UpdateOverrideAbility(this.caster, this.GetAbilityName());
            }

            this.InitCustomAbilityData();
        }

        this.UpdateDamageFormula()
        this.UpdataCustomKeyValue()
    }

    /** 初始化自定义设置 */
    InitCustomAbilityData() { }
    /** 更新自定义KV值 */
    UpdataCustomKeyValue() { }
    /** 更新伤害公式 */
    UpdateDamageFormula() {
        let KeyValues = this.GetAbilityKeyValues() as any;
        if (KeyValues.DamageFormula) { this.dmg_formula = KeyValues.DamageFormula; }

    }

    // InitCustomAbilityData() { }
    RemoveSelf(): void {
        const hCaster = this.GetCaster();
        const public_arms = hCaster.FindAbilityByName("public_arms") as public_arms;
        public_arms.AffectedRemove(this);
        public_arms.ArmsRemove(this);

        // 移除该技能的施法事件
        let index = hCaster.ArmsExecutedList.indexOf(this);
        if (index != -1) { hCaster.ArmsExecutedList.splice(index, 1) }

        // 移除onattack事件
        let attack_index = hCaster.OnAttackList.indexOf(this);
        if (attack_index != -1) { hCaster.OnAttackList.splice(attack_index, 1) }

        // 移除onkill
        let kill_index = hCaster.OnKillList.indexOf(this);
        if (kill_index != -1) { hCaster.OnKillList.splice(kill_index, 1) }

        GameRules.ArmsCombo.RemoveCheckComboSets(hCaster, this);
        if (this.element_type && this.element_type > 0) {
            // GameRules.NewArmsEvolution.SetElementBondDate(this.player_id, this.element_type, -1, this.slot_index)
        }

        this._RemoveSelf();
    }

    _RemoveSelf() { }

    GetIntrinsicModifierName(): string {
        return "modifier_" + this.GetName()
    }


    _ArmsEffectStart(enemy_count: number, min_distance: number): void {
        this._ArmsEffectStart_Before(enemy_count, min_distance)
    }

    _ArmsEffectStart_Before(enemy_count: number, min_distance: number) {
        // print("ability", this.GetAbilityName(), "trigger_distance:", this.trigger_distance, "min_distance", min_distance)
        // print("attack_range", this.caster.GetBaseAttackRange())
        if (this.trigger_distance == 0 || min_distance <= this.trigger_distance) {
            this.ArmsActTime = GameRules.GetDOTATime(false, false) + this.arms_cd;
            this.OnArmsInterval();
            for (let arms_ability of this.caster.ArmsExecutedList) {
                (arms_ability as this).OnArmsExecuted();
            }
        }
    }

    // ArmsEffectStart() { }
    // OnArmsInterval(event: ModifierAttackEvent){}
    // ArmsEffectStart_After() { }

    _AffectedEffectStart(event: ModifierAttackEvent) {
        this._AffectedEffectStart_Before()
        this.OnAffected(event)
        this._AffectedEffectStart_After()
    }
    _AffectedEffectStart_Before() {
        this.AffectedActTime = GameRules.GetDOTATime(false, false) + this.arms_cd;
    }
    _AffectedEffectStart_After() { }



    RegisterEvent(event_list: MdfEventTyps[]) {
        if (event_list.indexOf("OnArmsInterval") != -1) {
            const public_arms = this.caster.FindAbilityByName("public_arms") as public_arms;
            public_arms.ArmsInsert(this)
        }

        if (event_list.indexOf("OnAffected") != -1) {
            const public_arms = this.caster.FindAbilityByName("public_arms") as public_arms;
            public_arms.AffectedInsert(this)
        }

        if (event_list.indexOf("OnArmsExecuted") != -1) {
            let index = this.caster.ArmsExecutedList.indexOf(this);
            if (index == -1) { this.caster.ArmsExecutedList.push(this) }
        }
        //onkill
        if (event_list.indexOf("OnKill") != -1) {
            let index = this.caster.OnKillList.indexOf(this);
            if (index == -1) { this.caster.OnKillList.push(this) }
        }

        // onatt
        if (event_list.indexOf("OnAttackStart") != -1) {
            let index = this.caster.OnAttackList.indexOf(this);
            if (index == -1) { this.caster.OnAttackList.push(this) }
        }
    }

    /** 周期性技能 可触发`OnArmsExecuted` */
    OnArmsInterval() { }
    /** 受到伤害 */
    OnAffected(event: ModifierAttackEvent) { }
    /** 当有火力技触发时 */
    OnArmsExecuted() { }
    OnKill(hTarget: CDOTA_BaseNPC) { }
    OnKillOfAbility(hTarget: CDOTA_BaseNPC) { }
    OnAttackStart(hTarget: CDOTA_BaseNPC): void { }
    OnDeath() { }

    UpdateAbilityDamage() {
        this.ability_damage = this.GetAbilityDamage();
    }

    GetAbilityDamage() {
        if (this.dmg_formula == null) {
            return 0;
        } else if (type(this.dmg_formula) == "number") {
            return tonumber(this.dmg_formula);
        }
        let tableData: { [name: string]: number; } = {};
        // 英雄等级
        tableData = this.caster.custom_attribute_value;
        tableData["Hlv"] = this.caster.GetLevel();
        tableData["AttackDamage"] = this.caster.GetAverageTrueAttackDamage(null);
        let res_number = eval(this.dmg_formula, tableData) ?? 0;
        return res_number;
    }

}

export class BaseArmsModifier extends BaseModifier {

    caster: CDOTA_BaseNPC;
    item_key: string;
    buff_key: string;
    ability: BaseArmsAbility;
    player_id: PlayerID;

    IsHidden(): boolean {
        return true
    }

    GetAttributes(): ModifierAttribute {
        return ModifierAttribute.MULTIPLE + ModifierAttribute.PERMANENT
    }

    OnCreated(params: any): void {
        this.caster = this.GetCaster();
        this.ability = this.GetAbility() as BaseArmsAbility;
        this.player_id = this.caster.GetPlayerOwnerID();
        this.item_key = "item_" + this.GetAbility().entindex();
        this.buff_key = DoUniqueString("buff_" + this.GetAbility().GetAbilityName());
        
        this.C_OnCreatedBefore(params);
        if (IsServer()) {
            this.ability.buff = this;
            let hAbility = this.GetAbility() as BaseArmsAbility;
            hAbility.buff = this;
            // let ability_attr = GameRules.CustomAttribute.GetAbilityAttribute(this.GetAbility().GetAbilityName());
            // GameRules.CustomAttribute.SetAttributeInKey(this.caster, this.item_key, ability_attr);
            this.C_UpdateKeyvalue()
            this.C_OnCreated(params)
        }

    }

    OnRefresh(params: object): void {
        if (IsServer()) {
            this.C_UpdateKeyvalue();
        }
    }

    C_UpdateKeyvalue() { }
    C_OnCreatedBefore(params: any) { }
    C_OnCreated(params: any) { }

    OnRemoved(): void {
        if (!IsServer()) { return }
        this.C_OnRemovedBefore()
    }

    C_OnRemovedBefore() {
        if (this.caster.IsNull() == true) { return }
        GameRules.CustomAttribute.DelAttributeInKey(this.caster, this.item_key);
        this.C_UnRegisterOnKilled();
        this.C_OnRemoved();
    }

    C_OnRemoved() { }

    C_RegisterOnKilled() {
        // print("C_RegisterOnKilled", this.GetName(), this)
        this.caster.KillOnMdfList.push(this)
    }

    C_UnRegisterOnKilled() {
        let mdf_index = this.caster.KillOnMdfList.indexOf(this);
        if (mdf_index != -1) { this.caster.KillOnMdfList.splice(mdf_index, 1) }
    }

    C_OnKilled(hTarget: CDOTA_BaseNPC) { }


    C_RegisterOnAttack() {

    }

    C_RegisterOnAttackStart() {

    }

    C_RegisterOnAttacked() {

    }
}


// 属性
@registerAbility()
export class public_arms extends BaseAbility {

    caster: CDOTA_BaseNPC;

    ArmsList: CDOTABaseAbility[];
    AffectedList: CDOTABaseAbility[];


    GetIntrinsicModifierName(): string {
        return "modifier_public_arms"
    }

    OnUpgrade(): void {
        if (this.caster == null) {
            this.caster = this.GetCaster();
            this.ArmsList = [];
            this.AffectedList = [];
            this.caster.ArmsExecutedList = [];
            this.caster.OnKillList = [];

        }
    }

    ArmsInsert(hAbility: CDOTABaseAbility) {
        let iIndex = this.ArmsList.indexOf(hAbility);
        if (iIndex == -1) { this.ArmsList.push(hAbility) }
    }

    ArmsRemove(hAbility: CDOTABaseAbility) {
        let iIndex = this.ArmsList.indexOf(hAbility);
        if (iIndex != -1) { this.ArmsList.splice(iIndex, 1); }
    }

    AffectedInsert(hAbility: CDOTABaseAbility) {
        let iIndex = this.AffectedList.indexOf(hAbility);
        if (iIndex == -1) { this.AffectedList.push(hAbility) }
    }

    AffectedRemove(hAbility: CDOTABaseAbility) {
        let iIndex = this.AffectedList.indexOf(hAbility);
        if (iIndex != -1) { this.AffectedList.splice(iIndex, 1); }
    }



}

@registerModifier()
export class modifier_public_arms extends BaseModifier {

    team: DotaTeam;
    caster: CDOTA_BaseNPC;
    search_range: number;
    player_id: PlayerID;

    timer: number;
    hAbility: public_arms;

    IsHidden(): boolean { return true }

    OnCreated(params: object): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        if (this.caster.KillOnMdfList == null) { this.caster.KillOnMdfList = [] }
        if (this.caster.OnAttackList == null) { this.caster.OnAttackList = [] }
        this.player_id = this.caster.GetPlayerOwnerID();
        this.team = this.caster.GetTeam();
        this.hAbility = this.GetAbility() as public_arms;
        this.StartIntervalThink(0.1)
    }

    OnRefresh(params: object): void {
        if (!IsServer()) { return }
        this.StartIntervalThink(0.1)
    }

    OnIntervalThink(): void {
        let hParent = this.GetParent();
        if (!hParent.IsAlive()) { this.StartIntervalThink(-1) }
        // let enemies = FindUnitsInRadius(
        //     this.team,
        //     this.caster.GetAbsOrigin(),
        //     null,
        //     1200,
        //     UnitTargetTeam.ENEMY,
        //     UnitTargetType.BASIC + UnitTargetType.HERO,
        //     UnitTargetFlags.NONE,
        //     FindOrder.CLOSEST,
        //     false
        // );
        // let min_distance = 0
        // if (enemies.length > 0) {
        //     min_distance = (this.caster.GetAbsOrigin() - enemies[0].GetAbsOrigin() as Vector).Length2D();
        // }

        let fGameTime = GameRules.GetDOTATime(false, false);
        for (let [index, hArmsAbility] of ipairs(this.hAbility.ArmsList)) {
            if ((hArmsAbility.ArmsActTime ?? 0) <= fGameTime) {
                (hArmsAbility as BaseArmsAbility)._ArmsEffectStart(1, 0);
            }
        }
    }

    DeclareFunctions(): ModifierFunction[] {
        return [
            ModifierFunction.INCOMING_DAMAGE_PERCENTAGE,
            // ModifierFunction.ON_ABILITY_EXECUTED
        ]
    }

    GetModifierIncomingDamage_Percentage(event: ModifierAttackEvent): number {
        let fGameTime = GameRules.GetDOTATime(false, false);
        for (let hAffectedAbility of this.hAbility.AffectedList) {
            if ((hAffectedAbility.AffectedActTime ?? 0) <= fGameTime) {
                (hAffectedAbility as BaseArmsAbility)._AffectedEffectStart(event)
            }
        }
        return 0
    }

}

/** Arms Dot伤害模版 */
export class BaseArmsMdf_Dot extends BaseModifier {

    dot_damage: number
    dot_interval: number

    hAbility: CDOTABaseAbility;

    parent: CDOTA_BaseNPC;
    caster: CDOTA_BaseNPC;

    OnCreated(params: any): void {
        if (!IsServer()) { return }
        this.caster = this.GetCaster();
        this.parent = this.GetParent();
        this.hAbility = this.GetAbility();
        this.dot_damage = params.dot_damage;
        this.dot_interval = params.dot_interval;
        this.StartIntervalThink(this.dot_interval)
    }

    OnRefresh(params: any): void {
        if (!IsServer()) { return }
        this.dot_damage = params.dot_damage;
    }

    OnIntervalThink(): void {
        ApplyCustomDamage({
            victim: this.parent,
            attacker: this.caster,
            damage: this.dot_damage,
            damage_type: DamageTypes.MAGICAL,
            ability: this.GetAbility(),
            // element_type: this.element_type,
            is_primary: false,
            special_effect: true,
        });
    }
}