# Webpack Migration Guide

This migration guides walks you though the steps you need to take to enable Webpack in your existing Titanium project.

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

[babel-loader](https://github.com/babel/babel-loader) is pre-configured for every Webpack enabled Titanium project. To properly transpile your JS code to the target platform you are building for, you need to install the [titanium-babel-preset-app](https://github.com/appcelerator/babel-preset-app#readme) into your project and create `babel.config.js` with the following content:

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

When bundling code with Webpack there are a few rules you need to follow.

Dynamic requires need to be adopted to work well with webpack. See [require with expression](https://webpack.js.org/guides/dependency-management/#require-with-expression).

Non-relative requires are only valid for built-in Node modules or NPM packages. The Titanium `require` implementation has a non-spec fallback to resolve non-relative requires from the app root. This is not supported when using Webpack. `require('my-local-module')` → `require('../my-local-module')`

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

For easier transitioning Webpack copies all assets from `app/assets` to your app for Classic and Alloy projects by default. However, since [file-loader](https://github.com/webpack-contrib/file-loader) is also pre-configured you can make use of if you want and disable the legacy copying of all asset.

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

Note the use of the `~` alias which automatically resolves to the `app/assets` folder of your project. Webpack will now make sure to copy that file to your app and replace the require with the path pointing to the image withing your app.

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

## Classic

Migrating a classic project is pretty straight forward. All you need to do is to move your existing files into a new `app` directory in your project root.

- Move JavaScript source files to `app/src`
- Rename `app.js` to `main.js`
- Move assets into `app/assets`

Webpack will then process and bundle all your JS files and assets and put them back into `Resources`.

> 💡 **TIP:** Add the `Resources` folder to your `.gitignore` since it will be created by Webpack now and should be considered as an intermediate build folder.

## Alloy

### Install dependencies

When using Webpack and Alloy together you need to install `alloy` and `alloy-compiler` dependencies into your project.

```bash
npm i alloy alloy-compiler -D
```

This allows you to choose the `alloy` version on a per project level.

### Remove old Alloy plugin

Since Webpack now compiles your Alloy app the default Alloy plugin is not required anymore. You can safely delete `plugins/ti.alloy` and remove it from the `plugins` section of your `tiapp.xml`.

### Code changes

In addition to the changes described in the [general guidelines](#general-guidelines) above, there are a couple of Alloy specific changes that your need to apply to your project.

- Requires in widgets need to use `@widget` instead of `WPATH`: `require(WPATH('utils'))` → `require('@widget/utils')`
- Models **need** to use ES6 `export`. To migrate, symply change `exports.definition =` → `export const definition =`
- Make sure your are **not** using a leading slash when creating controllers. `Alloy.createController('/intro')` → `Alloy.createController('intro')`

If you specifiy a custom module on a view, remember that the same Webpack require rules apply here as well. Supposed you have a custom `TabbedBar` implementation in `app/libs/TabbedBar.js`, see the following example how to refer to it. Note the use of the `@` alias.

```xml
<Alloy>
  <TabbedBar module="@/TabbedBar">
  </TabbedBar>
</Alloy>
```

## Webpack Configuration

Titanium comes with pre-defined Webpack configurations to get you started quickly. We use [webpack-chain](https://github.com/neutrinojs/webpack-chain) internally to dynamically build the configuration depending on the project type. You can hook into this and change the Webpack configuration as you like.

### Hook into webpack-chain

To change the Webpack configuration you need to create a new hook file under `hooks`. This hook file needs to export a function which will receive a [Hook API](./hook-api/README.md) object and some genral project options. Using the Hook API you can tap into the Webpack configuration.

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    // modify config here
  });
}
```

After you have created the file you need to activate the hook in your `package.json`.

```json
{
  "appcdHooks": [
    "hooks/my-hook.js"
  ]
}
```

> 💡 **TIP:** The Webpack plugin will automatically watch your hooks for changes and restarts the Webpack build task to properly load updated config values.

### Examples

Also take a look the extensive list of [examples from webpack-chain](https://github.com/neutrinojs/webpack-chain#getting-started) to see what else you can do with the `config` object.

#### Add alias

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.resolve
      .alias
        .set('@u', api.resolve('app', 'src', 'utils'));
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

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.plugins.delete('copy-assets');
  });
}
```
