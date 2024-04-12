import { reloadable } from "../../../utils/tstl-utils";

import * as UnitsSummoned from "./../../../json/units/summoned.json"

type SummonedUnitsType = keyof typeof UnitsSummoned;

/** 召唤系统 */
@reloadable
export class SummonedSystem {

    constructor() {

    }

    CreatedUnit(
        unitName: SummonedUnitsType,
        location: Vector,
        caster: CDOTA_BaseNPC,
        lifetime: number,
        hide_hpbar: boolean = true,
    ) {
        let summoned_unit = CreateUnitByName(unitName, location, false, caster, caster, caster.GetTeamNumber());
        summoned_unit.AddNewModifier(caster, null, "modifier_summoned_lifetime", {
            duration: lifetime,
        })
        return summoned_unit
    }
}