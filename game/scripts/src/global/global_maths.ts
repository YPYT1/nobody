/** 贝塞尔曲线 */
function GetQuadraticVector(start_point: Vector, end_point: Vector, mid_point: Vector, t: number) {
    let p1point = start_point.Lerp(mid_point, t);
    let p2point = mid_point.Lerp(end_point, t);
    return p1point.Lerp(p2point, t);
}


function Custom_FindUnitsInSector(
    team: DOTATeam_t,
    hCaster: CDOTA_BaseNPC,
    vOrigin: Vector,
    VTarget: Vector,
    idistance: number,
    iAngle: number,
    teamFilter: DOTA_UNIT_TARGET_TEAM,
    typeFilter: DOTA_UNIT_TARGET_TYPE,
    flagFilter: DOTA_UNIT_TARGET_FLAGS,
    order: FindOrder,
) {
    // print("Custom_FindUnitsInSector")
    let find_units: CDOTA_BaseNPC[] = [];
    // let radius = (vOrigin - VTarget as Vector).Length2D();
    let origin_direction = (VTarget - vOrigin as Vector).Normalized();
    let in_angle = iAngle / 2;
    // let caster_direction = hCaster.GetForwardVector();
    // print("origin_direction", origin_direction, caster_direction)
    let origin_angle = VectorToAngles(origin_direction).y
    let units = FindUnitsInRadius(team, vOrigin, null, idistance, teamFilter, typeFilter, flagFilter, order, false);

    for (let unit of units) {
        let direction = (unit.GetOrigin() - vOrigin as Vector).Normalized()
        let angle = VectorToAngles(direction).y
        let angle_diff = math.abs(AngleDiff(origin_angle, angle))
        // print("origin_angle", origin_angle, "angle", angle, "angle_diff", angle_diff, iAngle / 2)
        if (angle_diff <= in_angle) {
            find_units.push(unit)
        }
    }

    return find_units

}

/**
 * 查找圆形线上的单位
 * @param team 队伍
 * @param location 中心点
 * @param radius 范围
 * @param width  宽度
 * @param teamFilter 
 * @param typeFilter 
 * @param flagFilter 
 * @returns 
 */
function FindUnitsInRing(
    team: DOTATeam_t,
    location: Vector,
    radius: number,
    width: number,
    teamFilter: DOTA_UNIT_TARGET_TEAM,
    typeFilter: DOTA_UNIT_TARGET_TYPE,
    flagFilter: DOTA_UNIT_TARGET_FLAGS,
) {
    // DebugDrawCircle(location, Vector(255, 0, 0), 100, radius + width, true, 0.5)
    let enemies = FindUnitsInRadius(
        team,
        location,
        null,
        radius + width + 24,
        teamFilter,
        typeFilter,
        flagFilter,
        FindOrder.ANY,
        false
    );
    let _targets: CDOTA_BaseNPC[] = [];
    for (let enemy of enemies) {
        // print("leng2d", (enemy.GetAbsOrigin() - location as Vector).Length2D(), (radius - width * 2 - enemy.GetHullRadius()),enemy.GetHullRadius())
        if ((enemy.GetAbsOrigin() - location as Vector).Length2D() >= (radius - width - enemy.GetHullRadius() - 8)) {
            _targets.push(enemy)
        }
    }

    return _targets
}