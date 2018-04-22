import axios from 'axios'

console.log(process.env.API_ENDPOINT);

export default axios.create({
    // baseURL: 'http://35.185.199.36/api',
    baseURL: "http://localhost:8000/api",
    // baseURL: process.env.API_ENDPOINT,
    timeout: 100000,
    headers: {

    },
});
