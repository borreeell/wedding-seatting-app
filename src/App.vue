<script setup>
import GuestList from './components/GuestList.vue';
import Carousel from './components/Carousel.vue';

import { ref } from 'vue';

const guestListRef = ref(null);

const refreshGuests = () => {
    guestListRef.value?.fetchGuests();
};
</script>

<template>
    <GuestList ref="guestListRef"/>
    <Carousel @guests="refreshGuests"/>
</template>