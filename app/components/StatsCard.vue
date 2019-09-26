<template>
  <dashboard-card>
    <v-card-text>
      <div class="d-flex justify-space-between align-start">
        <v-icon size="48" class="mx-2" color="primary">{{ icon }}</v-icon>
        <div class="text-right">
          <p class="ma-0 gray-text">{{ title }}</p>
          <h3 class="stats-value font-weight-light primary--text">
            {{ value }}
          </h3>
        </div>
      </div>
    </v-card-text>
    <v-divider class="mx-3" />
    <v-card-actions class="stats-sub grey--text text--lighten-1">
      <v-icon size="20" class="mx-2 grey--text text--lighten-1">
        {{ subIcon }}
      </v-icon>
      {{ subText }}
    </v-card-actions>
  </dashboard-card>
</template>

<script>
export default {
  props: {
    title: String,
    icon: String,
    value: String,
    subIcon: String,
    subText: String
  }
}
</script>

<style lang="sass">
.stats-value
  font-size: 2.5rem
  line-height: 1.5em
.stats-sub
  font-size: 0.8rem
</style>
