/** @noSelfInFile  */
Object.assign(getfenv(), {
    OnCreated: (params: any) => { OnCreated(params); },
    OnDeath: (params: any) => { OnDeath(params); },
    OnKill: (params: any) => { OnKill(params); },
    OnAttack: (params: any) => { OnAttack(params); },
    OnAttackStart: (params: any) => { OnAttackStart(params); },
    OnAttackLanded: (params: any) => { OnAttackLanded(params); },
});


export const OnCreated = (params: CGDatadrivenProps) => {
    print("OnCreated")
}

export const OnDeath = (params: CGDatadrivenProps) => {
    print("OnDeath")
    // for (let i = 0; i < 6; i++) {
    //     let hAbility = params.caster.GetAbilityByIndex(i);

    //     hAbility.OnDeath()
    // }
}

export const OnKill = (params: CGDatadrivenProps) => {
    for (let hAbility of params.caster.OnKillList) {
        hAbility.OnKill(params.target)
    }
}

export const OnAttack = (params: CGDatadrivenProps) => {
    // print("OnAttack")
    for (let hAbility of params.caster.OnAttackList) {
        hAbility.OnAttackStart(params.target)
    }
}

export const OnAttackStart = (params: CGDatadrivenProps) => {
    // print("OnAttackStart")
    

    // 分裂箭
    // let count = 0;
    // let enemies = FindUnitsInRadius(
    //     DotaTeam.GOODGUYS,
    //     params.caster.GetAbsOrigin(),
    //     null,
    //     params.caster.Script_GetAttackRange(),
    //     UnitTargetTeam.ENEMY,
    //     UnitTargetType.HERO + UnitTargetType.BASIC,
    //     UnitTargetFlags.NONE,
    //     FindOrder.ANY,
    //     false
    // )
    // for (let enemy of enemies) {
    //     if (count < 3 && enemy != params.target) {
    //         params.caster.PerformAttack(enemy, true, true, true, true, true, false, false);
    //         count += 1;
    //     }
    // }
}

export const OnAttackLanded = (params: CGDatadrivenProps) => {
    // print("OnAttackLanded")
}