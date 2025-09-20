import { reloadable } from '../../../utils/tstl-utils';

/**
 * 刷怪系统
 */
@reloadable
export class Spawns {
    constructor() {}

    CreateNormal(unit_name: string, vect: Vector, hull_radius: number = 36) {
        const unit = CreateUnitByName(unit_name, vect, true, null, null, DotaTeam.BADGUYS);
        // unit.SetControllableByPlayer(0, true)
        unit.SetHullRadius(hull_radius);
        unit.CDResp = {};

        return unit;
    }
}
