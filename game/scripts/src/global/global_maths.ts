/** 贝塞尔曲线 */
function GetQuadraticVector(start_point: Vector, end_point: Vector, mid_point: Vector, t: number) {
    let p1point = start_point.Lerp(mid_point, t);
    let p2point = mid_point.Lerp(end_point, t);
    return p1point.Lerp(p2point, t);
}


/**
 * 扇形范围查询
 * 一目标点面向作为中心,进行范围查询
 * @param team 队伍
 * @param vOrigin 开始点
 * @param vTarget 目标点
 * @param radius 
 * @param angle 
 * @param teamFilter 
 */
function CustomFindUnitsInSector(
    team: DOTATeam_t,
    vOrigin: Vector,
    vTarget: Vector,
    radius: number,
    angle: number,
    teamFilter: UnitTargetTeam,
) {
    let caster_origin_difference = vOrigin - vTarget as Vector;
    let caster_origin_difference_radian = math.atan2(caster_origin_difference.y, caster_origin_difference.x);
    caster_origin_difference_radian = caster_origin_difference_radian * 180;
    let attacker_angle = caster_origin_difference_radian / math.pi;
    attacker_angle = attacker_angle + 180.0;

    let radius_enemy: CDOTA_BaseNPC[] = [];
    let enemies = FindUnitsInRadius(
        team,
        vTarget,
        null,
        radius,
        teamFilter,
        UnitTargetType.HERO + UnitTargetType.BASIC,
        UnitTargetFlags.NONE,
        FindOrder.ANY,
        false
    );
    for (let enemy of enemies) {
        let target_origin_difference = vTarget - enemy.GetAbsOrigin() as Vector;
        let target_origin_difference_radian = math.atan2(target_origin_difference.y, target_origin_difference.x);
        target_origin_difference_radian = target_origin_difference_radian * 180;
        let victim_angle = target_origin_difference_radian / math.pi;
        victim_angle = victim_angle + 180.0;
        let angle_difference = math.abs(victim_angle - attacker_angle);
        if (angle_difference < angle) {
            radius_enemy.push(enemy);
        }
    }

    return radius_enemy;
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

/**
 * 通过数组概率获得一个索引
 * @param list_value 数组值
 * @param is100 以100%作为概率?
 * @returns 
 */
function GetRandomListIndex(list_value: number[], is100: boolean = true) {
    let base_chance = 0;
    let max = 0;
    if (!is100) {
        for (let v of list_value) {
            max += v
        }
    } else {
        max = 100
    }
    let rand = RandomInt(0, max - 1);
    // 如果以100%时,获得的值超过100%时则必定成功
    if (is100 && rand >= 99) {
        return list_value.length - 1
    }
    let index = 0;
    let value = -1;
    for (let v of list_value) {
        base_chance += v;
        if (rand < base_chance) {
            value = list_value[index]
            return index
        }
        index += 1;
    }
    // 
    return -1;
}