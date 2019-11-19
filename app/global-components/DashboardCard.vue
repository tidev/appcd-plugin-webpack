<template>
  <v-card class="d-card" v-bind="$attrs" v-on="$listeners">
    <slot />
  </v-card>
</template>

<style lang="sass">
.v-card
  &.d-card
    box-shadow: 0 2px 4px 0 rgba(14, 30, 37, .12)

    &:not(.v-sheet--tile):not(.v-card--shaped)
      border-radius: 8px

    ::-webkit-scrollbar
      width: 6px

    ::-webkit-scrollbar-track
      background: #fff

    ::-webkit-scrollbar-thumb
      background: #e2e2e2
      border-radius: 3px

    ::-webkit-scrollbar-thumb:hover
      background: #d6d6d6
</style>
