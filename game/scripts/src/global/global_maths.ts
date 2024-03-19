/** 贝塞尔曲线 */
function GetQuadraticVector(start_point: Vector, end_point: Vector, mid_point: Vector, t: number) {
    let p1point = start_point.Lerp(mid_point, t);
    let p2point = mid_point.Lerp(end_point, t);
    return p1point.Lerp(p2point, t);
}