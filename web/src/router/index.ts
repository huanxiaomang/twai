import { createRouter, createWebHistory } from 'vue-router'
import FeedView from '../views/FeedView.vue'
import HomeView from '../views/HomeView.vue'
import SettingsView from '../views/SettingsView.vue'
import AboutView from '../views/AboutView.vue'
import NotFoundView from '../views/NotFoundView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
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
        {
            path: '/about',
            name: 'about',
            component: AboutView,
        },
        {
            path: '/:pathMatch(.*)*',
            name: 'not-found',
            component: NotFoundView,
        },
    ],
})

export default router
