declare interface CDOTABaseAbility extends CBaseEntity {

    /** 主动类冷却 */
    ArmsActTime: number;
    /** 受伤类冷却 */
    AffectedActTime: number;

    element_type: ElementTypeEnum
    unit_list: CDOTA_BaseNPC[];
    ability_damage: number;

    GetAbilityDamage(): number;
    OnAttackStart(hTarget?: CDOTA_BaseNPC): void;
    OnKill(hTarget?: CDOTA_BaseNPC): void;
    OnDeath(): void;
}