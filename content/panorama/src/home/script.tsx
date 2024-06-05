let hudPanel: Panel;


// const TestPanel = ()=>{

//     return (
//         <Panel id="TestPanel">

//         </Panel>
//     )
// }

const Initialize = () => {
    hudPanel.BLoadLayout("file://{resources}/layout/custom_game/home/panel/hud.xml", false, false)
}


hudPanel = $("#hud");
hudPanel.RemoveAndDeleteChildren();
// Initialize()
