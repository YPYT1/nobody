declare interface CDOTABaseAbility extends CBaseEntity {

    ArmsActTime: number;
    AffectedActTime: number;

    element_type: ElementTypeEnum
    unit_list: CDOTA_BaseNPC[];
    ability_damage: number;

    GetAbilityDamage(): number;
    OnAttackStart(hTarget?: CDOTA_BaseNPC): void;
    OnKill(hTarget?: CDOTA_BaseNPC): void;
    OnDeath(): void;
}