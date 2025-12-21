import { createRouter, createWebHistory } from 'vue-router'
import FeedView from '../views/FeedView.vue'
import SettingsView from '../views/SettingsView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/feed/:feed_id',
            name: 'feed',
            component: FeedView,
        },
        {
            path: '/settings',
            name: 'settings',
            component: SettingsView,
        },
    ],
})

export default router
