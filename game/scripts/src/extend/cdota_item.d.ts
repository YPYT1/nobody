declare interface CDOTA_Item extends CDOTABaseAbility {

    /** 触发时间 */
    ArmsActTime: number;

    _ArmsEffectStart(): void;
    ArmsEffectStart(): void;
    ArmsEffectStart_Before(): void;
    ArmsEffectStart_After(): void;

    _OnEquip(): void;
    _OnUnequip(): void;
}