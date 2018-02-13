import Vue from 'vue';
import Vuex from 'vuex';
import Router from 'vue-router';
import HelloWorld from '@/components/HelloWorld';
import Base from '@/components/Base';
import PostCreate from '@/components/PostCreate';
import Login from '@/components/Login';
import PostFeed from '@/components/PostFeed';
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
            component: Base,
            children:[
                {
                    path: '',
                    name: 'home',
                    component: 'Test',
                },
                {
                    path: 'create',
                    name: 'PostCreate',
                    component: PostCreate,
                    children: [
                        {
                            name: 'text',
                            path: 'text',
                            component: 'EditText',
                            props: {
                                component: {
                                    type: 'text',
                                    content: '', 
                                },
                                'index': 0,
                            }
                        }
                    ]
                },
            ]
        },
        
        {
            path: '/login',
            name: 'Login',
            component: Login
        },
        {
            path: '/dashboard',
            name: 'PostFeed',
            component: PostFeed
        },
        

    ]
})