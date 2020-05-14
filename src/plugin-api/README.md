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

The Plugin API provides a set of hooks that you can use to modify the Webpack configuration. It also offers a couple of utility functions that come in handy when writing plugins.

### Hooks

All hook functions accept two parameters. The first is the `value` that should be added, the second is an optional `options` object.

The `options` object accepts the following properties, which are all optional:

| Name | Type | Description |
|---|---|---|
| `name` | `string` | A name that will be associated with the added value. By default this is the plugin id. |
| `before` | `string` | Used to modify the order in which hooks will be applied. By default they are added in same  order as plugins are loaded. Specify `before` to make sure a hook will execute before another hook, identified by it's `name`option. |
| `before` | `string` | Used to modify the order in which hooks will be applied. By default they are added in same  order as plugins are loaded. Specify `after` to make sure a hook will execute after another hook, identified by it's `name`option. |

#### `chainWebpack(config => {}, options)`

Use [webpack-chain](https://github.com/neutrinojs/webpack-chain) to modify the Webpack configuration.

```js
module.exports = (api) => {
  api.chainWebpack(config => {
    config.resolve.alias
      .set('~utils', path.join(api.getCwd(), 'utils'));
  });
};
```

#### `watch(files, options)`

The `watch` hook lets you watch custom files for restarting the Webpack build process.

```js
module.exports = (api) => {
  api.watch(['my.config.js'])
};
```

### Utility

#### `getCwd()`

Returns the current working directory. This is your project root directory.

```js
module.exports = (api) => {
  const projectDir = api.getCwd();
};
```

#### `resolve(...paths)`

Resolves a path relative to the current working directory.

```js
module.exports = (api) => {
  const platformDir = api.resolve('platform');
};
```

#### `hasPlugin(id)`

Checks if there is another plugin with the given identifier.

```js
module.exports = (api) => {
  if (api.hasPlugin('typescript')) {
    // do something if TypeScript plugin is available
  } else {
    // ...
  }
};
```

#### `generateCacheConfig(name, baseIdentifier, configFiles)`

Generates a new configuration for `cache-loader` based on the passed identifier object and the content of any additional config files.

```js
module.exports = (api) => {
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
