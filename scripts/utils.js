const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const { execFile } = require('child_process');

const execFileAsync = promisify(execFile);

let steamGetGamePath;
try {
    ({ getGamePath: steamGetGamePath } = require('steam-game-path'));
} catch (error) {
    if (process.env.DEBUG_STEAM_PATH) {
        console.warn('[scripts/utils] steam-game-path unavailable:', error.message);
    }
}

async function pathExists(targetPath) {
    if (!targetPath) {
        return false;
    }
    try {
        await fs.promises.access(targetPath);
        return true;
    } catch {
        return false;
    }
}

async function isValidDotaInstallation(candidate) {
    if (!candidate) {
        return false;
    }

    const markers = [
        path.join(candidate, 'game', 'bin', 'win64', 'dota2.exe'),
        path.join(candidate, 'game', 'bin', 'win32', 'dota2.exe'),
        path.join(candidate, 'game', 'dota', 'gameinfo.gi'),
        path.join(candidate, 'dota.sh'),
    ];

    for (const marker of markers) {
        if (await pathExists(marker)) {
            return true;
        }
    }
    return false;
}

async function readSteamRootsFromRegistry() {
    if (process.platform !== 'win32') {
        return [];
    }

    const keys = [
        'HKCU\\Software\\Valve\\Steam',
        'HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam',
        'HKLM\\SOFTWARE\\Valve\\Steam',
    ];

    const roots = [];

    for (const key of keys) {
        try {
            const { stdout } = await execFileAsync('reg', ['query', key, '/v', 'SteamPath']);
            const match = stdout && stdout.match(/SteamPath\s+REG_SZ\s+(.+)/i);
            if (match && match[1]) {
                roots.push(match[1].trim());
            }
        } catch {
            // ignore missing keys
        }
    }

    return roots;
}

async function readLibraryFolders(steamRoot) {
    const libraries = new Set();
    const libraryFile = path.join(steamRoot, 'steamapps', 'libraryfolders.vdf');

    if (!(await pathExists(libraryFile))) {
        libraries.add(path.join(steamRoot, 'steamapps', 'common', 'dota 2 beta'));
        return Array.from(libraries);
    }

    try {
        const content = await fs.promises.readFile(libraryFile, 'utf8');
        const regex = /"path"\s+"([^"]+)"/gi;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const p = match[1].replace(/\\\\/g, '\\');
            libraries.add(path.join(p, 'steamapps', 'common', 'dota 2 beta'));
        }
        libraries.add(path.join(steamRoot, 'steamapps', 'common', 'dota 2 beta'));
    } catch {
        libraries.add(path.join(steamRoot, 'steamapps', 'common', 'dota 2 beta'));
    }

    return Array.from(libraries);
}

function gatherEnvironmentCandidates() {
    const candidates = new Set();

    if (process.env.DOTA_PATH) {
        candidates.add(process.env.DOTA_PATH.trim());
    }

    const steamEnvVars = [
        process.env.STEAM_PATH,
        process.env.STEAM_HOME,
        process.env.STEAM_ROOT,
    ].filter(Boolean);

    for (const steamVar of steamEnvVars) {
        candidates.add(path.join(steamVar.trim(), 'steamapps', 'common', 'dota 2 beta'));
    }

    if (process.env.STEAM_LIBRARY) {
        candidates.add(path.join(process.env.STEAM_LIBRARY.trim(), 'steamapps', 'common', 'dota 2 beta'));
    }

    if (process.env.PROGRAMFILES) {
        candidates.add(path.join(process.env.PROGRAMFILES.trim(), 'Steam', 'steamapps', 'common', 'dota 2 beta'));
    }

    if (process.env['PROGRAMFILES(X86)']) {
        candidates.add(path.join(process.env['PROGRAMFILES(X86)'].trim(), 'Steam', 'steamapps', 'common', 'dota 2 beta'));
    }

    return Array.from(candidates);
}

function defaultPlatformCandidates() {
    const candidates = new Set();

    if (process.platform === 'win32') {
        const drives = ['C', 'D', 'E', 'F', 'G'];
        const suffixes = [
            '\\Program Files (x86)\\Steam',
            '\\Program Files\\Steam',
            '\\Steam',
            '\\SteamLibrary',
            '\\Games\\Steam',
        ];
        for (const drive of drives) {
            for (const suffix of suffixes) {
                candidates.add(path.join(`${drive}:`, suffix, 'steamapps', 'common', 'dota 2 beta'));
            }
        }
    } else if (process.platform === 'linux') {
        const home = process.env.HOME || '';
        candidates.add(path.join(home, '.local', 'share', 'Steam', 'steamapps', 'common', 'dota 2 beta'));
        candidates.add(path.join(home, '.steam', 'steam', 'steamapps', 'common', 'dota 2 beta'));
    } else if (process.platform === 'darwin') {
        candidates.add('/Applications/Steam.app/Contents/steamapps/common/dota 2 beta');
    }

    return Array.from(candidates);
}

async function collectCandidatePaths() {
    const candidates = new Set();

    gatherEnvironmentCandidates().forEach(p => candidates.add(p));

    if (typeof steamGetGamePath === 'function') {
        try {
            const location = steamGetGamePath(570);
            if (location && location.game && location.game.path) {
                candidates.add(location.game.path);
            }
        } catch (error) {
            if (process.env.DEBUG_STEAM_PATH) {
                console.warn('[scripts/utils] steam-game-path lookup failed:', error.message);
            }
        }
    }

    const registryRoots = await readSteamRootsFromRegistry();
    for (const root of registryRoots) {
        const libs = await readLibraryFolders(root);
        libs.forEach(lib => candidates.add(lib));
    }

    defaultPlatformCandidates().forEach(p => candidates.add(p));

    return Array.from(candidates).filter(Boolean);
}

module.exports.getDotaPath = async () => {
    const seen = new Set();
    const candidates = await collectCandidatePaths();

    for (const candidate of candidates) {
        if (!candidate) continue;
        const normalized = path.normalize(candidate);
        if (seen.has(normalized)) {
            continue;
        }
        seen.add(normalized);

        if (!(await pathExists(normalized))) {
            continue;
        }

        if (await isValidDotaInstallation(normalized)) {
            return normalized;
        }
    }

    return undefined;
};
