<template>
  <div class="layout-container">
    <h1 class="title">Layout {{ layoutNum }}</h1>

    <div class="carousel-container">
      <button @click.stop="restLayout" class="nav-button" aria-label="Previous layout">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
          <path
            d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z"
          />
        </svg>
      </button>

      <div class="image-wrapper" @click="handleClick">
        <img :src="`/layout${layoutNum}.jpg`" :alt="`Layout ${layoutNum}`" />

        <div
          v-for="(table, index) in currentLayout.tables"
          :key="index"
          class="seat-number"
          :style="{ top: table.y + '%', left: table.x + '%' }"
          @click.stop="selectSeat(index)"
          :title="guestList[index]?.name ? `${guestList[index].name} ${guestList[index].surname}` : 'Sin asignar'"
        >
          {{ index + 1 }}
        </div>
      </div>

      <button @click.stop="sumLayout" class="nav-button" aria-label="Next layout">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
          <path
            d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712"
          />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const layoutNum = ref(1);
const selectedSeat = ref(null);

const layouts = [
  {
    id: 1,
    tables: [
      { x: 29.5, y: 14 },
      { x: 29.5, y: 36 },
      { x: 29.5, y: 58 },
      { x: 29.5, y: 80 },
      { x: 42, y: 29 },
      { x: 41.5, y: 58},
      { x: 41.5, y: 80 },
      { x: 53, y: 14 },
      { x: 53, y: 36 },
      { x: 53, y: 58 },
      { x: 53, y: 80 },
    ],
  },
  {
    id: 2,
    tables: [
      { x: 27, y: 28 },
      { x: 27.6, y: 68 },
      { x: 33, y: 28 },
      { x: 33.6, y: 68 },
      { x: 43, y: 30 },
      { x: 40, y: 68 },
      { x: 53, y: 28 },
    ],
  },
  {
    id: 3,
    tables: [
      { x: 27.5, y: 28 },
      { x: 27.5, y: 68 },
      { x: 33.5, y: 28 },
      { x: 33.5, y: 68 },
      { x: 40, y: 28 },
      { x: 40, y: 68.3 },
      { x: 46, y: 28 },
      { x: 45.2, y: 63 },
      { x: 52, y: 28 },
      
    ],
  },
  {
    id: 4,
    tables: [
      { x: 27.5, y: 28 },
      { x: 27.5, y: 68 },
      { x: 33.5, y: 28 },
      { x: 33.5, y: 68 },
      { x: 40, y: 28 },
      { x: 40, y: 68 },
      { x: 46, y: 28 },
      { x: 46, y: 68 },
      { x: 52, y: 28 },
      { x: 52, y: 68 },
      { x: 58, y: 68 },
      { x: 64, y: 68 },
      { x: 70, y: 68 },
    ],
  },
];

const currentLayout = computed(() => layouts.find((l) => l.id === layoutNum.value));

const guestList = ref([]);

watch(
  layoutNum,
  (newVal) => {
    const layout = layouts.find((l) => l.id === newVal);
    if (layout) {
      guestList.value = layout.tables.map(() => ({ guestName: "" }));
      selectedSeat.value = null;
    }
  },
  { immediate: false }
);

const sumLayout = () => {
  layoutNum.value = layoutNum.value < layouts.length ? layoutNum.value + 1 : 1;
};

const restLayout = () => {
  layoutNum.value = layoutNum.value === 1 ? layouts.length : layoutNum.value - 1;
};

const selectSeat = (index) => {
  selectedSeat.value = index;
};

const handleClick = (event) => {
  const container = event.currentTarget;
  const rect = container.getBoundingClientRect();

  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  console.log(`x: ${x.toFixed(0)}px, y: ${y.toFixed(0)}px`);
};
</script>

<style scoped>
.layout-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  padding: 2rem;
  text-align: center;
  box-sizing: border-box;
}

.title {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
}

.carousel-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
}

.nav-button {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-wrapper {
  position: relative;
  width: 900px;
  max-width: 90vw;
}

.image-wrapper img {
  width: 100%;
  display: block;
  border-radius: 8px;
  user-select: none;
  pointer-events: none;
}

.seat-number {
  position: absolute;
  background-color: #007bffcc;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
  transform: translate(-50%, -50%);
  transition: background-color 0.2s ease;
  border: 2px solid white;
  box-shadow: 0 0 3px rgba(0, 0, 0, 0.4);
}

.seat-number:hover {
  background-color: #0056b3cc;
}

.guest-form {
  margin-top: 2rem;
}

.guest-form input {
  margin: 0.5rem 0;
  padding: 0.5rem;
  font-size: 1rem;
  width: 200px;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.guest-form button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.guest-list {
  margin-top: 2rem;
  text-align: center;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.guest-list ul {
  list-style: none;
  padding: 0;
}

.guest-list li {
  margin-bottom: 0.3rem;
}
</style>
