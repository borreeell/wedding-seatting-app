<template>
    <div class="seat-layout">
        <button @click="console.log(hola)" class="seat" v-for="(seat, index) in seats" v-bind:key="index">{{seat}}</button>
    </div>
</template>

<style scoped>
.seat-layout {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    margin: auto;

    width: 75%;
    height: 100%;

    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    z-index: 99;

    border: 1px solid red;
}
</style>

<script setup>
let seats = 8
</script>