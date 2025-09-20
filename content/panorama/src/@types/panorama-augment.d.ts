type CgedEvent<K extends keyof CGED> = {
    [P in keyof CGED[K]]: {
        event_name: P;
        params: CGED[K][P];
    };
}[keyof CGED[K]];

declare global {
    interface CustomGameEventDeclarations {
        ServiceInterface: CgedEvent<'ServiceInterface'>;
        ServiceTalent: CgedEvent<'ServiceTalent'>;
        ServiceSoul: CgedEvent<'ServiceSoul'>;
        HeroTalentSystem: CgedEvent<'HeroTalentSystem'>;
        ArchiveService: CgedEvent<'ArchiveService'>;
        Development: CgedEvent<'Development'>;
        ResourceSystem: CgedEvent<'ResourceSystem'>;
        CustomOverrideAbility: CgedEvent<'CustomOverrideAbility'>;
        CMsg: CgedEvent<'CMsg'>;
        MissionSystem: CgedEvent<'MissionSystem'>;
        MapChapter: CgedEvent<'MapChapter'>;
        BasicRules: CgedEvent<'BasicRules'>;
        GameInformation: CgedEvent<'GameInformation'>;
        InvestSystem: CgedEvent<'InvestSystem'>;
        MysticalShopSystem: CgedEvent<'MysticalShopSystem'>;
        NewArmsEvolution: CgedEvent<'NewArmsEvolution'>;
        RuneSystem: CgedEvent<'RuneSystem'>;
    }

    interface DollarStatic {
        RegisterEventHandler(
            eventName: 'DragStart' | 'DragEnter' | 'DragDrop' | 'DragLeave' | 'DragEnd',
            panel: PanelBase | string,
            callback: (panel: Panel, draggedPanel: Panel) => boolean | void,
        ): void;

        RegisterForUnhandledEvent(eventName: string, callback: (...args: any[]) => void): UnhandledEventListenerID;
    }
}

export {};
