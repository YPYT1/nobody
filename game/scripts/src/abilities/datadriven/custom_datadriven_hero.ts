/** @noSelfInFile  */
Object.assign(getfenv(), {
    OnCreated: (params: any) => { OnCreated(params); },
    OnDeath: (params: any) => { OnDeath(params); },
    OnAttack: (params: any) => { OnAttack(params); },
    OnAttackStart: (params: any) => { OnAttackStart(params); },
    OnAttacked: (params: any) => { OnAttacked(params); },
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

export const OnAttacked = (params: CGDatadrivenProps) => {
    print("OnAttacked")
}