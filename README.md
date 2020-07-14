# @appcd/plugin-webpack

Appcd plugin to manage Webpack build tasks.

> 💡 Refer to the [migration guide](./migration.md) for instruction how to enable Webpack in your existing Titanium projects.

## Introduction

By default Titanium uses Babel to transform your JavaScript code and run optimizations. This works great out of the box, however you have very little control over this process and can only customize it with Babel plugins. Also, integrating new tooling into this pipeline via CLI hooks feels kind of "hacky", and in most cases is very specific to a single project. To address these issues, as well as building the proper foundation for upcoming Vue.js and Angular integration, we decided to introduce Webpack as an alternative build pipeline for all your app's assets.

Switching to the Webpack build enables a lot of great improvemnts:

- Significantly faster build times for both clean and incremental builds, especially for larger projects.
- Pre-configured for your Titanium project, no need to deal with Webpack configuration files to get you up and running.
- Highly customizable via a simple plugin API, which allows you to hook into the Webpack configuration with [webpack-chain](https://github.com/neutrinojs/webpack-chain). Add new loaders and/or plugins to introduce new capabilites into your project.
- Easily use your favorite modules from NPM. Just install them into the project root.
- Web UI to view build results and analyze your app bundle assets.

## Getting started

Install the Webpack plugin globally. Appcd will automatically detect the new plugin and start it on demand.

```bash
npm i @appcd/plugin-webpack -g
```

## Plugin Configuration

You can change the global configuration settings for this plugin in `~/.appcelerator/appcd/config.json`. Have a look at the default [`config.js`](config/config.js) file to see what options are available. For example, to increase the activity timeout of Webpack build jobs to 20 minutes, add the following:

```json
{
    "webpack": {
        "inactivityTimeout": 1200000
    }
}
```

## FAQ

### The Webpack build is stuck, how can i restart it?

Building the app with the `--force` flag will restart the whole Webpack build process for the current project. You can also start/stop the build via the Web UI in the detail view for a specific build.

If nothing else helps, try stopping the daemon with `appcd stop`, which will automatically stop all currently active Webpack builds as well.

### How can I view log output?

You can stream the log output from the daemon with `appcd logcat`. To display messages from the Webpack plugin only you can filter them using `appcd logcat "*webpack*"`.

### The build errors with "Not found", what should i do now?

Make sure that you have the Webpack plugin installed and loaded. You can check the status of all currently installed plugins with `appcd status`.

If the Webpack plugin shows up in that list but you still see the error, you may have to restart the Daemon. There is a known bug in the configuration system which can prevent the plugin from loading the first time after it was installed. In that case simply stop the daemon with `appcd stop` and build your app again.

## Endpoints

This plugin registers the following endpoints:

### `/start/:identifier?`

Start a new Webpack build task.

The `identifier` path parameter is optional. It is usefull if you want to start an existing Webpack build without changing its options.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  (Optional) Identifier of an existing Webpack build task to start. |

#### Payload

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  A unique identifier for the Webpack build task. |
| `projectPath` | `string` | Full path to the Titanium project. |
| `projectType` | `string` |  Project type to load the appropriate config. Must be one of `classic`, `alloy`, `angular` or `vue`. |
| `deployType`| `string` | Current deploy type. Must be one of `development`, `test` or `production`. |
| `platform` | `string` |  The platform target for the build task. Must be either `android` or`ios`. |
| `buildTarget`| `string` | The current build target. |
| `sdkPath`| `string` | Full path to the SDK that is used to build with. |
| `watch`| `boolean` | Whether to to start Webpack in watch mode or not, `false` by default. |

### `/stop/:identifier`

Stop a running Webpack build task.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  Unique identifier of the Webpack build task to stop. |

### `/status/:identifier?`

Query the status of a webpack build task.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  Unique identifier of the Webpack build task to query status for. |

> 💡 This endpoint supports subscriptions to get real-time updates for the Webpack build.

For subscription calls to this endpoint the `identifier` parameter is optional. If omitted, it will only publish following two events:

- `added`: Published when a new Webpack build was added. The event data contains basic job info.
- `state`: Published when the state of any Webpack build changes. The event data contains basic job info.

#### Events

When you subscribe to this entpoint for a specific Webpack build, you will be notified about build status changes and progress info via the following events:

| Name | Description |
| --- | --- |
| `state` | Published when the state of a Webpack build changes. |
| `progress` | Progress update for the current Webpack compilation. |
| `output` | Any output emitted by the Webpack build will be streamed via this event. |
| `api-usage` | Published whenever the usage of Titanium APIs changes. |
| `done` | Published when the current Webpack compilation finished. Includes pre-processed Webpack stats data. |

### `/web`

Serves a Web UI to manage Webpack build tasks.

![Web UI](/.github/web-ui.png "Web UI")

## Development

1. Clone this repo and:
    - Install dependencies with `yarn`.
    - Link with `npm` so appcd can find the plugin: `npm link`. This needs to be done with NPM since appcd only searches the global NPM modules folder for available plugins (and not the one from Yarn).
1. To start developing and recompile the plugin on changes run `yarn dev`
1. (Optional) Start the Web UI in dev mode with `yarn app:dev`.

## Legal

This project is open source under the [Apache Public License v2][1] and is developed by
[Axway, Inc](http://www.axway.com/) and the community. Please read the [`LICENSE`][1] file included
in this distribution for more information.

[1]: https://github.com/appcelerator/appc-plugin-webpack/blob/master/LICENSE
