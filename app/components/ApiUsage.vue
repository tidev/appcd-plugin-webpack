<template>
  <dashboard-card class="card-stretch">
    <v-card-title>API Usage</v-card-title>
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
            const newNode = {
              id: id++,
              name: symbolPart,
              children: [],
              type: 'symbol'
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
