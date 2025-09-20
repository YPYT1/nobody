/** 贝塞尔曲线 */
function GetQuadraticVector(start_point: Vector, end_point: Vector, mid_point: Vector, t: number) {
    const p1point = start_point.Lerp(mid_point, t);
    const p2point = mid_point.Lerp(end_point, t);
    return p1point.Lerp(p2point, t);
}

/**
 * 扇形查找单位
 * @param team 队伍
 * @param vOrigin 起始点
 * @param vTarget 目标点
 * @param iAngle 角度
 * @param idistance 长度
 * @param teamFilter
 * @param typeFilter
 * @param flagFilter
 * @param order
 * @returns
 */
function Custom_FindUnitsInSector(
    team: DOTATeam_t,
    vOrigin: Vector,
    vTarget: Vector,
    iAngle: number,
    idistance: number,
    teamFilter: DOTA_UNIT_TARGET_TEAM,
    typeFilter: DOTA_UNIT_TARGET_TYPE,
    flagFilter: DOTA_UNIT_TARGET_FLAGS,
    order: FindOrder = FindOrder.ANY
) {
    // print("Custom_FindUnitsInSector")
    const find_units: CDOTA_BaseNPC[] = [];
    const units = FindUnitsInRadius(team, vOrigin, null, idistance, teamFilter, typeFilter, flagFilter, order, false);
    const cast_direction = ((vTarget - vOrigin) as Vector).Normalized();
    cast_direction.z = 0;
    const cast_angle = VectorToAngles(cast_direction).y;

    // print("=========")
    // print("cast_angle", cast_angle)
    // DebugDrawCircle(vOrigin)
    for (const unit of units) {
        const enemy_direction = ((unit.GetOrigin() - vOrigin) as Vector).Normalized();
        enemy_direction.z = 0;
        const enemy_angle = VectorToAngles(enemy_direction).y;
        // print("cast_angle",cast_angle,enemy_angle)
        const angle_diff = math.abs(AngleDiff(cast_angle, enemy_angle));
        // print("angle_diff", angle_diff, iAngle)
        if (angle_diff <= iAngle * 0.5) {
            find_units.push(unit);
        }
    }
    return find_units;
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
    flagFilter: DOTA_UNIT_TARGET_FLAGS
) {
    // DebugDrawCircle(location, Vector(255, 0, 0), 100, radius + width, true, 0.5)
    const enemies = FindUnitsInRadius(team, location, null, radius + width + 24, teamFilter, typeFilter, flagFilter, FindOrder.ANY, false);
    const _targets: CDOTA_BaseNPC[] = [];
    for (const enemy of enemies) {
        // print("leng2d", (enemy.GetAbsOrigin() - location as Vector).Length2D(), (radius - width * 2 - enemy.GetHullRadius()),enemy.GetHullRadius())
        if (((enemy.GetAbsOrigin() - location) as Vector).Length2D() >= radius - width - enemy.GetHullRadius() - 8) {
            _targets.push(enemy);
        }
    }

    return _targets;
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
        for (const v of list_value) {
            max += v;
        }
    } else {
        max = 100;
    }
    const rand = RandomInt(0, max - 1);
    // 如果以100%时,获得的值超过100%时则必定成功
    if (is100 && rand >= 99) {
        return list_value.length - 1;
    }
    let index = 0;
    let value = -1;
    for (const v of list_value) {
        base_chance += v;
        if (rand < base_chance) {
            value = list_value[index];
            return index;
        }
        index += 1;
    }
    //
    return -1;
}

/** 求B元素里缺少A元素的集合 */
function GetLackList<T>(Arr1: T[], Arr2: T[]): T[] {
    const ret: T[] = [];
    // 遍历A元素
    for (const valA of Arr1) {
        let equal = false;
        // B元素值
        for (const valB of Arr2) {
            // 若B含有A元素,则放弃,
            if (valB == valA) {
                equal = true;
                break;
            }
        }
        if (!equal) {
            ret.push(valA);
        }
    }
    return ret;
}
