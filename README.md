# @appcd/plugin-webpack

Appcd plugin to manage Webpack build tasks.

> 💡 Refer to the [migration guide](./migration.md) for instruction how to enable Webpack in your existing Titanium projects.

## Getting started

Install the Webpack plugin globally. Appcd will automatically detect the new plugin and start it on demand.

```bash
npm i @appcd/plugin-webpack -g
```

## Configuration

You can change the global configuration settings for this plugin in `~/.appcelerator/appcd/config.json`. Have a look at the default [`config.js`](config/config.js) file to see what options are available. For example, to increase the activity timeout of Webpack build jobs to 20 minutes, add the following:

```json
{
    "webpack" {
        "inactivityTimeout": 1200000
    }
}
```

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
