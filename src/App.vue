<script setup>
import Carousel from './components/carousel/Carousel.vue';

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
    <Carousel :images="layouts" />
</template>