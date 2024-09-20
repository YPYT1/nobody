const CMath = {
    VectorAdd(v1, v2) {
        return [v1[0] + v2[0], v1[1] + v2[1], 0];
    },
    VectorMin(v1, v2) {
        return [v1[0] - v2[0], v1[1] - v2[1], 0];
    },
    VectorScale(v1, c) {
        return [v1[0] * c, v1[1] * c, 0];
    },
    Length2D(vect1, vect2) {
        return Game.Length2D([vect1[0], vect1[1], 0], [vect2[0], vect2[1], 0]);
    },
    Normalized(vect) {
        return Game.Normalized([vect[0], vect[1], 0]);
    },
    /**
     * 根据圆上的坐标点
     * @param pos 坐标点
     * @param distance 半径
     * @param angle 角度
     * @returns
     */
    GetCirclePoint(pos, distance, angle) {
        let x2 = Math.sin((angle) * Math.PI / 180) * distance + pos.x;
        let y2 = Math.cos((angle) * Math.PI / 180) * distance + pos.y;
        return [x2, y2];
    },
};

(function () {
    // Turn off some default UI
    let HUD = $.GetContextPanel().GetParent().GetParent();
    let PreGame = HUD.FindChildTraverse("PreGame");
    if (PreGame)
        PreGame.enabled = false;
    PreGame.style.opacity = "0";
})