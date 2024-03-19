/** @noSelfInFile  */

// creep_unit
Object.assign(getfenv(), {
    OnEquip: (params: any) => { OnEquip(params); },
    OnUnEquip: (params: any) => { OnUnEquip(params); },
    OnSpellStart: (params: any) => { OnSpellStart(params); },
    OnProjectileHitUnit: (params: any) => { OnProjectileHitUnit(params); },
});

export function OnEquip(params: CGDatadrivenProps) {
    const hUnit = params.caster;
    const hItem = params.ability;
    if (hItem.IsItem()) {
        hItem.ArmsTriggerTime = GameRules.GetDOTATime(false, false) + 1;
    }
    print("[datadriven Item]:", params.ability.GetAbilityName(), "OnEquip", hItem.GetOwnerEntity().entindex())
}

export function OnUnEquip(params: CGDatadrivenProps) {

    const hUnit = params.caster;
    const hItem = params.ability;
    print("[datadriven Item]:", params.ability.GetAbilityName(), "OnUnEquip", hItem.GetOwnerEntity().entindex())
}

export function OnSpellStart(params: CGDatadrivenProps) {
    print("[datadriven Item]:", params.ability.GetAbilityName(), "OnSpellStart")
}

export function OnProjectileHitUnit(params: CGDatadrivenProps) {
    print("[datadriven Item]:", params.ability.GetAbilityName(), "OnProjectileHitUnit")
}