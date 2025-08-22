<script setup>
import GuestList from './components/GuestList.vue';
import Carousel from './components/Carousel.vue';
import NotFound from './components/not-found.vue';

import { ref } from 'vue';

const guestListRef = ref(null);

const refreshGuests = () => {
    guestListRef.value?.fetchGuests();
};

const path = window.location.pathname;
const protectedPaths = ['/api'];
const showNotFound = protectedPaths.some(p => path.startsWith(p));
</script>

<template>
    <div>
        <template v-if="showNotFound">
            <NotFound />
        </template>
        <template v-else>
            <GuestList ref="guestListRef"/>
            <Carousel @guests="refreshGuests"/>   
        </template>
    </div>
</template>