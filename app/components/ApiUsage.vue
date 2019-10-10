<template>
  <dashboard-card class="card-stretch">
    <v-card-title class="justify-space-between">
      <span>API Usage</span>

      <v-tooltip left max-width="250">
        <template v-slot:activator="{ on }">
          <v-icon color="grey lighten-1" v-on="on">
            mdi-information-outline
          </v-icon>
        </template>
        <span>
          In production builds, the native Titanium source code will be
          optimized based on this list of APIs that were found in your
          JavaScript code.
        </span>
      </v-tooltip>
    </v-card-title>
    <v-card-text>
      <stats-loading v-if="!apiTreeItems.length" />
      <div v-else class="treeview-wrapper">
        <v-treeview :items="apiTreeItems" dense hoverable open-on-click>
          <template v-slot:prepend="{ item, open }">
            <v-icon v-if="item.type === 'namespace'" color="primary">
              mdi-cube-outline
            </v-icon>
            <v-icon v-else color="primary">
              mdi-code-tags
            </v-icon>
          </template>
        </v-treeview>
      </div>
    </v-card-text>
  </dashboard-card>
</template>

<script>
import { mapState } from 'vuex'

import StatsLoading from './StatsLoading'

export default {
  components: {
    StatsLoading
  },
  computed: {
    ...mapState('webpack', {
      job: 'currentJob'
    }),
    apiTreeItems() {
      if (!this.job.tiSymbols) {
        return []
      }

      const rootNode = { name: 'root', children: [] }
      const symbolSet = new Set()
      for (const file in this.job.tiSymbols) {
        const symbols = this.job.tiSymbols[file]
        for (const symbol of symbols) {
          symbolSet.add(symbol)
        }
      }
      const symbols = Array.from(symbolSet).sort()
      let id = 1
      for (const symbol of symbols) {
        const parts = symbol.split('.')
        if (parts[0] === 'Titanium') {
          parts.shift()
        }
        let node = rootNode
        for (const symbolPart of parts) {
          const childNodeIndex = node.children.findIndex(
            value => value.name === symbolPart
          )
          if (childNodeIndex === -1) {
            let type = 'symbol'
            if (/^[A-Z][a-z]/.test(symbolPart)) {
              type = 'namespace'
            }
            const newNode = {
              id: id++,
              name: symbolPart,
              children: [],
              type
            }
            node.children.push(newNode)
            node.type = 'namespace'
            node = newNode
          } else {
            node = node.children[childNodeIndex]
          }
        }
      }
      return rootNode.children
    }
  }
}
</script>

<style lang="sass">
.treeview-wrapper
  height: 275px
  overflow-y: scroll
</style>
