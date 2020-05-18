import {
  mdiWebpack,
  mdiAlert,
  mdiClose,
  mdiGithubCircle,
  mdiPlay,
  mdiTag,
  mdiAngular,
  mdiVuejs,
  mdiLanguageJavascript,
  mdiTimerSand,
  mdiAccountClockOutline,
  mdiCheckboxMarkedCircle,
  mdiInformationOutline,
  mdiStopCircleOutline,
  mdiCheckboxBlankCircle,
  mdiExclamation,
  mdiApple,
  mdiAndroid,
  mdiCheck,
  mdiStop,
  mdiConsole,
  mdiViewGrid,
  mdiCloudOffOutline,
  mdiDevices,
  mdiFileQuestionOutline,
  mdiMusic,
  mdiFormatFont,
  mdiImageOutline,
  mdiDatabase,
  mdiXml,
  mdiCubeOutline,
  mdiCodeTags,
  mdiVideoOutline,
  mdiSettings,
  mdiMagnify,
  mdiDelete,
  mdiCellphone,
  mdiCloudSearchOutline,
  mdiCloudDownloadOutline,
  mdiFlask
} from '@mdi/js'

import TitaniumIcon from '@/components/TitaniumIcon'

export default {
  icons: {
    iconfont: 'mdiSvg',
    values: {
      accountClock: mdiAccountClockOutline,
      apple: mdiApple,
      android: mdiAndroid,
      titanium: {
        component: TitaniumIcon
      },
      angular: mdiAngular,
      alert: mdiAlert,
      cellphone: mdiCellphone,
      check: mdiCheck,
      checkboxBlank: mdiCheckboxBlankCircle,
      checkboxMarked: mdiCheckboxMarkedCircle,
      cloudOff: mdiCloudOffOutline,
      close: mdiClose,
      cloudDownload: mdiCloudDownloadOutline,
      cloudSearch: mdiCloudSearchOutline,
      code: mdiCodeTags,
      console: mdiConsole,
      cube: mdiCubeOutline,
      database: mdiDatabase,
      delete: mdiDelete,
      devices: mdiDevices,
      exclamation: mdiExclamation,
      flask: mdiFlask,
      fileQuestion: mdiFileQuestionOutline,
      font: mdiFormatFont,
      github: mdiGithubCircle,
      image: mdiImageOutline,
      information: mdiInformationOutline,
      javascript: mdiLanguageJavascript,
      music: mdiMusic,
      play: mdiPlay,
      search: mdiMagnify,
      settings: mdiSettings,
      stop: mdiStop,
      stopCircle: mdiStopCircleOutline,
      tag: mdiTag,
      timerSand: mdiTimerSand,
      video: mdiVideoOutline,
      viewGrid: mdiViewGrid,
      vuejs: mdiVuejs,
      webpack: mdiWebpack,
      xml: mdiXml
    }
  },
  theme: {
    themes: {
      light: {
        primary: '#00b3a4',
        // accent: colors.grey.darken3,
        // secondary: colors.amber.darken3,
        info: '#1982C4',
        warning: '#F8C10D',
        error: '#fb656f',
        success: '#8AC926'
      }
    }
  }
}
