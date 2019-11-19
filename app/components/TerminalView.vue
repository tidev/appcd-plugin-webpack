<template>
  <dashboard-card v-resize="fit" dark color="#0e1f25" class="terminal-card">
    <v-card-title class="terminal-header">
      <v-icon left>mdi-console</v-icon> Output
    </v-card-title>
    <v-card-text class="d-flex terminal-view pt-3">
      <div ref="render" class="terminal-render"></div>
    </v-card-text>
  </dashboard-card>
</template>

<script>
import { Terminal } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { WebLinksAddon } from 'xterm-addon-web-links'

const defaultTheme = {
  foreground: '#fff',
  background: '#0e1f25',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  black: '#000000',
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff'
}

export default {
  props: {
    cols: {
      type: Number,
      default: 100
    },
    rows: {
      type: Number,
      default: 25
    },
    content: {
      type: String,
      default: ''
    }
  },
  watch: {
    content: 'setContent'
  },
  mounted() {
    const term = (this.$terminal = new Terminal({
      cols: this.cols,
      rows: this.rows,
      theme: defaultTheme
    }))
    this.$fitAddon = new FitAddon()
    term.loadAddon(this.$fitAddon)
    this.$webLinksAddon = new WebLinksAddon(this.handleLink)
    term.loadAddon(this.$webLinksAddon)
    term.open(this.$refs.render)

    this.$nextTick(this.fit)

    this.setContent(this.content)
  },
  methods: {
    setContent(value, ln = true) {
      if (value.includes('\n')) {
        value.split('\n').forEach(t => this.setContent(t))
        return
      }
      if (typeof value === 'string') {
        this.$terminal[ln ? 'writeln' : 'write'](value)
      } else {
        this.$terminal.writeln('')
      }
    },
    addOutput(value) {
      this.setContent(value)
    },
    clear() {
      this.$terminal.clear()
    },
    async fit() {
      const term = this.$terminal
      term.element.style.display = 'none'
      await this.$nextTick()
      this.$fitAddon.fit()
      term.element.style.display = ''
      term.refresh(0, term.rows - 1)
    },
    handleLinks() {}
  }
}
</script>

<style lang="sass">
@import "~xterm/css/xterm"

.terminal-card
  position: relative
  display: flex
  flex-direction: column
  flex: 0 0 100%

  .terminal-view
    flex: 1 0 auto
    height: 0

    .terminal-render
      width: 100%
      height: 100%

      ::-webkit-scrollbar
        width: 8px

      ::-webkit-scrollbar-track
        background: #0e1f25

      ::-webkit-scrollbar-thumb
        background: #1B2C32
        border-radius: 4px

      ::-webkit-scrollbar-thumb:hover
        background: #28393F
</style>
