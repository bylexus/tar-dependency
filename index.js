/**
 * tar-dependency module
 *
 * (c) 2017 alex@alexi.ch
 */
const path = require('path'),
    jsonfile = require('jsonfile'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    tar = require('tar'),
    fetch = require('node-fetch'),
    util = require('util');

function normalizePathKey(str) {
    return (str || '').replace(/(^\/)|(\/$)/g, ''); // remove leading/trailing slashes)
}

/**
 * Installs the tar archive dependencies listed in config.
 * See README.md for more information and examples.
 *
 * Config is an object with at least the following entries:
 * tarDependencies: {
 *   [dest-dir]: {
 *      url: <tar-source-url>,
 *      strip: <strip nr of top dirs from tar, defaults to 1>
 *   },
 *   ...
 * }
 *
 * This function returns a promise that resolves when all dependencies are installed.
 */
async function installTarDependencies(config, destKey) {
    config = config || {};
    const deps = config.tarDependencies || {};

    destKey = normalizePathKey(destKey);
    for (const key of Object.keys(deps)) {
        if (destKey && key !== destKey) {
            return;
        }
        const fullOutdir = path.join(process.cwd(), key);
        const url = deps[key].url;
        const strip = deps[key].strip === undefined ? 1 : Number(deps[key].strip);

        console.log('tar package: ' + url + ' => ' + key);
        await util.promisify(rimraf)(fullOutdir);
        await mkdirp(fullOutdir);

        const response = await fetch(url);
        response.body.pipe(
            tar.x({
                strip: strip,
                C: fullOutdir,
                sync: true
            })
        );
    }
}

/*
 * Adds an archive to the list of dependencies, but does NOT install it:
 * you must call 'installTars' after.
 *
 * See README.md for more information and examples.
 *
 * The given config object is updated.
 */
function addArchive(config, url, destDir, strip) {
    config = config || {};
    strip = strip === undefined ? 1 : Number(strip);
    destDir = normalizePathKey(destDir);
    config.tarDependencies = config.tarDependencies || {};
    var tarConfig = Object.assign({}, config.tarDependencies[destDir]);
    tarConfig.url = url;
    tarConfig.strip = strip;
    config.tarDependencies[destDir] = tarConfig;
}

/*
 * Removes an archive identified by given path key. It removes the archive on the disk
 * as well as in the config object (but does not save the config to a file).
 * You must call 'saveConf' if you whish to save the config to a file.
 *
 * See README.md for more information and examples.
 *
 * The given config object is updated.
 */
async function removeArchive(config, destDir) {
    config = config || {};
    config.tarDependencies = config.tarDependencies || {};
    destDir = normalizePathKey(destDir);

    if (destDir) {
        delete config.tarDependencies[destDir];
    }

    const fullOutdir = path.join(process.cwd(), destDir);
    await util.promisify(rimraf)(fullOutdir);
}

/*
 * Saves the given config object as json to a file. Normally, 'file'
 * would be a path to 'package.json', but this is not a must.
 *
 * See README.md for more information and examples.
 */
async function saveConf(config, file) {
    config = config || {};
    await util.promisify(jsonfile.writeFileSync)(file, config, { spaces: 2 });
}

module.exports = {
    install: installTarDependencies,
    add: addArchive,
    remove: removeArchive,
    saveConfig: saveConf
};
