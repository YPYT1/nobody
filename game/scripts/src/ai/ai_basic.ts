/** @noSelfInFile */
declare const thisEntity: CDOTA_BaseNPC;

Object.assign(getfenv(), {
    Spawn: (entityKeyValues: any) => {
        Spawn(entityKeyValues);
    },
});

export function Spawn(entityKeyValues: any) {
    if (!IsServer()) { return; }
    if (!thisEntity) { return; }
    thisEntity.RemoveAbility("twin_gate_portal_warp")
    // if (thisEntity.GetTeamNumber() == DotaTeam.GOODGUYS) { return }
    // if (thisEntity.HasMovementCapability()) { return }
    //空中视野
    thisEntity.SetAcquisitionRange(9999)
    thisEntity.SetShouldDoFlyHeightVisual(true)
    // 判断是否有可以释放的技能
    // thisEntity.SetThink("AiThink", this, "AiThink", 1);
    // thisEntity.SetContextThink(DoUniqueString("AiThink"), AiThink, 0)
    new BasicAI(thisEntity);
}

class BasicAI {

    me: CDOTA_BaseNPC;

    constructor(hUnit: CDOTA_BaseNPC) {
        this.me = hUnit;
        this.me.SetThink("AiThink", this, "AiThink", 0);
    }

    AiThink() {
        if (this.me.IsAlive() == false) { return 1; }
        if (this.me.IsChanneling()) { return 0.3; }
        if (this.me.IsAttacking()) { return 1 }
        return this.OnBaseThink();
    }

    OnBaseThink(): number {
        let attackTarget = this.me.GetAttackTarget();
        let ForceAttackTarget = this.me.GetForceAttackTarget();
        // print("attackTarget", attackTarget, "ForceAttackTarget", ForceAttackTarget)
        if (ForceAttackTarget == null) {
            let hPlayerHeroes = GetEnemyHeroesInRange(this.me);
            if (hPlayerHeroes.length == 0) {
                return 1;
            }
            this.me.SetForceAttackTarget(hPlayerHeroes[0]);
            this.me.SetAttacking(hPlayerHeroes[0])
            this.me.MoveToTargetToAttack(hPlayerHeroes[0]);
            return 1
        }
        return 1
    }
}

function GetEnemyHeroesInRange(hUnit: CDOTA_BaseNPC, flRange: number = 9999) {
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