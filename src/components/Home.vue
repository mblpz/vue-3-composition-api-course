<template>
  <Suspense>
    <template #default>
      <Timeline />
    </template>
    <template #fallback>
      <div class="columns">
        <div class="column is-one-third"></div>
        <div class="column is-one-third">
          <Loader />
        </div>
        <div class="column is-one-third"></div>
      </div>
    </template>
  </Suspense>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

import Loader from './Loader.vue'
import Timeline from './Timeline.vue'

export default defineComponent({
  name: 'Home',

  components: {
    Timeline,
    Loader,
  }
})
</script>
