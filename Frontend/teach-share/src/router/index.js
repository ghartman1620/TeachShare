import Vue from 'vue';
import Vuex from 'vuex';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import Base from '@/components/Base';
import PostCreate from '@/components/PostCreate';
import Login from '@/components/Login';

Vue.use(Router);


export default new Router({
    routes: [{
            path: '/',
            name: 'HelloWorld',
            component: HelloWorld
        },
        {
            path: '/base',
            name: 'base',
            component: Base
        },
        {
            path: '/create',
            name: 'PostCreate',
            component: PostCreate
        },
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
    ]
})
