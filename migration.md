# Webpack Migration Guide

This migration guides walks you though the steps you need to take to enable Webpack in your existing Titanium project.

## Getting started

First make sure you have at least version 3.2.0+ of [appc-daemon](https://github.com/appcelerator/appc-daemon) installed. The Appcelerator Daemon (or appcd for short) powers our Webpack build pipeline and manages all Webpack builds in the background.

```sh
npm i appcd -g
```

> 💡 **NOTE**
>
> If you use [appc-cli](https://docs.axway.com/bundle/Appcelerator_CLI_allOS_en/page/appcelerator_cli_getting_started.html) you don't need to install appcd globally. Just make sure you are at least on version 8.0 since it already includes appcd 3.2.0+.

### Install @appcd/plugin-webpack

The Webpack plugin for appcd manages all Webpack build tasks for your Titanium projects in the background. It also provides a simple Web UI to control Webpack builds and view the current build status. Install it globally with NPM and appcd will be able to automatically detect it.

```sh
npm i @appcd/plugin-webpack -g
```

> 💡 **NOTE**
>
> Installing the plugin with Yarn is not supported. You must use NPM to install the plugin or else appcd will not be able to find it.

### Install Titanium SDK 9.1.0

Webpack support was first introduced with SDK version 9.1.0, so make sure you are running the latest SDK.

```sh
ti sdk install -b master
```

> 💡 **NOTE**
>
> The [PR](https://github.com/appcelerator/titanium_mobile/pull/11346) for Webpack support is not merged yet. For now you have to build the SDK locally from the PR branch if you want to try it out.

### Install Project Plugins

Now that you have the neccessary global tools installed you just need to enable Webpack in your project. Install `webpack` and one of the new Titanium SDK Webpack Plugins into your project.

```sh
npm i webpack @titanium-sdk/webpack-plugin-<type> -D
```

> 💡 **NOTE**
>
> If your project does not contain a `package.json` yet, create one before installing the project plugins with `npm init --yes`. The Titanium CLI will scan the dependencies listed in `package.json` for installed Webpack plugins and enable Webpack support if one of the supported project type plugins was found.

The following plugins are currently available:

- [`@titanium-sdk/webpack-plugin-alloy`](https://github.com/appcelerator/webpack-plugin-alloy#readme)
- [`@titanium-sdk/webpack-plugin-classic`](https://github.com/appcelerator/webpack-plugin-classic#readme)

Please see the readme file of a plugin for additional install instructions and migration steps.

### Configure Babel

When migrating from the existing JavaScript build pipeline your are most likely used to Babel transpiling all JS code (unless you have set `<transpile>false</transpile` in your `tiapp.xml`, in that case you can skip this step). For Webpack, this is not the case by default since we want the Webpack build to be completely configurable.

But don't worry, there is another plugin to enable Babel again in your project. Install [`@titanium-sdk/webpack-plugin-babel`](https://github.com/appcelerator/webpack-plugin-babel) and create a `babel.config.js` to select the default Titanium preset.

```sh
npm i @titanium-sdk/webpack-plugin-babel -D
```

```js
module.exports = {
  presets: [
    '@titanium-sdk/app'
  ]
};
```

The preset will be configured automatically for you by default, but you can easily overwrite options through the config file if you like. Take a look at the [options](https://github.com/appcelerator/babel-preset-app#options) to see what's available.

> 💡 **NOTE**
>
> Although we highly recommend using [`@titanium-sdk/babel-preset-app`](https://github.com/appcelerator/babel-preset-app) for Titanium Apps, you can use any other Babel presets or plugins if you like. Just be sure you know what you are doing since you need to configure them yourself.

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

## Code migration

These are some general guidelines you should follow when using Webpack with Titanium. You need to apply these to your existing project when migrating from an Classic/Alloy Titanium project.

### `require`/`import` with Webpack

Requires are resolved at build time on your local machine, not from the root directory of your final app bundle. This is the most notable difference to non Webpack builds, where all requires will be resolved at runtime.

When you build your project for the first time after Webpack was enabled, you probably see a lot of errors about dependencies that were not found. But don't worry, Webpack explicitly lists which dependency was not found and in which files. A simple search & replace using the following rules will fix those errors in no time.

#### Dynamic requires

Dynamic requires with expressions need to be adopted to work well with webpack. Here is an example of a dynamic require:

```js
// without webpack
require(`date-fns/locales/${locale}`);

// with webpack
require(`date-fns/locales/${locale}.js`);
```

A few general rules you should follow:

- Have at least one static part in your expression.
- Always add a file extension to avoid inclusion of unrelated file types.

See [require with expression](https://webpack.js.org/guides/dependency-management/#require-with-expression) from Webpack docs for more details.

#### Absolute paths

```js
// without webpack
import '/utils/file';

// with webpack
import '@/utils/file';
```

Absolute paths are _not_ resolved from the root directory of your final app bundle, instead they are resolved on your local machine. Use the `@/` [alias](#aliases) to refer to the source root directory of your project.

#### Module paths

```js
import 'module';
import 'module/lib/file';
```

Modules are searched for inside the `node_modules` folder in your project.

To support the non-spec behavior of the Titanium `require` implementation, which looks for modules in the app root directory as well, the following folders will also be searched to maintain backwards compaibility:

- Classic: `src`
- Alloy: `app/lib` and `app/vendor`

Note that the folders are searched in order and the first match wins. Make sure to not have possible duplicates to avoid unexpected module resolution.

> ⚠️ **WARNING**
>
> Using a module style request to require your own source files is strongly discuraged when using Webpack. Support for this may be removed in future versions. Always use relative imports or make use of aliases.

### Aliases

To make your life easier when dealing with relative imports throughout your project there is a pre-defined alias.

- `@`: project source directory
  - **Classic**: `src`
  - **Alloy**: `app/lib`
  - **Vue.js**: `src`
  - **Angular**: `src`

### Using NPM modules

You can install NPM modules directly into your project root directory and require them in your Titanium code. Webpack takes care of the rest and makes sure to properly resolve and bundle them into your app.

This means that you can move any dependencies you have in

- Alloy: `app/lib/package.json`
- Classic: `Resources/package.json`

to the project root `package.json`. After that you can delete the now unused `package.json` file including the corrosponding `node_modules` from the above folders.

### Platform specific files

When using Webpack the use of platform specific files changes slightly. Instead of placing your resources in a platform specific subfolder, you need add the platform as a suffix to the filename.

> 💡 **TIP**
>
> This only applies to things that you `require`/`import` through Webpack. The `platform` folder for example is excempt from this new rule.

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

### Advanced: Asset management

For a simplified migration process, Webpack copies all assets from `src/assets` (Classic) or `app/assets` (Alloy) to your app by default. However, since [file-loader](https://github.com/webpack-contrib/file-loader) is already pre-configured you can make use of it if you'd like and disable the legacy copying of all asset. The main benefit of this is that you can chain more loaders into this process and, for example, automatically compress all used images by default to minify the size of your final App bundle.

For example, let's assume you have an image view defined like this:

```js
Ti.UI.createImageView({
  image: '/image.jpg'
})
```

To use `file-loader` you simply need to `require` the image:

```js
const imageView = Ti.UI.createImageView({
  image: require('@/assets/image.jpg')
})
```

Webpack will now make sure to copy that file to your app and replace the require with the path pointing to the image within your app.

Once you have changed all references to assets in your app with `require`/`import` you can disable the automatic copying of all assets by disabling the pre-configured `copy-assets` plugin. See the [delete plugin](#delete-plugin) example below in the [Webpack Configuration](#webpack-configuration) section how to do that.

> 💡 **TIP**
>
> Make sure to require *all assets* you want in your app. To copy fonts, for example, import the font files.
>
> ```js
> import '~/fonts/FontAwesome.otf'
> ```

## Webpack Configuration

Titanium comes with pre-defined Webpack configurations to get you started quickly. We use [webpack-chain](https://github.com/neutrinojs/webpack-chain) internally to dynamically build the configuration depending on the project type. You can hook into this and change the Webpack configuration as you like.

### Hook into webpack-chain

To change the Webpack configuration you need to create a new plugin file somewhere in your project. This plugin file needs to export a function which will receive a [Plugin API](./plugin-api/README.md) object and some genral project options. Using the Plugin API you can tap into the Webpack configuration.

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

> 💡 **TIP**
>
> The Webpack service will automatically watch plugins for changes and restarts the Webpack build task to properly load updated config values.

### Examples

The follwing examples demonstrate how to use the `chainWebpack` function to modify the Webpack configuration. Also check out the extensive list of [examples from webpack-chain](https://github.com/neutrinojs/webpack-chain#getting-started) to see what else you can do with the `config` object.

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

Delete a named plugin from the configuration. Refer to the bundled [configuration files](./src/config) as well as the readme and code of the `@titanium-sdk/webpack-plugin-*` packages to see what named plugins are configured.

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.plugins.delete('copy-assets');
  });
}
```
