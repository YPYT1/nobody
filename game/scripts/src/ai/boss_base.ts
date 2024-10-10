export class CBossBase {

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
    PhaseStatus: { hpPct: number, activate: boolean; }[];

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
        }, 1.5);
        this.me.SetThink("OnBossCommonThink", this, "OnBossCommonThink", 1);
    }

    _Init() { }

    // 初始化技能,和血量阶段
    OnSetupAbilities() {
        let ability_count = this.me.GetAbilityCount();
        // for (let i = 0; i < ability_count; i++) {
        //     let hAbility = this.me.GetAbilityByIndex(i);
        //     if (hAbility) {
        //         let ability_name = hAbility.GetAbilityName();
        //         hAbility.SetLevel(1);
        //         hAbility.SetActivated(true);
        //         if (!hAbility.IsPassive() && !hAbility.IsHidden()) {
        //             this.AbilityPriority[ability_name] = i;
        //         }
        //     }
        // }
    }

    OnBaseThink(): number {
        if (!this.me || this.me.IsNull()) {
            return - 1;
        }
        // let order = null;
        // if (this.nLastHealthPct > this.me.GetHealthPercent()) {
        //     this.nLastHealthPct = this.me.GetHealthPercent();
        //     this.OnHealthPercentThreshold(this.nLastHealthPct);
        // }

        this.hPlayerHeroes = GetEnemyHeroesInRange(this.me, this.flAggroAcquireRange);
        // print("this.hPlayerHeroes ", this.hPlayerHeroes.length)
        if (this.hPlayerHeroes.length == 0) {
            // 普通攻击
            return 0.3;
        }
        let AbilitiesReady = this.GetReadyAbilitiesAndItems();
        print("AbilitiesReady ", AbilitiesReady.length);
        

        return 0.5;
    }

    OnBossCommonThink() {
        if (this.me.IsAlive() == false) { return 1; }
        if (GameRules.IsGamePaused()) { return 0.1; }
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

    // 生命值首次达到一定百分比时转阶段或者多新技能
    OnHealthPercentThreshold(nPct: number) {
        //
        for (let hPhase of this.PhaseStatus) {
            if (hPhase.activate == false && hPhase.hpPct > nPct) {
                hPhase.activate = true;
                this.OnActivationBossNewPhase(hPhase.hpPct);
            }
        }
    }

    /** 激活对应BOSS的阶段 */
    OnActivationBossNewPhase(hpPct: number) { }

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