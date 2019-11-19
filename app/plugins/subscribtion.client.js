import Vue from 'vue'

import { client } from '@/utils/subscription'

Vue.prototype.$subscribe = client.subscribe.bind(client)
