declare interface PanelDataObject {
    [key: string]: any;
}

interface Panel {
    displayPanel: Panel;
    offsetX: number;
    offsetY: number;
}

interface UICanvas extends Panel {
    ClearJS(cstring: string): void;
    DrawSoftLinePointsJS(count1: number, tuples2: number[], float3: number, float4: number, color5: string): void;
}

declare interface CScriptBindingPR_Abilities {
    GetCurrentAbilityCharges(nEntityIndex: any): number;
    GetAbilityChargeRestoreTimeRemaining(nEntityIndex: any): number;
    GetAbilityChargeRestoreTime(nEntityIndex: any): number;

    GetMaxAbilityCharges(nEntityIndex: any): number;
    UsesAbilityCharges(nEntityIndex: any): boolean;
}