import Vue from 'vue';
import Base from '@/components/Base';
import router from '@/router';
import _ from 'lodash';

describe('Base.vue', () => {
    it('should render correct contents', () => {
        const Constructor = Vue.extend(Base)
        const vm = new Constructor({router}).$mount()
        console.log(vm.$data)
        let re = new RegExp('([\\n]|[\\s])*', 'g')
        expect(vm.$el.querySelector('.navbar').textContent.trim().replace(re, ''))
            .to.equal('CreatePostProfileYourpostfeedYourpostsAccountdetailsSearch')
    })
    it('should have a queryParam data item', () => {
        const Constructor = Vue.extend(Base)
        const vm = new Constructor({router}).$mount()
        const qp = vm.$data.queryParam
        console.log(qp)
        // expect(typeof vm.$data).toBe('function')
        // const qp = vm.$data()
        expect(qp).to.equal('')
        // console.log(vm.$children)
        _.forEach(vm.$children, function(val, key) {
            // console.log(key, ': ', val, '\n\n\n')
            _.forEach(val, function(val, key) {
                console.log(key)
            })
        })
    })
})