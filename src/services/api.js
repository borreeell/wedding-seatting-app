import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export default {
    getAllGuests: () => api.get('/guests'),
    addGuest: () => api.post('/guests', guest),
    deleteGuest: () => api.delete(`/guests/${id}`),
    getTables: () => api.get('/tables')
};