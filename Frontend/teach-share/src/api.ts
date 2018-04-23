import axios from 'axios'

console.log(process.env.API_ENDPOINT);

export default axios.create({
    baseURL: 'http://35.185.199.36/api',
    timeout: 100000,
    headers: {},
});
