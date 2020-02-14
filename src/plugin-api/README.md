# Plugin API

The plugin API lets you hook into the Webpack build process and modify it to fit your needs of every Titanium project.

> 💡 The Plugin API is heavily inspired by VuePress and Vue CLI. In fact, it's a mix and match of several concepts from these two projects, adapted to the architecture of `appcd-plugin-webpack`. If you know how to write plugins for either of those, you will find yourself quite familiar with how plugins work here as well.

## Getting started

Simply create a new plugin file that exports a function. This functions receives the Plugin API object and an options object containing information about the current environment, build settings and other options. Refer to the [Options](#options) section for more details on the `options` object.

```js
// my-plugin.js

module.exports = (api, options) => {
  // your plugin code goes here
};
```

Activate the plugin by adding it to the `appcdWebpackPlugins` section in your `package.json`:

```json
{
  "appcdWebpackPlugins": [
    "./my-plugin.js"
  ]
}
```

## API

The Plugin API provides a set of hooks that you can use to modify the Webpack configuration. It also offers a couple of utility function that come in handy when writing plugins.

### chainWebpack(config => {})

Use [webpack-chain](https://github.com/neutrinojs/webpack-chain) to modify the Webpack configuration.

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.resolve.alias
      .set('~utils', path.join(api.getCwd(), 'utils'));
  });
};
```

### watch(files)

The `watch` hook lets you watch custom files for restarting the Webpack build process.

```js
module.exports = (api, options) => {
  api.watch(['my.config.js'])
};
```

### getCwd()

Returns the current working directory. This is your project root directory.

```js
module.exports = (api, options) => {
  const projectDir = api.getCwd();
};
```

### resolve(...paths)

Resolves a path relative to the current working directory.

```js
module.exports = (api, options) => {
  const platformDir = api.resolve('platform');
};
```

### hasPlugin(id)

Checks if there is another plugin with the given identifier.

```js
module.exports = (api, options) => {
  if (api.hasPlugin('typescript')) {
    // do something if TypeScript plugin is available
  } else {
    // ...
  }
};
```

### generateCacheConfig(name, baseIdentifier, configFiles)

Generates a new configuration for cache-loader based on the passed identifier object and the content of any additional config files.

```js
module.exports = (api, options) => {
  api.chainWebpack(config => {
    config.module
      .rule('js')
      .use('cache-loader')
      .options(api.generateCacheConfig('babel-loader', {
        '@babel/core': require('@babel/core/package.json').version,
        'babel-loader': require('babel-loader/package.json').version
      }, [
        'babel.config.js'
      ]));
  });
};
```

## Options

The `options` objects holds contextual information about the project and the current Webpack build.

- `project`: Project info
  - `path`: Full path to the project.
  - `name`: Project name
  - `type`: The project type. One of `alloy`, `classic`, `angular`, or `vue`. This value is used to choose the appropriate built-in Webpack config to load.
  - `tiapp`: The project's parsed `tiapp.xml`

- `build`: Build settings passed from the Titanium CLI.
  - `platform`: Current platform, either `android` or `ios`.
  - `deployType`: Current deploy type. One of `development`, `test` or `production`.
  - `target`: The current build target.

  The above settings correspond to the same settings you can pass to the CLI. See the CLI help for more details. The following `sdk` property is computed from the SDK the CLI selected to build your app.

  - `sdk`: Contains info about the selected SDK.
    - `path`: Full path to the SDK root.
    - `version`: Version number of the SDK.
    - `gitHash`: Git hash of the latest commit that the SDK was build on.
    - `buildDate`: Timestamp of the SDK's build date.

  There can also be an optional `android` or `ios` property depending on the platform you are building for. It is used to pass platform specific options that are relevant for the Webpack build. Currently only `ios` has platform specific options.

  - `ios`:
    - `deviceFamily`: Supported device family, can either be `universal`, `ipad` or `ipad`.

- `watch`: Whether or not Webpack will be run with the `watch` option. Defaults to `true` for development/test builds and `false` for production builds.

- `transpileDependencies`: List of dependencies from the project's `node_modules` folder that should be transpiled via Babel. Pre-populated from values in your `tiapp.xml`.

> ⚠️ Note: The options object is shared across all plugins and writable. You can use it to both read and write options. Be carefull when writing to the options and make sure you know what you are doing, since it can change the behavior of other plugins and the Webpack build.
