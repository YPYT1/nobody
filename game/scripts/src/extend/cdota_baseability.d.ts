declare interface CDOTABaseAbility extends CBaseEntity {
    /** 主动类冷却 */
    ArmsActTime: number;
    /** 受伤类冷却 */
    AffectedActTime: number;

    element_type: ElementTypes;
    damage_type: DamageTypes;
    unit_list: CDOTA_BaseNPC[];
    ability_damage: number;

    IntrinsicMdf: CDOTA_Buff;

    /** 自定义技能类型 */
    custom_ability_types: {
        skv_type: {
            [key in CustomHeroAbilityTypes]: boolean
        },
        element_type: ElementTypes[]
        cache?: {
            [key: string]: number
        }
    }

    GetAbilityDamage(): number;
    OnAttackStart(hTarget?: CDOTA_BaseNPC): void;
    OnKill(hTarget?: CDOTA_BaseNPC): void;
    OnDeath(): void;

    GetTypesAffixValue<
        T1 extends keyof SpecialvalueOfTableProps,
        T2 extends keyof SpecialvalueOfTableProps[T1]
    >(flBaseValue: number, skv_affix: T1, skv_key: T2): number;

    GetSpecialValueForTypes<
        T1 extends keyof SpecialvalueOfTableProps,
        T2 extends keyof SpecialvalueOfTableProps[T1]
    >(name: string, skv_affix: T1, skv_key: T2): number;
}