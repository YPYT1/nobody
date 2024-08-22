(function () {
    // Turn off some default UI
    let HUD = $.GetContextPanel().GetParent().GetParent();
    let PreGame = HUD.FindChildTraverse("PreGame");
    if (PreGame)
      PreGame.enabled = false;
      PreGame.style.opacity = "0";
})