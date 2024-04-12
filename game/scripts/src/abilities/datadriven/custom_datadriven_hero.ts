/** @noSelfInFile  */
Object.assign(getfenv(), {
    OnCreated: (params: any) => { OnCreated(params); },
    OnDeath: (params: any) => { OnDeath(params); },
    OnAttack: (params: any) => { OnAttack(params); },
    OnAttackStart: (params: any) => { OnAttackStart(params); },
    OnAttackLanded: (params: any) => { OnAttackLanded(params); },
});


export const OnCreated = (params: CGDatadrivenProps) => {
    print("OnCreated")
}

export const OnDeath = (params: CGDatadrivenProps) => {
    print("OnDeath")
}

export const OnAttack = (params: CGDatadrivenProps) => {
    print("OnAttack")
}

export const OnAttackStart = (params: CGDatadrivenProps) => {
    print("OnAttackStart")
}

export const OnAttackLanded = (params: CGDatadrivenProps) => {
    print("OnAttackLanded")
}