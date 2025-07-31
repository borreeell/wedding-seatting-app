import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export default {
    getAllGuests: () => api.get('/guests'),
    addGuest: (guest) => api.post('/guests', guest),
    deleteGuest: (id) => api.delete(`/guests/${id}`),
    getTables: () => api.get('/tables')
};