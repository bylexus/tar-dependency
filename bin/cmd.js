#!/usr/bin/env node
/**
 * command line executable for tar-dependency
 *
 * It assumes a package.json in the actual working directory.
 *
 * (c) 2017 alex@alexi.ch
 */

var lib = require('../index.js');
var jsonfile = require('jsonfile');
var path = require('path');
var program = require('commander');

var setWorkingDir = function(dir) {
    process.chdir(dir);
};

var packageConfigPath = function() {
    return path.join(process.cwd(), 'package.json');
};

var readPackageConfig = function() {
    return jsonfile.readFileSync(packageConfigPath());
};

var packageConf = readPackageConfig();

program.option('-w, --working-dir <path>', 'use specified working directory');

program
    .command('install')
    .description('installs / updates tar dependencies defined in package.json')
    .action(function() {
        setWorkingDir(this.parent.workingDir || process.cwd());
        lib.install(packageConf);
    });

program
    .command('add <url> <dest-dir>')
    .option(
        '-s, --strip <nr>',
        'Strips <nr> top directories from the archive (same as tar --strip). Defaults to 1, since most packages came with a single root folder.'
    )
    .description(
        'Fetches the tar from <url> and extracts it to <dest-dir>. Note that dest-dir SHOULD be relative to package.json. Updates package.json.'
    )
    .action(function(url, destDir) {
        var strip = this.strip === undefined ? 1 : Number(this.strip);
        setWorkingDir(this.parent.workingDir || process.cwd());
        lib.add(packageConf, url, destDir, strip);
        lib.saveConfig(packageConf, packageConfigPath());
        lib.install(packageConf, destDir);
    });

program
    .command('remove <dest-dir>')
    .description(
        'Removes an installed/extracted archive from disk as well as from package.json. Please make sure dest-dir identifies an entry in package.json.'
    )
    .action(function(name) {
        setWorkingDir(this.parent.workingDir || process.cwd());
        lib.remove(packageConf, name);
        lib.saveConfig(packageConf, packageConfigPath());
    });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
    program.help();
}
