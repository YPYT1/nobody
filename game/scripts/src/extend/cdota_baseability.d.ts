declare interface CDOTABaseAbility extends CBaseEntity {

    element_type: ElementTypeEnum
    ArmsActTime: number;
    unit_list:CDOTA_BaseNPC[];
    ability_damage:number;

    GetAbilityDamage(): number;
    OnAttackStart(hTarget?: CDOTA_BaseNPC): void;
    OnKill(hTarget?: CDOTA_BaseNPC): void;
    OnDeath(): void;
}