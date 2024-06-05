declare interface PanelDataObject {
    [key: string]: any;
}

declare interface PanelDataFunction {
    [key: string]: any;
}

interface Panel {
    displayPanel: Panel;
    offsetX: number;
    offsetY: number;
}


declare interface CScriptBindingPR_Abilities {
    GetCurrentAbilityCharges(nEntityIndex: any): number;
    GetAbilityChargeRestoreTimeRemaining(nEntityIndex: any): number;
    GetAbilityChargeRestoreTime(nEntityIndex: any): number;

    GetMaxAbilityCharges(nEntityIndex: any): number;
    UsesAbilityCharges(nEntityIndex: any): boolean;
}