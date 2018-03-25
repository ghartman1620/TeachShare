import axios from 'axios'

export default axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 100000,
    headers: {

    },
});
