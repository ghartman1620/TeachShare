import axios from 'axios'

export default axios.create({
    baseURL: 'http://35.185.199.36/api',
    timeout: 100000,
    headers: {},
});
