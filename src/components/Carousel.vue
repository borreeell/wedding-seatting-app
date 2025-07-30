<template>
  <div class="layout-container">
    <h1 class="title">Layout {{ layoutNum }}</h1>

    <div class="carousel-container">
      <button @click.stop="restLayout" class="nav-button" aria-label="Previous layout">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24">
          <path d="M6.325 12.85q-.225-.15-.337-.375T5.874 12t.113-.475t.337-.375l8.15-5.175q.125-.075.263-.112T15 5.825q.4 0 .7.288t.3.712v10.35q0 .425-.3.713t-.7.287q-.125 0-.262-.038t-.263-.112z" />
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
          <path d="M8 17.175V6.825q0-.425.3-.713t.7-.287q.125 0 .263.037t.262.113l8.15 5.175q.225.15.338.375t.112.475t-.112.475t-.338.375l-8.15 5.175q-.125.075-.262.113T9 18.175q-.4 0-.7-.288t-.3-.712" />
        </svg>
      </button>
    </div>

    <!-- ZOOM MODAL -->
    <div v-if="showZoom" class="zoom-modal" @click.self="closeZoom">
      <div class="zoom-content">
        <img 
          :src="zoomImageData.src" 
          alt="Zoom" 
          class="zoom-img"
          :style="zoomImageData.style"
        />

        <button
          v-for="(chair, idx) in chairsForSelectedTable"
          :key="idx"
          class="chair-button"
          :style="{ top: chair.top + '%', left: chair.left + '%' }"
        >
          {{ idx + 1 }}
        </button>

        <button class="close-btn" @click="closeZoom">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { tableButtons } from "@/data/tableButtons";
import { zoomChairs } from "@/data/zoomChairs";
import { zoomImageConfig } from "@/data/zoomImageConfig";

const layouts = tableButtons;

const layoutNum = ref(1);
const selectedSeat = ref(null);
const selectedTableIndex = ref(null);
const showZoom = ref(false);

const guestList = ref([]);

const currentLayout = computed(() => {
  return tableButtons.find(l => l.id === `layout${layoutNum.value}`) || { tables: [] };
});

watch(
  layoutNum,
  (newVal) => {
    const layout = layouts.find((l) => l.id === newVal);
    if (layout) {
      guestList.value = layout.tables.map(() => ({ guestName: "" }));
      selectedSeat.value = null;
    }
  },
  { immediate: true }
);

const chairsForSelectedTable = computed(() => {
  const layoutKey = `layout${layoutNum.value}`;
  if (selectedTableIndex.value === null) return [];
  return zoomChairs[layoutKey]?.[selectedTableIndex.value] || [];
});

const zoomImageData = computed(() => {
  const layoutKey = `layout${layoutNum.value}`;
  const config = zoomImageConfig[layoutKey] || {};
  const index = selectedTableIndex.value;

  if (index === null) {
    return { src: "", style: {} };
  }

  return config[index] || config.default || { src: "", style: {} };
})

const selectSeat = (index) => {
  selectedSeat.value = index;
  selectedTableIndex.value = index;
  showZoom.value = true;
};

const closeZoom = () => {
  showZoom.value = false;
  selectedTableIndex.value = null;
};

const sumLayout = () => {
  layoutNum.value = layoutNum.value < layouts.length ? layoutNum.value + 1 : 1;
};

const restLayout = () => {
  layoutNum.value = layoutNum.value === 1 ? layouts.length : layoutNum.value - 1;
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
  /* He eliminat pointer-events: none perquè el clic funcioni */
}

.seat-number {
  position: absolute;
  background-color: #be9772;
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
  font-family: Arial, Helvetica, sans-serif;
}

.seat-number:hover {
  background-color: #0057b3;
}

.zoom-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.zoom-content {
  position: relative;
  width: 500px;
  max-width: 95vw;
  max-height: 95vh;
}

.zoom-img {
  width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
  object-fit: contain;
}

.chair-button {
  position: absolute;
  background-color: rgb(74, 182, 245);
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 0.8rem;
  font-weight: bold;
  transform: translate(-50%, -50%);
  cursor: pointer;
  border: 2px solid white;

}

.close-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: #333;
  color: white;
  border: none;
  padding: 6px 12px;
  cursor: pointer;
  border-radius: 4px;
}
</style>
