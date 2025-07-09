<script setup>
import GuestList from './components/GuestList.vue';
import Carousel from './components/Carousel.vue';

const layouts = [
    {
        src: '/layout1.jpg',
        alt: 'Layout 1',
    },
    {
        src: '/layout2.jpg',
        alt: 'Layout 2',
    },
    {
        src: '/layout3.jpg',
        alt: 'Layout 3',
    },
    {
        src: '/layout4.jpg',
        alt: 'Layout 4',
    },
]
</script>

<template>
    <GuestList />
    <Carousel :images="layouts" />
</template>