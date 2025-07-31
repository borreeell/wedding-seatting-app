<template>
  <div class="layout-container">
    <h1 class="title">Layout {{ layoutNum }}</h1>

    <div class="carousel-container">
      <button @click.stop="prevLayout" class="nav-button" aria-label="Previous layout">
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
          :title="guestList[index]?.name || 'Unassigned'"
        >
          {{ index + 1 }}
        </div>
      </div>

      <button @click.stop="nextLayout" class="nav-button" aria-label="Next layout">
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
          :class="{ assigned: guestList[selectedTableIndex]?.chairs?.[idx] }"
          :style="{ top: chair.top + '%', left: chair.left + '%' }"
          @click="handleChairClick(idx)"
          :title="getChairTooltip(idx)"
        >
          {{ idx + 1 }}
        </button>

        <button class="close-btn" @click="closeZoom">Close</button>
      </div>

      <!-- Name input below image -->
      <div v-if="selectedChairIndex !== null" class="chair-name-input">
        <label for="chairName"><b>Guest for chair {{ selectedChairIndex + 1 }}:</b></label>
        <input
          id="chairName"
          type="text"
          v-model="chairNameInput"
          @keyup.enter="saveChairName"
          placeholder="Name"
        />
        <button @click="saveChairName">Save</button>
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
const selectedChairIndex = ref(null);
const showZoom = ref(false);
const chairNameInput = ref("");
const guestList = ref([]);

const currentLayout = computed(() => {
  return layouts.find(l => l.id === `layout${layoutNum.value}`) || { tables: [] };
});

watch(
  layoutNum,
  () => {
    const layout = layouts.find((l) => l.id === `layout${layoutNum.value}`);
    if (layout) {
      guestList.value = layout.tables.map(() => ({
        chairs: []
      }));
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
});

const selectSeat = (index) => {
  selectedSeat.value = index;
  selectedTableIndex.value = index;
  selectedChairIndex.value = null;
  showZoom.value = true;
};

const closeZoom = () => {
  showZoom.value = false;
  selectedTableIndex.value = null;
  selectedChairIndex.value = null;
  chairNameInput.value = "";
};

const handleChairClick = (chairIndex) => {
  selectedChairIndex.value = chairIndex;
  const chairName = guestList.value[selectedTableIndex.value]?.chairs?.[chairIndex] || "";
  chairNameInput.value = chairName;
};

const saveChairName = () => {
  if (
    selectedTableIndex.value === null ||
    selectedChairIndex.value === null
  )
    return;

  const table = guestList.value[selectedTableIndex.value];
  if (!table.chairs) table.chairs = [];

  table.chairs[selectedChairIndex.value] = chairNameInput.value;
  chairNameInput.value = "";
  selectedChairIndex.value = null;
};

const getChairTooltip = (chairIndex) => {
  const table = guestList.value[selectedTableIndex.value];
  const name = table?.chairs?.[chairIndex] || "";
  return name ? `Chair ${chairIndex + 1}: ${name}` : `Chair ${chairIndex + 1}: Unassigned`;
};

const nextLayout = () => {
  layoutNum.value = layoutNum.value < layouts.length ? layoutNum.value + 1 : 1;
};

const prevLayout = () => {
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
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.zoom-content {
  position: relative;
  width: 500px;
  max-width: 95vw;
  max-height: 80vh;
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
  background-color: #4ab6f5;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  font-size: 0.75rem;
  font-weight: bold;
  transform: translate(-50%, -50%);
  cursor: pointer;
  border: 2px solid white;
  transition: background-color 0.2s ease, transform 0.1s ease;
}

.chair-button:hover {
  background-color: #007ac1;
  transform: translate(-50%, -50%) scale(1.1);
}

/* New style for assigned chairs */
.chair-button.assigned {
  background-color: #e63946; /* bright red */
}

.chair-button.assigned:hover {
  background-color: #b22222; /* darker red on hover */
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

.chair-name-input {
  position: absolute;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #be9772;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 1010;
}

.chair-name-input label {
  font-weight: 600;
  font-size: 0.95rem;
}

.chair-name-input input {
  padding: 6px 8px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
  min-width: 150px;
  text-align: center;  
}

.chair-name-input button {
  padding: 6px 10px;
  background-color: #007ac1;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s ease;
}

.chair-name-input button:hover {
  background-color: #005f99;
}
</style>
