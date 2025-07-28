<template>
  <div class="layout-container">
    <!-- Columna esquerra: Guest list -->
    <div class="guest-list">
      <h3>Guest List</h3>
      <!-- Aquí pots afegir els convidats -->
    </div>

    <!-- Imatge de fons + botons -->
    <div class="layout-content">
      <img src="@/assets/layout1.png" class="background-image" />

      <button
        v-for="(seat, index) in seats"
        :key="index"
        class="seat-button"
        :style="{ top: seat.top + 'px', left: seat.left + 'px' }"
      >
        {{ index + 1 }}
      </button>

      <!-- Botó per anar a Layout 2 -->
      <router-link to="/layout2" class="next-button">
        ➜
      </router-link>
    </div>
  </div>
</template>

<script setup>
const seats = [
  { top: 197, left: 655 }, { top: 370, left: 655 },
  { top: 540, left: 655 }, { top: 715, left: 655 },
  { top: 540, left: 820 }, { top: 715, left: 820 },
  { top: 197, left: 985 }, { top: 370, left: 985 },
  { top: 540, left: 985 }, { top: 715, left: 985 },
  { top: 300, left: 835 }
]
</script>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.guest-list {
  width: 250px;
  background-color: #f7f7f7;
  padding: 1rem;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

.layout-content {
  position: relative;
  flex-grow: 1;
  background-color: #000;
}

.background-image {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.seat-button {
  position: absolute;
  width: 30px;
  height: 30px;
  background-color: #c48b3b;
  color: white;
  font-weight: bold;
  border-radius: 50%;
  border: 2px solid white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
}

.next-button {
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: #2d89ef;
  color: white;
  padding: 12px 18px;
  font-size: 18px;
  border-radius: 10px;
  text-decoration: none;
  z-index: 3;
}
</style>
