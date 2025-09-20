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
    PhaseStatus: { hpPct: number; activate: boolean }[];

    /** 技能优先级 */
    AbilityPriority: { [name: string]: number };

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
        this.me.AddActivityModifier('run');
        this._Init();
        this.me.SetContextThink(
            'delay',
            () => {
                this.OnSetupAbilities();
                return null;
            },
            1
        );
        this.me.SetThink('OnBossCommonThink', this, 'OnBossCommonThink', 1);
    }

    _Init() {}

    // 初始化技能和优先级
    OnSetupAbilities() {
        this.me.RemoveAbility('twin_gate_portal_warp');
        const ability_count = this.me.GetAbilityCount();
        for (let i = 0; i < ability_count; i++) {
            const hAbility = this.me.GetAbilityByIndex(i);
            if (hAbility) {
                const ability_name = hAbility.GetAbilityName();
                hAbility.SetLevel(1);
                hAbility.SetActivated(true);
                if (!hAbility.IsPassive() && !hAbility.IsHidden()) {
                    this.AbilityPriority[ability_name] = i;
                }
            }
        }
    }

    OnBaseThink(): number {
        if (!this.me || this.me.IsNull() || !this.me.IsAlive()) {
            return -1;
        }
        const order = null;
        if (this.nLastHealthPct > this.me.GetHealthPercent()) {
            this.nLastHealthPct = this.me.GetHealthPercent();
            this.OnHealthPercentThreshold(this.nLastHealthPct);
        }

        this.hPlayerHeroes = GetEnemyHeroesInRange(this.me, this.flAggroAcquireRange);
        // print("this.hPlayerHeroes ", this.hPlayerHeroes.length)
        if (this.hPlayerHeroes.length == 0) {
            // 普通攻击
            return 0.3;
        }
        const AbilitiesReady = this.GetReadyAbilitiesAndItems();
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
            const hAbility = AbilitiesReady[0];
            const ability_behavior = hAbility.GetBehaviorInt();
            let Order: ExecuteOrderOptions;
            const channel_time = hAbility.GetChannelTime();
            const cast_point = hAbility.GetCastPoint();
            const ability_range = hAbility.GetCastRange(this.me.GetOrigin(), this.me);
            const enemies = FindUnitsInRadius(
                this.me.GetTeam(),
                this.me.GetOrigin(),
                null,
                ability_range,
                UnitTargetTeam.ENEMY,
                UnitTargetType.HERO + UnitTargetType.BASIC,
                UnitTargetFlags.NONE,
                FindOrder.ANY,
                false
            );
            // print("enemies", enemies.length, hAbility.GetAbilityName());
            if (enemies.length == 0) {
                ExecuteOrderFromTable({
                    UnitIndex: this.me.entindex(),
                    OrderType: UnitOrder.ATTACK_MOVE,
                    Position: this.hPlayerHeroes[0].GetAbsOrigin(),
                    Queue: false,
                });
                return 0.3;
            }
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

        return 0.5;
    }

    OnBossCommonThink() {
        if (this.me.IsAlive() == false) {
            return 1;
        }
        if (GameRules.IsGamePaused()) {
            return 0.1;
        }
        if (this.me.IsChanneling()) {
            return 0.1;
        }
        return this.OnBaseThink();
    }

    /**
     * 获取当前能释放的技能
     * @returns
     */
    GetReadyAbilitiesAndItems() {
        const AbilitiesReady: CDOTABaseAbility[] = [];
        // DeepPrintTable(this.AbilityPriority);
        for (const n of $range(0, this.me.GetAbilityCount() - 1)) {
            const hAbility = this.me.GetAbilityByIndex(n);

            if (
                hAbility &&
                hAbility.IsFullyCastable() &&
                !hAbility.IsPassive() &&
                !hAbility.IsHidden() &&
                hAbility.IsActivated() &&
                hAbility.IsCooldownReady()
            ) {
                if (this.AbilityPriority[hAbility.GetAbilityName()] != null) {
                    table.insert(AbilitiesReady, hAbility);
                }
            }
        }
        if (AbilitiesReady.length > 1) {
            table.sort(AbilitiesReady, (h1, h2) => {
                const caster_range1 = h1.GetCastRange(this.me.GetAbsOrigin(), this.me);
                const caster_range2 = h2.GetCastRange(this.me.GetAbsOrigin(), this.me);
                // let nAbility1Priority = this.AbilityPriority[h1.GetAbilityName()];
                // let nAbility2Priority = this.AbilityPriority[h2.GetAbilityName()];
                return caster_range1 > caster_range2;
            });

            // this.AbilityPriority[AbilitiesReady[0].GetAbilityName()] += this.me.GetAbilityCount();
        }

        return AbilitiesReady;
    }

    // 生命值首次达到一定百分比时转阶段或者多新技能
    OnHealthPercentThreshold(nPct: number) {
        //
        for (const hPhase of this.PhaseStatus) {
            if (hPhase.activate == false && hPhase.hpPct > nPct) {
                hPhase.activate = true;
                this.OnActivationBossNewPhase(hPhase.hpPct);
            }
        }
    }

    /** 激活对应BOSS的阶段 */
    OnActivationBossNewPhase(hpPct: number) {}

    GetSpellCastTime(hSpell: CDOTABaseAbility) {
        const flCastPoint = math.max(0.25, hSpell.GetCastPoint());
        return flCastPoint + 0.01;
    }
}

function GetEnemyHeroesInRange(hUnit: CDOTA_BaseNPC, flRange: number = 1500) {
    const enemies = FindUnitsInRadius(
        hUnit.GetTeamNumber(),
        hUnit.GetAbsOrigin(),
        null,
        flRange,
        UnitTargetTeam.ENEMY,
        UnitTargetType.HERO,
        UnitTargetFlags.NONE,
        FindOrder.CLOSEST,
        false
    );
    return enemies;
}
