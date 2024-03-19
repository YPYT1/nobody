declare interface CGED {

    c2s_test_event: {};

    Development: {
        HeroLevelUp: {
            value: number,
            unit: EntityIndex,
        },

        RespawnHero: { unit: EntityIndex },
        KillUnit: { unit: EntityIndex },
        AddDummy: { unit: EntityIndex },
        RemoveUnit: { units: EntityIndex[] },
        ReplaceHero: { heroid: number },
        ReplaceAbility: { ability_name: string, order: number, queryUnit: EntityIndex },
        UpgradeAbility: { ability_enti: EntityIndex },
        DeleteAbility: { ability_enti: EntityIndex },
        CreatedItem: { item_name: string, queryUnit: EntityIndex };
        ModiyAttribute: { unit: EntityIndex, attr_object: CustomAttributeTableType }
    }
}


/** 自定义方法 */
interface CDOTA_PanoramaScript_GameEvents {

    SendCustomGameEventToServer<
        T1 extends keyof CGED,
        T2 extends keyof CGED[T1],
        T3 extends CGED[T1][T2],
    >(
        pEventName: T1,
        eventData: {
            event_name: T2;
            params: T3;
        },
    ): void;
}