/** @noSelfInFile  */

import { modifier_picture_abilities } from "../../modifier/picture/modifier_picture_abilities";
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
    const hUnit = params.caster;
    let picture_buff = hUnit.FindModifierByName("modifier_picture_abilities") as modifier_picture_abilities;
    print("picture_buff", picture_buff)
    if (picture_buff) {
        picture_buff._OnDeath()
    }
    // for (let i = 0; i < 6; i++) {
    //     let hAbility = params.caster.GetAbilityByIndex(i);

    //     hAbility.OnDeath()
    // }
}

export const OnKill = (params: CGDatadrivenProps) => {
    // for (let hAbility of params.caster.OnKillList) {
    //     hAbility.OnKill(params.target)
    // }
}

export const OnAttack = (params: CGDatadrivenProps) => {
    // print("OnAttack")
    for (let hAbility of params.caster.OnAttackList) {
        hAbility.OnAttackStart(params.target)
    }
}

export const OnAttackStart = (params: CGDatadrivenProps) => {
    // print("OnAttackStart")
}

export const OnAttackLanded = (params: CGDatadrivenProps) => {
    // print("OnAttackLanded")
}