/** @noSelfInFile */
import { CBossBase } from "./boss_base";
import * as NpcUnitsCustom from "./../json/npc_units_custom.json"
import * as MapInfoDifficulty from "./../json/config/map_info_difficulty.json"

declare const thisEntity: CDOTA_BaseNPC;

Object.assign(getfenv(), {
    Spawn: (entityKeyValues: any) => {
        Spawn(entityKeyValues);
    },
});

export function Spawn(entityKeyValues: any) {
    if (!IsServer()) { return; }
    if (!thisEntity) { return; }
    let BossAI = new CustomAI_Boss(thisEntity, 0.5);
}

export class CustomAI_Boss {

    me: CDOTA_BaseNPC;
    sUnitName: string;
    flDefaultInterval: number;
    nLastHealthPct: number;
    flInitialAcquireRange: number;
    flAggroAcquireRange: number;
    hPlayerHeroes: CDOTA_BaseNPC[];
    ability_list: CDOTABaseAbility[];
    hCurrorder: UnitOrder;
    /** Boss血量百分比阶段 */
    boss_phase: number[];
    /** 阶段状态 */
    PhaseStatus: { hpPct: number, activate: boolean; abilityname: string, mdf?: CDOTA_Buff }[];

    /** 技能优先级 */
    AbilityPriority: { [name: string]: number; };


    constructor(hUnit: CDOTA_BaseNPC, flInterval: number) {
        this.me = hUnit;
        this.flDefaultInterval = flInterval;
        this.ability_list = [];
        this.AbilityPriority = {};
        this.hPlayerHeroes = [];
        this.PhaseStatus = [];
        this.nLastHealthPct = 10000;
        this.flInitialAcquireRange = 1800;
        this.flAggroAcquireRange = 4500;
        this.hCurrorder = null;
        this.sUnitName = hUnit.GetUnitName();
        this.me.AddActivityModifier("run");
        
        // print("CBossBase constructor")
        this._Init();
        this.me.SetContextThink("delay", () => {
            this.OnSetupAbilities();
            return null;
        }, 0.5);
        this.me.SetThink("OnBossCommonThink", this, "OnBossCommonThink", 1);
    }

    _Init() { }

    // 初始化技能和优先级
    OnSetupAbilities() {
        // 获取技能池子
        this.me.RemoveAbility("twin_gate_portal_warp");
        let ability_pool: string[] = []
        for (let i = 1; i < this.me.GetAbilityCount(); i++) {
            let hAbility = this.me.GetAbilityByIndex(i);
            if (hAbility) {
                let ability_name = hAbility.GetAbilityName();
                ability_pool.push(ability_name)
            }
        }
        // 打乱技能池子
        ArrayScramblingByString(ability_pool)

        // 读取当前难度信息
        let game_setting = CustomNetTables.GetTableValue("game_setting", "game_mode");
        let difficulty = game_setting.difficulty;
        let diff_data = MapInfoDifficulty[difficulty as "101"]
        let is_final = this.me.GetIntAttr("is_final") == 1;
        // 得到当前难度对应的血量阶段
        let boss_hp_phase = is_final ? diff_data.pt_boss : diff_data.ww_boss;
        boss_hp_phase.sort((a, b) => b - a)
        // DeepPrintTable(boss_hp_phase)
        let index = 0
        for (let hp_phase of boss_hp_phase) {
            if (hp_phase != 0) {
                if (ability_pool[index] != null) {
                    this.PhaseStatus.push({ hpPct: hp_phase, activate: false, abilityname: ability_pool[index], mdf: null })
                    index += 1;
                }
            }
        }
        if (boss_hp_phase[0] > 0) {
            const mdf = this.me.AddNewModifier(this.me, null, "modifier_state_boss_phase_hp", {})
            mdf.SetStackCount(boss_hp_phase[0])
        }

    }

    OnBaseThink(): number {
        if (!this.me || this.me.IsNull() || !this.me.IsAlive()) {
            return - 1;
        }
        // let order = null;
        if (this.nLastHealthPct > this.me.GetHealthPercent()) {
            this.nLastHealthPct = this.me.GetHealthPercent();
            return this.OnHealthPercentThreshold(this.nLastHealthPct);
        }

        this.hPlayerHeroes = GetEnemyHeroesInRange(this.me, this.flAggroAcquireRange);
        // print("this.hPlayerHeroes ", this.hPlayerHeroes.length)
        if (this.hPlayerHeroes.length == 0) {
            // 普通攻击
            return 0.3;
        }
        let AbilitiesReady = this.GetReadyAbilitiesAndItems();
        // print("AbilitiesReady ", AbilitiesReady.length);
        if (AbilitiesReady.length == 0) {
            ExecuteOrderFromTable({
                UnitIndex: this.me.entindex(),
                OrderType: UnitOrder.ATTACK_MOVE,
                Position: this.hPlayerHeroes[0].GetAbsOrigin(),
                Queue: false,
            });
            return 1;
        } else {
            // 释放技能

        }

        return 0.5;
    }

    OnBossCommonThink() {
        if (this.me.IsAlive() == false) { return 1; }
        if (GameRules.IsGamePaused()) { return 0.03; }
        if (this.me.IsChanneling()) { return 0.1; }
        return this.OnBaseThink();
    }

