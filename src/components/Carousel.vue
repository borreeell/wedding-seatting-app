<template>
  <div class="layout-container">
    <h1 class="title">Layout {{layoutNum}}</h1>

    <div class="carousel-container" >
      <button @click="restLayout">
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path  d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z"/></svg>
      </button>
      
      <img :src="`/layout${layoutNum}.jpg`" :alt="`Layout ${layoutNum}`">

      <SeatButton></SeatButton>

      <button @click="sumLayout">
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 24 24"><path d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SeatButton from './resources/SeatButton.vue'

let layoutNum = ref(1)

const sumLayout = () => {
  layoutNum.value = layoutNum.value < 4 ? layoutNum.value + 1 : 1
}

const restLayout = () => {
  layoutNum.value = layoutNum.value == 1 ? 4 : layoutNum.value - 1
}

const layouts = [
  { src: '/layout1.jpg', alt: 'Layout 1' },
  { src: '/layout2.jpg', alt: 'Layout 2' },
  { src: '/layout3.jpg', alt: 'Layout 3' },
  { src: '/layout4.jpg', alt: 'Layout 4' },
]
</script>


<style scoped>
.layout-container {
  height: 100dvh;
  width: 100%;

  padding: 2rem;
  text-align: center;

position: relative;
}

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 1.8rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

img {
  width: 75%;
}

svg {
  fill: var(--secondary);
}
</style>
