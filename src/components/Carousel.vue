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
        <img :src="zoomImagePath" alt="Zoom" class="zoom-img" />

        <button
          v-for="(chair, idx) in zoomChairs[selectedTableIndex] || []"
          :key="idx"
          class="chair-button"
          :style="{ top: chair.top + '%', left: chair.left + '%' }"
          @click.stop="startEditingChair(selectedTableIndex, idx)"
        >
          <template v-if="isEditingChair(selectedTableIndex, idx)">
            <input
              class="chair-input"
              type="text"
              :value="getChairName(selectedTableIndex, idx)"
              @blur="(e) => saveChairName(e, selectedTableIndex, idx)"
              @keydown.enter.prevent="(e) => saveChairName(e, selectedTableIndex, idx)"
              autofocus
            />
          </template>
          <template v-else>
            <span v-if="getChairName(selectedTableIndex, idx)" style="font-weight: bold;">
              {{ getChairName(selectedTableIndex, idx) }}
            </span>
            <span v-else>
              {{ idx + 1 }}
            </span>
          </template>
        </button>

        <button class="close-btn" @click="closeZoom">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const layoutNum = ref(1);
const selectedSeat = ref(null);
const selectedTableIndex = ref(null);
const showZoom = ref(false);

const chairNames = ref({});
const editingChair = ref({ tableIndex: null, chairIndex: null });

const startEditingChair = (tableIndex, chairIndex) => {
  editingChair.value = { tableIndex, chairIndex };
};

const saveChairName = (event, tableIndex, chairIndex) => {
  const name = event.target.value.trim();
  if (!chairNames.value[tableIndex]) {
    chairNames.value[tableIndex] = {};
  }
  chairNames.value[tableIndex][chairIndex] = name;
  editingChair.value = { tableIndex: null, chairIndex: null };
};

const getChairName = (tableIndex, chairIndex) => {
  return chairNames.value[tableIndex]?.[chairIndex] || '';
};

const isEditingChair = (tableIndex, chairIndex) => {
  return (
    editingChair.value.tableIndex === tableIndex &&
    editingChair.value.chairIndex === chairIndex
  );
};

const layouts = [
  {
    id: 1,
    tables: [
      { x: 29.5, y: 14 },
      { x: 29.5, y: 36 },
      { x: 29.5, y: 58 },
      { x: 29.5, y: 80 },
      { x: 42, y: 29 },
      { x: 41.5, y: 58 },
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

const guestList = ref([]);
const currentLayout = computed(() => layouts.find((l) => l.id === layoutNum.value));

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

const zoomChairs = {
  0: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 


  ],
  1: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],
  2: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],

  3: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],

  4: [
      { top: 5, left: 20 }, { top: 5, left: 30 },
      { top: 5, left: 40 }, { top: 5, left: 57},
      { top: 5, left: 67 }, { top: 5, left: 77 },

      { top: 23, left: 13 }, { top: 30, left: 13 },
      { top: 37, left: 13 }, { top: 48, left: 13 },
      { top: 62, left: 13 }, { top: 73, left: 13 },
      { top: 80, left: 13 }, { top: 87, left: 13 },

      { top: 23, left: 36 }, { top: 30, left: 36 },
      { top: 37, left: 36 }, { top: 48, left: 36 },
      { top: 55, left: 36 }, { top: 62, left: 36 }, 
      { top: 73, left: 36 }, { top: 80, left: 36 }, 
      { top: 87, left: 36 },

      { top: 23, left: 62 },  { top: 30, left: 62 },
      { top: 37, left: 62 },  { top: 48, left: 62 },
      { top: 55, left: 62 },  { top: 62, left: 62 },
      { top: 73, left: 62 },  { top: 80, left: 62 },
      { top: 87, left: 62 },

      { top: 23, left: 84 },  { top: 30, left: 84 },
      { top: 37, left: 84 },  { top: 48, left: 84 },
      { top: 55, left: 84 },  { top: 62, left: 84 },
      { top: 73, left: 84 },  { top: 80, left: 84 },
      { top: 87, left: 84 },
      
  ],

   5: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],

  6: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],

    7: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],

    8: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ], 

  9: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],

    10: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],

    11: [
    { top: 11, left: 40 }, { top: 11, left: 60 },
    { top: 34, left: 80 }, { top: 55, left: 80 },
    { top: 80, left: 60 }, { top: 80, left: 40 }, 
    { top: 55, left: 19 }, { top: 33, left: 19 }, 
  ],
};

const zoomImagePath = computed(() => {
  if (selectedTableIndex.value === null) return "";
  if (selectedTableIndex.value === 4) {
    return new URL("/src/assets/zoom2.png", import.meta.url).href;
  } else {
    return new URL("/src/assets/zoom1.png", import.meta.url).href;
  }
});

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
  display: flex;
  align-items: center;
  justify-content: center;
}

.chair-input {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  font-size: 0.7rem;
  padding: 2px 4px;
  border-radius: 4px;
  border: 1px solid #ccc;
  font-weight: bold;
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