    /**
     * 获取当前能释放的技能
     * @returns 
     */
    GetReadyAbilitiesAndItems() {
        let AbilitiesReady: CDOTABaseAbility[] = [];
        // DeepPrintTable(this.AbilityPriority);

        for (const n of $range(0, this.me.GetAbilityCount() - 1)) {
            let hAbility = this.me.GetAbilityByIndex(n);
            // print(hAbility, n)
            if (hAbility == null) { continue }
            if (hAbility.IsFullyCastable()
                && !hAbility.IsPassive()
                && !hAbility.IsHidden()
                && hAbility.IsActivated()
                && hAbility.IsCooldownReady()

            ) {
                if (this.AbilityPriority[hAbility.GetAbilityName()] != null) {
                    table.insert(AbilitiesReady, hAbility);
                }
            }
        }
        // print("GetReadyAbilitiesAndItems", AbilitiesReady.length);
        if (AbilitiesReady.length >= 1) {
            // let AbilityPriority = this.AbilityPriority
            table.sort(AbilitiesReady, (h1, h2) => {
                let caster_range1 = h1.GetCastRange(this.me.GetAbsOrigin(), this.me);
                let caster_range2 = h2.GetCastRange(this.me.GetAbsOrigin(), this.me);
                return caster_range1 > caster_range2;
            });

            this.AbilityPriority[AbilitiesReady[0].GetAbilityName()] += this.me.GetAbilityCount();
        }

        return AbilitiesReady;
    }

    // 生命值首次达到一定百分比时转阶段
    OnHealthPercentThreshold(nPct: number) {
        for (let i = 0; i < this.PhaseStatus.length; i++) {
            let hPhase = this.PhaseStatus[i]

            if (hPhase.activate == false && hPhase.hpPct > nPct) {
                hPhase.activate = true;
                print("hPhase.abilityname",hPhase.abilityname)
                // 该阶段激活,并进行释放技能
                let hAbility = this.me.FindAbilityByName(hPhase.abilityname)
                // 移除锁血
                this.me.RemoveModifierByName("modifier_state_boss_phase_hp");
                // 为下个阶段添加锁血
                if (i < this.PhaseStatus.length - 1) {
                    let nexthPhase = this.PhaseStatus[i + 1];
                    const mdf = this.me.AddNewModifier(this.me, null, "modifier_state_boss_phase_hp", {})
                    mdf.SetStackCount(nexthPhase.hpPct)
                }
                return this.CastAbility(hAbility)
            }
        }

        return this.flDefaultInterval
    }

    /** 激活对应BOSS的阶段 */
    OnActivationBossNewPhase(hpPct: number) { }

    CastAbility(hAbility: CDOTABaseAbility) {
        let ability_behavior = hAbility.GetBehaviorInt();
        let Order: ExecuteOrderOptions;
        let channel_time = hAbility.GetChannelTime();
        let cast_point = hAbility.GetCastPoint();
        let ability_range = hAbility.GetCastRange(this.me.GetOrigin(), this.me);
        let hPlayerHeroes = FindUnitsInRadius(
            this.me.GetTeam(),
            this.me.GetOrigin(),
            this.me,
            ability_range,
            UnitTargetTeam.ENEMY,
            UnitTargetType.HERO,
            UnitTargetFlags.NONE,
            FindOrder.ANY,
            false
        );
        // print("enemies", enemies.length, AbilitiesReady[0].GetAbilityName());
        // if (enemies.length == 0) {
        //     ExecuteOrderFromTable({
        //         UnitIndex: this.me.entindex(),
        //         OrderType: UnitOrder.ATTACK_MOVE,
        //         Position: this.hPlayerHeroes[0].GetAbsOrigin(),
        //         Queue: false,
        //     });
        //     return 0.3;
        // }
        if ((ability_behavior & AbilityBehavior.UNIT_TARGET) == AbilityBehavior.UNIT_TARGET) {
            Order = {
                UnitIndex: this.me.entindex(),
                AbilityIndex: hAbility.entindex(),
                OrderType: UnitOrder.CAST_TARGET,
                TargetIndex: this.hPlayerHeroes[0].entindex(),
                Queue: false,
            };
        } else if ((ability_behavior & AbilityBehavior.POINT) == AbilityBehavior.POINT) {
            Order = {
                UnitIndex: this.me.entindex(),
                AbilityIndex: hAbility.entindex(),
                OrderType: UnitOrder.CAST_POSITION,
                Position: this.hPlayerHeroes[0].GetOrigin(),
                Queue: false,
            };
        } else if ((ability_behavior & AbilityBehavior.NO_TARGET) == AbilityBehavior.NO_TARGET) {
            Order = {
                UnitIndex: this.me.entindex(),
                AbilityIndex: hAbility.entindex(),
                OrderType: UnitOrder.CAST_NO_TARGET,
                Queue: false,
            };
        }
        ExecuteOrderFromTable(Order);
        return cast_point + channel_time + 1.01;
    }

    GetSpellCastTime(hSpell: CDOTABaseAbility) {
        let flCastPoint = math.max(0.25, hSpell.GetCastPoint());
        return flCastPoint + 0.01;
    }
}


function GetEnemyHeroesInRange(hUnit: CDOTA_BaseNPC, flRange: number = 1500) {
    let enemies = FindUnitsInRadius(
        hUnit.GetTeamNumber(),
        hUnit.GetAbsOrigin(),
        null,
        flRange,
        UnitTargetTeam.ENEMY,
        UnitTargetType.HERO,
        UnitTargetFlags.NONE,
        FindOrder.CLOSEST,
        false
    )
    return enemies
}
