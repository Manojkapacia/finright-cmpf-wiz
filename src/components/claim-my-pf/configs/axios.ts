import axios from 'axios';
import MESSAGES from '../../constant/message';

const instance = axios.create({
    baseURL: MESSAGES.api.baseUrl,
    timeout: 5 * 60 * 1000, // 5 minutes
    // timeout: 120000,
    headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization'
     },
})

export default instance;