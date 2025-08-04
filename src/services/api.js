import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api',
});

export default {
    getAllGuests: () => api.get('/guests'),
    addGuest: (guest) => api.post('/guests', guest),
    deleteGuest: (idSeat) => api.delete(`/guests/${idSeat}`),
    getTables: () => api.get('/tables')
};