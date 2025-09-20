declare interface CGED {
    c2s_test_event: {};

    Development: {
        HeroLevelUp: {
            value: number;
            unit: EntityIndex;
        };

        RespawnHero: { unit: EntityIndex };
        RespawnHeroOfPlayerId: { playerid: PlayerID };
        KillUnit: { unit: EntityIndex };
        AddDummy: { unit: EntityIndex };
        RemoveUnit: { units: EntityIndex[] };
        ReplaceHero: { heroid: number; facetid: number };
        ReplaceAbility: { ability_name: string; order: number; queryUnit: EntityIndex };
        UpgradeAbility: { ability_enti: EntityIndex };
        DeleteAbility: {
            queryUnit: EntityIndex;
            ability_order: number;
        };
        ToggleAbility: {
            queryUnit: EntityIndex;
            ability_order: number;
        };
        CreatedItem: { item_name: string; queryUnit: EntityIndex };
        ModiyAttribute: { unit: EntityIndex; attr_object: CustomAttributeTableType };
        ModiyOverrideSpecialValue: {
            special_key: OverrideSpecialKeyTypes;
            special_type: OverrideSpecialBonusTypes;
            special_value: number;
        };
        WarpUnit: {
            x: number;
            y: number;
            queryUnit: EntityIndex;
        };
    };

    BasicRules: {
        /** 英雄移动 */
        MoveState: {
            Direction: CMoveDirection;
            State: 0 | 1;
        };
    };

    ResourceSystem: {
        GetPlayerResource: {};
    };

    CustomOverrideAbility: {
        GetUpdateSpecialValue: {};
    };

    CMsg: {
        GetEntityListHealthBar: {};
        GetTopCountdown: {};
        GetDamageRecord: {};
    };

    MissionSystem: {
        GetCurrentMission: {};
    };
}

/** 自定义方法 */
interface CDOTA_PanoramaScript_GameEvents {
    SendCustomGameEventToServer<T1 extends keyof CGED, T2 extends keyof CGED[T1], T3 extends CGED[T1][T2]>(
        pEventName: T1,
        eventData: {
            event_name: T2;
            params: T3;
        }
    ): void;
}
