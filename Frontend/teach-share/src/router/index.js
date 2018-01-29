import Vue from 'vue';
import Vuex from 'vuex';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import Test from '@/components/Test';
import PostCreate from '@/components/PostCreate';

Vue.use(Router);
Vue.use(Vuex);

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
        }
    ]
})