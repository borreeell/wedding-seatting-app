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
          v-for="(table, index) in currentLayout?.tables"
          :key="index"
          class="seat-number"
          :style="{ top: table.y + '%', left: table.x + '%' }"
          @click.stop="selectSeat(index)"
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
          v-if="selectedTable && selectedTable.x !== undefined && selectedTable.y !== undefined"
          :key="idx"
          class="chair-button"
          :class="{ assigned: isChairAssigned(idx) }"
          :style="{ top: chair.top + '%', left: chair.left + '%' }"
          @click="handleChairClick(idx)"
          :title="getChairTooltip(idx)"
        >
          {{ idx + 1 }}
        </button>

        <div class="test">Chairs for selected table: {{ chairsForSelectedTable }}</div>
        <button class="close-btn" @click="closeZoom">Close</button>
      </div>

      <!-- Name input below image -->
      <div v-if="selectedChairIndex !== null" class="chair-name-input">
        <label for="chairName"><b>Guest for chair {{ selectedChairIndex + 1 }}:</b></label>
        <input
          id="chairName"
          type="text"
          v-model="chairNameInput"
          @keyup.enter="saveGuestName"
          placeholder="Name"
        />
        <button 
          @click="saveGuestName"
        >
          Save
        </button>
        <!--<button 
          @click="deleteGuest"
          :disabled="!chairNameInput.trim()"
        >
          Delete
        </button>-->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { tableButtons } from '@/data/tableButtons';
import { zoomChairs } from '@/data/zoomChairs';
import { zoomImageConfig } from '@/data/zoomImageConfig';
import api from '@/services/api';

const layouts = tableButtons;

const layoutNum = ref(1);
const selectedSeat = ref(null);
const selectedTableIndex = ref(null);
const selectedChairIndex = ref(null);
const showZoom = ref(false);
const chairNameInput = ref("");

const tablesData = ref([]);
const seatIdMap = ref({});
const emit = defineEmits(["guests"]);

onMounted(async () => {
  try {
    const response = await api.getTables();
    tablesData.value = response.data;

    // Build the map: layout -> layout -> table -> chair -> seat_id
    const tempMap = {};
    for (const seat of tablesData.value) {
      const layoutKey = `layout${seat.floor}`;
      const tableIndex = seat.table_number - 1;
      const chairIndex = seat.seat_number - 1;

      if (!tempMap[layoutKey]) tempMap[layoutKey] = {};
      if (!tempMap[layoutKey][tableIndex]) tempMap[layoutKey][tableIndex] = {};

      tempMap[layoutKey][tableIndex][chairIndex] = seat.seat_id;
    }
    seatIdMap.value = tempMap;
  } catch (err) {
    console.error("Error loading seat data:", err);
  }
});

const currentLayout = computed(() => {
  return tableButtons.find(l => l.id === `layout${layoutNum.value}`) || { tables: [] };
});

watch(
  layoutNum,
  (newVal) => {
    const layout = layouts.find((l) => l.id === newVal)
  }
)

const selectedTable = computed(() => {
  if (selectedTableIndex.value === null) return null;
  return currentLayout.value.tables?.[selectedTableIndex.value] || null;
});

const chairsForSelectedTable = computed(() => {
  const layoutKey = `layout${layoutNum.value}`;
  if (selectedTableIndex.value === null) return [];
  return zoomChairs[layoutKey]?.[selectedTableIndex.value] || [];
});

const zoomImageData = computed(() => {
  const layoutKey = `layout${layoutNum.value}`;
  const config = zoomImageConfig[layoutKey] || {};
  const index = selectedTableIndex.value;
  if (index === null) return { src: "", style: {} };
  return config[index] || config.default || { src: "", style: {} };
});

const selectSeat = (index) => {
  selectedSeat.value = index;
  selectedTableIndex.value = index;
  selectedChairIndex.value = null;
  showZoom.value = true;
};

const isChairAssigned = (chairIndex) => {
  const layoutKey = `layout${layoutNum.value}`;
  const tableIndex = selectedTableIndex.value;
  const seatId = seatIdMap.value?.[layoutKey]?.[tableIndex]?.[chairIndex];

  const seat = tablesData.value.find(s => s.seat_id === seatId);
  return !!seat?.guest_name;
};

const closeZoom = () => {
  showZoom.value = false;
  selectedTableIndex.value = null;
  selectedChairIndex.value = null;
};

const handleChairClick = (chairIndex) => {
  selectedChairIndex.value = chairIndex;

  const layoutKey = `layout${layoutNum.value}`;
  const seatId = seatIdMap.value?.[layoutKey]?.[selectedTableIndex.value]?.[chairIndex];
  const seat = tablesData.value.find(s => s.seat_id === seatId);

  chairNameInput.value = seat?.guest_name || "";
};

const saveGuestName = async () => {
  if (
    selectedTableIndex.value === null ||
    selectedChairIndex.value === null ||
    !chairNameInput.value
  ) return;

  const layoutKey = `layout${layoutNum.value}`;
  const seatId = seatIdMap.value?.[layoutKey]?.[selectedTableIndex.value]?.[selectedChairIndex.value];

  if (!seatId) {
    alert("Seat ID not found");
    return;
  }

  try {
    const response = await api.addGuest({
      name: chairNameInput.value,
      id_seat: seatId,
    });

    emit("guests")

    console.log("Guest saved", response.data);
    closeZoom();
  } catch (error) {
    console.error("Error saving guest:", error);
    alert("An error occurred while saving guest");
  }
};

/*const deleteGuest = async () => {
  const layoutKey = `layout${layoutNum.value}`;
  const seatId = seatIdMap.value?.[layoutKey]?.[selectedTableIndex.value]?.[selectedChairIndex.value];

  if (!seatId) {
    alert("Seat ID not found");
    return;
  }

  try {
    await api.deleteGuest(seatId);
    alert("Succesfully deleted guest");

    const seat = tablesData.value.find(s => s.seat_id === seatId);
    if (seat) seat.guest_name = null;
    tablesData.value = response.data;

    closeZoom();
    emit("guests")
  } catch (error) {
    console.error("Error deleting guest: ", error);
    alert("An error occurred while saving guest");
  }
} */

const getChairTooltip = (chairIndex) => {
  const layoutKey = `layout${layoutNum.value}`;
  const tableIndex = selectedTableIndex.value;
  const seatId = seatIdMap.value?.[layoutKey]?.[tableIndex]?.[chairIndex];

  const seat = tablesData.value.find(s => s.seat_id === seatId);
  return seat?.guest_name
    ? `Chair ${chairIndex + 1}: ${seat.guest_name}`
    : `Chair ${chairIndex + 1}: Unassigned`;
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
  background-color: #064163;
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

.chair-button.assigned {
  background-color: #e63946; 
}

.chair-button.assigned:hover {
  background-color: #b22222; 
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
  top: 50%;
  right: 150px;
  transform: translateY(-50%);
  background-color: #be9772;
  padding: 12px 16px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  display: flex;
  gap: 10px;
  align-items: center;
  z-index: 1010;
  font-style: bold ;
  font-family:'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
}

.chair-name-input label {
  font-weight: 600;
  font-size: 0.95rem;
  

}

.chair-name-inpuut::placeholder {
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
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

.test {
  background: green;
  display: none; /* Display ONLY if there are errors with chair buttons */
  font-size: large;
  color: #b22222;
}
</style>
