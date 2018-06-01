import axios from 'axios'


const IS_PROUDCTION: boolean = false; 

export default axios.create({
    baseURL: IS_PROUDCTION ? "http://35.185.199.36/api" : "http://127.0.0.1:8000/api",
    // baseURL: "http://169.233.195.236:8000/api",
    timeout: 100000,
    headers: {

    },
});
