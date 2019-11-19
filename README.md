# @appcd/plugin-webpack

Appcd plugin to manage Webpack build tasks.

## Endpoints

This plugin registers the following endpoints:

### `/start`

Start a new Webpack build task.

#### Payload

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  A unique identifier for the Webpack build task. |
| `projectPath` | `string` | Full path to the Titanium project. |
| `type` | `string` |  Project type to load the appropriate config. Must be one of `angular`, `classic` or `vue` |
| `platform` | `string` |  The platform target for the build task. Must be either `android` or`ios` |

### `/stop/:identifier`

Stop a running Webpack build task.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  Unique identifier of the Webpack build task to stop. |

### `/status/:identifier`

Query the status of a webpack build task.

#### Parameters

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  Unique identifier of the Webpack build task to query status for. |

This endpoint supports subscriptions to get real-time updates about Webpack build status.

### `/progress/:identifier`

Subscription endpoint for real-time progress updates of Webpack build tasks.

| Name | Type | Description |
| --- | --- | --- |
| `identifier` | `string` |  Unique identifier of the Webpack build task to receive progress updates for. |

### `/web`

Serves a Web UI to manage Webpack build tasks.

![Web UI](/.github/web-ui.png "Web UI")

## Legal

This project is open source under the [Apache Public License v2][1] and is developed by
[Axway, Inc](http://www.axway.com/) and the community. Please read the [`LICENSE`][1] file included
in this distribution for more information.

[1]: https://github.com/appcelerator/appc-plugin-webpack/blob/master/LICENSE
