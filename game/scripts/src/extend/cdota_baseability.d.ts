declare interface CDOTABaseAbility extends CBaseEntity {

    element_type:ElementTypeEnum
    ArmsActTime: number;
    
    _ArmsEffectStart(): void;
    ArmsEffectStart(): void;
    ArmsEffectStart_Before(): void;
    ArmsEffectStart_After(): void;

    GetAbilityDamage(): number;
    // _OnEquip(): void;
    // _OnUnequip(): void;

}