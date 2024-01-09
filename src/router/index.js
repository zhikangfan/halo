import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '@/pages/home'

Vue.use(VueRouter)

const routes = [
    {
        path: '/',
        name: 'home',
        component: Home
    },
    {
        path: '/editor',
        name: 'editor',
        component: () => import('@/pages/editor')
    },
    {
        path: '/editor2',
        name: 'editor2',
        component: () => import('@/pages/editor2')
    },
    {
        path: '/editor3',
        name: 'editor3',
        component: () => import('@/pages/editor3')
    },
    {
        path: '/test4',
        name: 'test4',
        component: () => import('@/pages/test4')
    },
    {
        path: '/test5',
        name: 'test5',
        component: () => import('@/pages/test5')
    },
    {
        path: '/test6',
        name: 'test6',
        component: () => import('@/pages/test6')
    },
    {
        path: '/test7',
        name: 'test7',
        component: () => import('@/pages/test7')
    },
    {
        path: '*',
        name: 'NotFound',
        redirect: () => '/'
    }
]

const router = new VueRouter({
    mode: 'history',
    routes,
    scrollBehavior() {
        return {
            x: 0,
            y: 0,
            behavior: 'smooth'
        }
    }
})

export default router
