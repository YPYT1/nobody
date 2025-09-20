const path = require('path');
const fs = require('fs');

const GetImportPathFileList = (path_dir) => {
    const srcRoot = path.resolve(__dirname, 'src');
    const toPosix = (value) => value.split(path.sep).join('/');
    const context = path.resolve(srcRoot, path_dir);
    const xml_list = [];

    function readFilesInDirectory(directoryPath) {
        const files = fs.readdirSync(directoryPath);
        const relativeDir = toPosix(path.relative(srcRoot, directoryPath));

        files.forEach(file => {
            const filePath = path.join(directoryPath, file);
            const stats = fs.statSync(filePath);

            if (stats.isFile()) {
                if (filePath.endsWith('xml')) {
                    const relativeFile = toPosix(path.relative(srcRoot, filePath));

                    if (relativeDir === path_dir) {
                        return;
                    }

                    if (relativeFile.includes('_temp')) {
                        return;
                    }

                    const import_file = `./${relativeFile}`;
                    xml_list.push({ import: import_file, filename: relativeFile });
                }
            } else if (stats.isDirectory()) {
                readFilesInDirectory(filePath);
            }
        });
    }

    readFilesInDirectory(context);

    return xml_list;
};

const ImportDashBoard = GetImportPathFileList("dashboard");
const ImportHome = GetImportPathFileList("home");
const ImportTooltip = GetImportPathFileList("tooltip");
const ImportPublic = GetImportPathFileList("public");
const ImportPopups = GetImportPathFileList("popups");
const Importcomponents = GetImportPathFileList("components");
const entries = [
    // { import: './utils/x-nettable-dispatcher.ts', filename: 'x-nettable-dispatcher.js' },
    { import: './_global/global.ts', filename: '_global/global.js' },
    { import: './_global/kvdata.ts', filename: '_global/kvdata.js' },
    { import: './_global/event_bus.ts', filename: '_global/event_bus.js' },
    { import: './_global/storage.ts', filename: '_global/storage.js' },
    { import: './components/component_manager.ts', filename: 'components/component_manager.js' },

    { import: './loading-screen/layout.xml', filename: 'custom_loading_screen.xml' },
    { import: './team_select/layout.xml', filename: 'team_select.xml' },

    { import: './activation/layout.xml', filename: 'activation/layout.xml' },
    { import: './home/layout.xml', filename: 'home/layout.xml' },
    { import: './dashboard/layout.xml', filename: 'dashboard/layout.xml' },
    { import: './development/layout.xml', filename: 'development/layout.xml' },
    { import: './public/layout.xml', filename: 'public/layout.xml' },
    { import: './popups/layout.xml', filename: 'popups/layout.xml' },
    // { import: './components/layout.xml', filename: 'components/layout.xml' },

    ...ImportTooltip,
    ...ImportHome,
    ...ImportDashBoard,
    ...ImportPublic,
    ...ImportPopups,
    // ...Importcomponents,
];

module.exports = entries;
