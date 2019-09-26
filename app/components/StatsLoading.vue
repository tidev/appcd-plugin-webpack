<template>
  <div class="stats-loading text-center">
    <v-icon size="48" class="pb-3" color="primary">mdi-webpack</v-icon>
    <p class="grey--text">Waiting for stats...</p>
  </div>
</template>

<style lang="sass">
.stats-loading
  margin: auto
  .v-icon
    animation: pulse 3s ease-in-out infinite

@keyframes pulse
  0%
    opacity: 1
    transform: scale(1)
  50%
    opacity: 0.7
    transform: scale(0.8)
  100%
    opacity: 1
    transform: scale(1)
</style>
