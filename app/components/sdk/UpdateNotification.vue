<template>
  <dashboard-card>
    <v-card-title>
      Update available!
    </v-card-title>

    <v-card-text>
      <div class="text-center">
        <p>
          <v-icon size="64" color="primary">$titanium</v-icon>
        </p>
        <h2 class="headline pb-5 pt-2">
          A new SDK is available: <strong>{{ installSdk }}</strong>
        </h2>
        <v-btn color="primary">
          Update now!
        </v-btn>
      </div>
    </v-card-text>
  </dashboard-card>
</template>

<script>
export default {
  props: {
    installSdk: {
      type: String,
      required: true
    }
  }
}
</script>
