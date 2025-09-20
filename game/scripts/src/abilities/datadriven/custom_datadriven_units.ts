/** @noSelfInFile  */
Object.assign(getfenv(), {
    OnUpgrade: (params: any) => {
        OnUpgrade(params);
    },
    OnAbilityExecuted: (params: any) => {
        OnAbilityExecuted(params);
    },
    OnCreated: (params: any) => {
        OnCreated(params);
    },
    OnDeath: (params: any) => {
        OnDeath(params);
    },
});

export const OnUpgrade = (params: CGDatadrivenProps) => {
    // print("custom_datadriven_units OnUpgrade")
};

export const OnAbilityExecuted = (params: CGDatadrivenProps) => {
    // print("custom_datadriven_units OnAbilityExecuted")
};

export const OnCreated = (params: CGDatadrivenProps) => {
    // print("custom_datadriven_units OnCreated")
};

export const OnDeath = (params: CGDatadrivenProps) => {
    // print("custom_datadriven_units OnDeath")
    // const hKiller = params.attacker;
    // const hUnit = params.unit;
    // const amount = RandomInt(1, 50);
    // SendOverheadEventMessage(
    //     hKiller.GetPlayerOwner(),
    //     OverheadAlert.GOLD,
    //     hUnit,
    //     amount,
    //     null
    // );
};
