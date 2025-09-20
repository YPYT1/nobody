import { reloadable } from '../../../utils/tstl-utils';

import type * as UnitsSummoned from './../../../json/units/summoned.json';

type SummonedUnitsType = keyof typeof UnitsSummoned;

/** 召唤系统 */
@reloadable
export class SummonedSystem {
    constructor() {}

    CreateBullet(vPos: Vector, hCaster: CDOTA_BaseNPC) {
        const hBullet = CreateUnitByName('npc_dota_beastmaster_axe', vPos, true, hCaster, hCaster, hCaster.GetTeam());
        return hBullet;
    }

    CreatedUnit(unitName: SummonedUnitsType, location: Vector, caster: CDOTA_BaseNPC, lifetime: number, hide_hpbar: boolean = true) {
        const summoned_unit = CreateUnitByName(unitName, location, false, caster, caster, caster.GetTeamNumber());
        summoned_unit.AddNewModifier(caster, null, 'modifier_summoned_lifetime', {
            duration: lifetime,
        });
        return summoned_unit;
    }
}
