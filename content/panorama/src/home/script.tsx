import { render } from "react-panorama-x";
// import "./panel/control/control";

const Initialize = () => {
    let controlPanel = $("#control");
    controlPanel.RemoveAndDeleteChildren();
    let state = controlPanel.BLoadLayout("file://{resources}/layout/custom_game/home/panel/control/control.xml", true, true);
    $.Msg(["state",state]);
}

// const App = () => {

//     return (
//         <Panel id="App"
//             onload={() => {
//                 Initialize();
//             }}
//         />
//     )
// }

// render(<App />, $.GetContextPanel());

(function () {
    Initialize();
})();

