import { CustomMath } from "../../../utils/custom_math";
import { FormatNumberToTime } from "../../../utils/method";

const CANVAS_MAX_X = 500;
const CANVAS_MAX_Y = 500;

const CanvasPanel = $("#CanvasPanel") as UICanvas;

export function testCode() {
    // 创建画布
    // $.Msg(["testCode"])
    CanvasPanel.ClearJS('rgb(0,0,0)');
    // StartTimeLoop();
}

function StartTimeLoop() {
    UpdateClockTime()
    $.Schedule(Game.GetGameFrameTime(), StartTimeLoop)
}

function UpdateClockTime() {
    // 这里是指当前游戏时间
    let DotaGameTime = Game.GetDOTATime(false, false);
    let sec = DotaGameTime % 60;
    drawSecondCloc(sec)
}

// 秒针 0 0 59 = 360
function drawSecondCloc(sec: number) {
    CanvasPanel.ClearJS('rgba(0,0,0,0)');
    let angle = sec * 6;
    let points = [[CANVAS_MAX_X / 2, CANVAS_MAX_Y / 2]];
    let value = CustomMath.GetCirclePoint({ x: 250, y: 250 }, 200, -angle + 180)
    points.push(value)
    let distance = CustomMath.Length2D(points[0], points[1])
    // $.Msg(["distance", distance])
    CanvasPanel.DrawSoftLinePointsJS(points.length, _flattenArrayOfTuples(points), 5, 1, "#B5D4EEaa")
}



function _flattenArrayOfTuples(arrOfTuples: number[][]) {
    let retVal: number[] = [];
    arrOfTuples.forEach(t => retVal.push(t[0]) && retVal.push(t[1]));
    return retVal;
}