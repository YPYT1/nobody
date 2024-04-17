declare interface CDOTABaseAbility extends CBaseEntity {

    element_type: ElementTypeEnum
    ArmsActTime: number;

    // _ArmsEffectStart(enemy_count: number, min_distance: number): void;
    // ArmsEffectStart(): void;
    // ArmsEffectStart_Before(): void;
    // ArmsEffectStart_After(): void;

    // _AffectedEffectStart(event: ModifierAttackEvent): void;
    /** 受击 */
    // AffectedEffectStart(event: ModifierAttackEvent): void;
    GetAbilityDamage(): number;

    OnAttackStart(hTarget?: CDOTA_BaseNPC): void;
    OnKill(hTarget?: CDOTA_BaseNPC): void;
    // 自身死亡
    OnDeath(): void;
}