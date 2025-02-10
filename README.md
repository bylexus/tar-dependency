# tar-dependency

> Installs tar archives defined in package.json to a directory

This is a small helper tool with the following purpose:

* It fetches / extracts .tar(.gz) archives into a local folder
* It stores the installed archive infos in `package.json`

This tool is mainly used for fetching git repositories as tar archives from github / gitlab: The archives needed during development / as part of the package can
be defined in `package.json`, so this information is part of the main repo and can be distributed to source control.
It allows adding non-npm dependencies to be installed as part of the package management.

We created this tool to replace [Bower](https://bower.io/), where packages are not available as npm/yarn packages.

## Requirements

This library needs at least NodeJS >= 20

## Installation

`npm install --save-dev tar-dependency`

## Usage

*Note*: This tool assumes a `package.json` in the current working directory.

### Install a TAR archive from a URL

`tar-dependency add [tar-url] [relative-install-path]`

For example:

`tar-dependency add --strip 1 https://github.com/bylexus/php-injector/archive/0.0.8.tar.gz packages/php-injector`

This fetches the mentioned tar repo to `packages/php-injector`, and strips the archive's top directory (default).

The added archive is stored in `package.json`, in the `tarDependencies` object.

### Install archives from package.json

To install archives configured in `package.json`, execute

`tar-dependency install`

This installs the archives configured in `package.json` into their configured relative dir.

### Remove installed archive

`tar-dependency remove [relative-path]`

e.g.:

`tar-dependency remove packages/php-injector`

This removes the archive from the disk as well as from `package.json`

### Manually change archive entries in `package.json`

The installed archives are stored in `package.json`. You can manually edit the entries, if needed. The structure looks as follows:

```json
{
  "tarDependencies": {
      "[relative-dir]": {
          "url": "<url-to-tar-file>",
          "strip": <nr of archive dirs to strip>
      },
    ...
  }
}
```

For example:

```json
{
  "tarDependencies": {
      "components/php-injector": {
        "url": "https://github.com/bylexus/php-injector/archive/0.0.8.tar.gz",
        "strip": 1
      },
      "components/components-ext": {
        "url": "https://gitlab.kadenpartner.ch/kp/extjs/repository/4.2.6-min/archive.tgz?private_token=abcdefg",
        "strip": 1
      }
  }
}
```
and then install them with

`tar-dependency install`

## Changelog

### 0.2.0 - Feb 2025

* [breaking] Updated to NodeJS >= 20 with ES Modules
* [breaking] You need a NodeJS version that supports ES Modules (~ V.14.0)
* Updated dependant packages

### 0.1.0

Initial release

(c) 2017-2025 alex@alexi.ch
