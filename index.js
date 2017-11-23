/**
 * tar-dependency module
 *
 * (c) 2017 alex@alexi.ch
 */
var path = require('path'),
    jsonfile = require('jsonfile'),
    rimraf = require('rimraf'),
    mkdirp = require('mkdirp'),
    tar = require('tar'),
    request = require('request');

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
 * Note that this function:
 * - runs SYNCHRONOUS intentionally
 */
var installTarDependencies = function(config, destKey) {
    config = config || {};
    var path = require('path'),
        deps = config.tarDependencies || {};

    destKey = normalizePathKey(destKey);
    Object.keys(deps).forEach(function(key) {
        if (destKey && key !== destKey) {
            return;
        }
        var dest = key;
        var fullOutdir = path.join(process.cwd(), dest);
        var url = deps[key].url;
        var strip = deps[key].strip;

        if (strip === undefined) {
            strip = 1;
        }
        console.log('tar package: ' + url + ' => ' + dest);
        rimraf.sync(fullOutdir);
        mkdirp.sync(fullOutdir);

        request(url).pipe(
            tar.x({
                strip: strip,
                C: fullOutdir,
                sync: true
            })
        );
    });
};

/*
 * Adds an archive to the list of dependencies, but does NOT install it:
 * you must call 'installTars' after.
 *
 * See README.md for more information and examples.
 *
 * The given config object is updated.
 */
var addArchive = function(config, url, destDir, strip) {
    config = config || {};
    strip = strip === undefined ? 1 : Number(strip);
    destDir = normalizePathKey(destDir);
    config.tarDependencies = config.tarDependencies || {};
    var tarConfig = Object.assign({}, config.tarDependencies[destDir]);
    tarConfig.url = url;
    tarConfig.strip = strip;
    config.tarDependencies[destDir] = tarConfig;
};

/*
 * Removes an archive identified by given path key. It removes the archive on the disk
 * as well as in the config object (but does not save the config to a file).
 * You must call 'saveConf' if you whish to save the config to a file.
 *
 * See README.md for more information and examples.
 *
 * The given config object is updated.
 */
var removeArchive = function(config, destDir) {
    config = config || {};
    config.tarDependencies = config.tarDependencies || {};
    destDir = normalizePathKey(destDir);

    if (destDir) {
        delete config.tarDependencies[destDir];
    }

    var fullOutdir = path.join(process.cwd(), destDir);

    rimraf.sync(fullOutdir);
};

/*
 * Saves the given config object as json to a file. Normally, 'file'
 * would be a path to 'package.json', but this is not a must.
 *
 * See README.md for more information and examples.
 */
var saveConf = function(config, file) {
    config = config || {};
    jsonfile.writeFileSync(file, config, { spaces: 2 });
};

module.exports = {
    install: installTarDependencies,
    add: addArchive,
    remove: removeArchive,
    saveConfig: saveConf
};
