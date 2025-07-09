<template>
  <div class="carousel-container">
    <h2 class="title">Layout Carousel</h2>
    <Splide
      :options="{
        type: 'loop',
        perPage: 1,
        autoplay: true,
        pauseOnHover: true,
        arrows: true,
        pagination: true,
        gap: '1rem'
      }"
      class="carousel"
    >
      <SplideSlide v-for="(image, index) in images" :key="index">
        <div class="slide-content">
          <img :src="image.src" :alt="image.alt || 'Layout image'" />
          <p v-if="image.caption">{{ image.caption }}</p>
        </div>
      </SplideSlide>
    </Splide>
  </div>
</template>

<script setup>
import '@splidejs/splide/dist/css/splide.min.css';
import { Splide, SplideSlide } from '@splidejs/vue-splide';

defineProps({
  images: {
    type: Array,
    required: true,
    default: () => []
  }
});
</script>

<style scoped>
  .carousel-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
    text-align: center;
  }

  .title {
    font-size: 1.8rem;
    font-weight: bold;
    margin-bottom: 1.5rem;
  }

  .slide-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .slide-content img {
    max-width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .slide-content p {
    margin-top: 0.75rem;
    font-weight: 500;
  }
</style>
