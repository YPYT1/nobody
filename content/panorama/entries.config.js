const path = require('path');
const fs = require('fs');

const GetImportPathFileList = (path_dir) => {
    let context = path.resolve(__dirname, 'src/' + path_dir);
    let xml_list = [];

    function readFilesInDirectory(directoryPath) {
        const files = fs.readdirSync(directoryPath);

        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isFile()) {
                if (filePath.endsWith("xml")) {
                    let dir_path = directoryPath.replace(__dirname + "\\src\\", "./") + "/"
                    let import_file = (dir_path + "/" + file).replaceAll("\\", "/").replaceAll("//", "/")
                    if (dir_path == './' + path_dir + "/" == false) {
                        xml_list.push({ import: import_file, filename: import_file.replace("./", "") })
                    }

                }

            } else if (stats.isDirectory()) {
                readFilesInDirectory(filePath);
            }
        });
    }
    readFilesInDirectory(context)

    return xml_list

};

const ImportDashBoard = GetImportPathFileList("dashboard");
const ImportHome = GetImportPathFileList("home");
const ImportComponents = GetImportPathFileList("components");
const ImportTooltip = GetImportPathFileList("tooltip");

const entries = [
    // { import: './utils/x-nettable-dispatcher.ts', filename: 'x-nettable-dispatcher.js' },
    { import: './_global/global.ts', filename: '_global/global.js' },
    { import: './_global/kvdata.ts', filename: '_global/kvdata.js' },
    { import: './_global/event_bus.ts', filename: '_global/event_bus.js' },

    // if type is not set, it will not be included in the manifest
    // usually used for loading screen, tooltips and popups which loaded
    // by engine or BLoadLayout etc.
    { import: './loading-screen/layout.xml', filename: 'custom_loading_screen.xml' },
    { import: './team_select/layout.xml', filename: 'team_select.xml' },
    // provide type and filename to include in the manifest
    // { import: './end_screen/layout.xml', type: 'EndScreen', filename: 'end_screen.xml' },

    // if filename is not set, it will use the name of the entry
    // { import: './hud/layout.xml', type: 'Hud' },
    { import: './activation/layout.xml', filename: 'activation/layout.xml' },
    { import: './home/layout.xml', filename: 'home/layout.xml' },
    { import: './dashboard/layout.xml', filename: 'dashboard/layout.xml' },
    { import: './development/layout.xml', filename: 'development/layout.xml' },

    // tooltips
    ...ImportTooltip,
    ...ImportHome,
    ...ImportComponents,
    ...ImportDashBoard,
];

module.exports = entries;
