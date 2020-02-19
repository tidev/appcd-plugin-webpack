# Webpack Migration Guide

This migration guides walks you though the steps you need to take to enable Webpack in your existing Titanium project.

## Introduction

Using Webpack in your Titanium project provides significant performance improvements in terms of build times.

## Getting started

First make sure you have at least version 3.1.0+ of [appc-daemon](https://github.com/appcelerator/appc-daemon) installed. The Appcelerator Daemon (or appcd for short) powers our Webpack build pipeline and manages Webpack builds in the background.

```sh
npm i appcd -g
```

> 💡 **NOTE:** If you use [appc-cli](https://docs.axway.com/bundle/Appcelerator_CLI_allOS_en/page/appcelerator_cli_getting_started.html) make sure you are at least on version 8.0 since it includes appcd 3.1.0+.

### Install @appcd/plugin-webpack

The Webpack plugin for appcd manages all Webpack build tasks for your Titanium projects in the background. It also provides a simple Web UI to control Webpack builds and view the current build status.

```sh
npm i @appcd/plugin-webpack -g
```

### Enable Webpack in your Project

Now that you have the neccessary tools installed you just need to enable Webpack in your project. Simply add a new `webpack` section to your `tiapp.xml` and specifiy the project type.

```xml
<ti:app>
  <webpack>
    <type>alloy</type>
  </webpack>
</ti:app>
```

For your existing projects you can choose between `alloy` and `classic`. The project type tells the Webpack plugin what configuration to load for your project.

### Configure Babel

[babel-loader](https://github.com/babel/babel-loader) is pre-configured for every Webpack enabled Titanium project. To properly transpile your JS code to the target platform you are building for, you need to install [@titanium-sdk/babel-preset-app](https://github.com/appcelerator/babel-preset-app#readme) into your project and create a `babel.config.js` with the following content:

```js
module.exports = {
  presets: [
    '@titanium-sdk/app'
  ]
};
```

The preset will be configured automatically but you can overwrite options if you like. Take a look at the [options](https://github.com/appcelerator/babel-preset-app#options) to see what's available.

By default Webpack will **not** transpile anything from `node_modules`. However, you can explicitly include dependencies for transpilation in your `tiapp.xml`:

```xml
<ti:app>
  <webpack>
    <transpile-dependencies>
      <dep>some-module</dep>
    </transpile-dependencies>
  </webpack>
</ti:app>
```

## General guidelines

These are some general guidelines you should follow when using Webpack with Titanium. You need to apply these to your existing project when migrating from an Classic/Alloy Titanium project.

### `require`/`import` with Webpack

When bundling code with Webpack there are a few rules you need to follow in your `require`/`import` statements.

#### Dynamic requires

Dynamic requires with expressions need to be adopted to work well with webpack. See [require with expression](https://webpack.js.org/guides/dependency-management/#require-with-expression) from Webpack docs for more details.

#### Titanium non-spec require

The Titanium `require` implementation has a non-spec fallback to resolve non-relative requires from the app root. This is not supported when using Webpack and you need to adjust your require expressions accordingly.

```js
// Unsupported require to `app/lib/my-local-module.js` in an Alloy app
require('my-local-module')

// How it should be with Webpack
require('../my-local-module')
```

See the following section about aliases how you can avoid writing overly long relative imports.

### Aliases

To make your life easier when dealing with relative requires throughout your project you can use two pre-configured aliases.

- `@`: projects source directory. This resolves differently depending on what project type you are using.
  - **Classic**: `app/src`
  - **Alloy**: `app/lib`
  - **Vue.js**: `app/src`
  - **Angular**: `app/src`
- `~`: project's asset directory, always `app/assets`

There might be other pre-configured aliases available depending on the project type. You can also add your own aliases.

### Using NPM packages

You can install NPM packages directly into your project root directory and require them in your Titanium code. Webpack then takes care of the rest and makes sure to properly resolve and bundle them into your app.

### Asset management

For easier transitioning Webpack copies all assets from `app/assets` to your app for Classic and Alloy projects by default. However, since [file-loader](https://github.com/webpack-contrib/file-loader) is also pre-configured you can make use of it if you'd like and disable the legacy copying of all asset.

For example, let's assume you have an image view defined like this:

```js
Ti.UI.createImageView({
  image: '/image.jpg'
})
```

To use the `file-loader` you simply need to `require` the image:

```js
const imageView = Ti.UI.createImageView({
  image: require('~/image.jpg')
})
```

Note the use of the `~` alias which automatically resolves to the `app/assets` folder of your project. Webpack will now make sure to copy that file to your app and replace the require with the path pointing to the image within your app.

The main benefit of this is that you can chain more loaders into this process and, for example, automatically compress all used images by default to minify the size of your final App bundle.

Once you have changed all references to assets in your app with `require` you can disable the automatic copying of all assets by disabling the pre-configured `copy-assets` plugin. See the [delete plugin](#delete-plugin) example below in the [Webpack Configuration](#webpack-configuration) section how to do that.

> 💡 **TIP:** Make sure to require *all assets* you want in your app. To copy fonts, for example, include requires to the font files.
>
> ```js
> require('~/FontAwesome.otf')
> ```

### Platform specific files

When using Webpack the use of platform specific files changes slightly. Instead of placing your resources in a platform specific subfolder, you need add the platform as a suffic to the filename.

> 💡 **TIP:** This only applies to things that you `require`/`import` through Webpack. The `platform` folder for example is excempt from this new rule.

How it used to be:

```js
// index.js
import { msg } from 'utils';

// ios/utils.js
export const msg = 'This is used on iOS'

// android/utils.js
export const msg = 'This is used on Android'
```

With Webpack you need to change this to

```js
// index.js
import { msg } from 'utils';

// utils.ios.js
export const msg = 'This is used on iOS'

// utils.android.js
export const msg = 'This is used on Android'
```

If no file with a platform suffix was found Webpack tries to resolve the file as usual without any suffix.

## Migrate Classic Project

Migrating a classic project is pretty straight forward. All you need to do is to move your existing files into a new `app` directory in your project root.

- Move JavaScript source files to `app/src`
- Rename `app.js` to `main.js`
- Move assets into `app/assets`

Webpack will then process and bundle all your JS files and assets and put them back into `Resources`.

> 💡 **TIP:** Add the `Resources` folder to your `.gitignore` since it will be created by Webpack now and should be considered as an intermediate build folder.

## Migrate Alloy Project

### Install dependencies

When using Webpack and Alloy together you need to install `alloy` and `alloy-compiler` dependencies into your project.

```bash
npm i alloy alloy-compiler -D
```

This allows you to choose the `alloy` version per project.

### Remove old Alloy plugin

Since Webpack now compiles your Alloy app the default Alloy plugin is not required anymore. You can safely delete `plugins/ti.alloy` and remove it from the `plugins` section of your `tiapp.xml`.

### Create required folders

Webpack requires that your project includes all possible Alloy sub-folders, even if they are empty. This is due to the way Webpack resolves dynamic requires and it needs to scan folders like `app/controllers` or `app/widgets`. Make sure your project structure looks like this and create folders if neccessary:

```
app/
├── assets/
├── controllers/
├── i18n/
├── lib/
├── models/
├── platform/
├── styles/
├── views/
├── widgets/
├── alloy.js
└── config.json
```

### No automatic processing of assets/lib/vendors folders

When you are migrating from an Alloy app without Webpack, you are probably used to the fact all content from the following directories is copied to your app:

- `app/assets`
- `app/lib`
- `app/vendor`

This is only true for `app/assets` by default when you are using Webpack. All files from this directory will be copied directly into your app as-is. Source files in `app/lib` will be bundled by Webpack into a _single_ output file.

Usage of the `app/lib` directory is discuraged with Webpack. It is recommended to install all your third-party libraries as Node modules and let Webpack process them from there.

### Code changes

In addition to the changes described in the [general guidelines](#general-guidelines) above, there are a couple of Alloy specific changes that your need to apply to your project.

#### Replace `WPATH` with `@widget`

Requires in widgets need to use `@widget` instead of `WPATH`

```js
// without webpack
require(WPATH('utils'))

// with webpack
require('~widget/utils')
```

#### Use ES6 `export` in Models

Models **need** to use ES6 `export`. To migrate, symply change `exports.definition =` to `export const definition =`.

```js
// without webpack
exports.definition = {
  config: {
    // ...
  }
}

// with webpack
export const definition = {
  config: {
    // ...
  }
}
```

#### Creating controllers

Make sure your are **not** using a leading slash when creating controllers.

```js
// wihtout webpack
Alloy.createController('/index')

// with webpack
Alloy.createController('index')
```

#### Custom `module` attribute in Views

If you specifiy a custom module on a view, remember that the same Webpack require rules apply here as well. Supposed you have a custom `TabbedBar` implementation in `app/libs/TabbedBar.js`, see the following example how to refer to it. Note the use of the `@` alias, which points to `app/lib` in Alloy apps.

```xml
<Alloy>
  <TabbedBar module="@/TabbedBar"></TabbedBar>
</Alloy>
```

### Notes

A few use cases from the original Alloy build are not supported yet when using Webpack. There are also some gotchas when you are coming from a legacy Alloy project that you need to be aware of when migrating your Alloy app to Webpack.

- Place **all** your JS source code that needs to be bundled by Webpack in `app/lib`. Remember that Webpack will only bundle your JS files when your actually `require`/ `import` them. They will **not** automatically be copied into the app.
- Only the `app/assets` folder will be copied to your app directly. The same applies to widget's `assets` directory.
- JavaScript files in `app/assets` will be copied as-is and will not be transpiled via Babel. Keep this in mind when you are trying to use them in a WebView, for example.
- The `app/vendor` directory is ignored by Webpack and will not be copied to your app. Use NPM packages to bundle your third-party dependencies with Webpack, or move existing source code to `app/lib` if you can't rely on NPM packages for a specific dependency.

### Known limitations

- No support for Alloy JS makefiles (JMK).
- No support for `DefaultIcon.png` from themes.
- Views always need to have a matching file in `controllers`. The controller file can be empty, but it needs to be there for Webpack to properly discover the component.

## Webpack Configuration

Titanium comes with pre-defined Webpack configurations to get you started quickly. We use [webpack-chain](https://github.com/neutrinojs/webpack-chain) internally to dynamically build the configuration depending on the project type. You can hook into this and change the Webpack configuration as you like.

### Hook into webpack-chain

To change the Webpack configuration you need to create a new plugin file somewhere in your project. This plugin file needs to export a function which will receive a [Plugin API](./hook-api/README.md) object and some genral project options. Using the Plugin API you can tap into the Webpack configuration.

```js
// <project-root>/my-plugin.js

module.exports = (api, options) => {
  api.chainWebpack(config => {
    // modify config here
  });
}
```

After you have created the plugin file you need to activate it in your `package.json`.

```json
{
  "appcdWebpackPlugins": [
    "my-plugin.js"
  ]
}
```

> 💡 **TIP:** The Webpack service will automatically watch local plugins for changes and restarts the Webpack build task to properly load updated config values.

### Examples

The follwing examples demonstrate how to use the `chainWebpack` function to modify the Webpack configuration. Also take a look the extensive list of [examples from webpack-chain](https://github.com/neutrinojs/webpack-chain#getting-started) to see what else you can do with the `config` object.

#### Add alias

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.resolve
      .alias
        .set('~utils', api.resolve('app', 'src', 'utils'));
  });
}
```

#### Add loader

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.module
      .rule('txt')
        .test(/\.txt$/i)
        .use('file-loader')
          .loader('file-loader')
          .options({
            name: '[path][name].[ext]'
          });
  });
}
```

#### Delete plugin

Delete a named plugin from the configuration. Refer to the bundled [configuration files](./src/config) to see what named plugins are configured.

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.plugins.delete('copy-assets');
  });
}
```
