import Vue from 'vue';
import Vuex from 'vuex';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import Test from '@/components/Test';
import PostCreate from '@/components/PostCreate';
import Base from '@/components/Base';

Vue.use(Router);


export default new Router({
    routes: [{
            path: '/',
            name: 'HelloWorld',
            component: HelloWorld
        },
        {
            path: '/test',
            name: 'Test',
            component: Test
        },
        {
            path: '/create',
            name: 'PostCreate',
            component: PostCreate
        },
        {
            path: '/base',
            name: 'Base',
            component: Base
        }
    ]
})