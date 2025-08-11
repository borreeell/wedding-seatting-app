<template>
  <div class="layout-container">
    <h1 class="title">{{ layoutTitle }}</h1>

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

        <button class="close-btn" @click="closeZoom"><i class="pi pi-times"></i></button>
      </div>

      <div v-if="selectedChairIndex !== null" class="enter-guest-modal">
        <div class="enter-guest-header">
          <h3>Enter guest for chair {{ selectedChairIndex + 1 }}</h3>
        </div>
        <input
          id="chairName"
          type="text"
          v-model="chairNameInput"
          @input="updateCache"
          @keyup.enter="saveGuestName"
          placeholder="Name"
        />

        <div class="button-row">
          <button 
            @click="saveGuestData"
            class="save-btn"
          >
            Save <i class="pi pi-save"></i>
          </button>
          <button 
            @click="deleteGuest"
            :disabled="!chairNameInput.trim()"
            class="delete-btn"
          >
            Delete <i class="pi pi-trash"></i>
          </button>
        </div>

        <div class="guest-options">
          <div class="checkbox-item">
            <label>Child</label>
            <input type="checkbox" v-model="isChild" @change="updateCache">
          </div>

          <p>Dietary preferences:</p>
          <div class="checkbox-grid">
            <div class="checkbox-item">
              <label>Vegetarian</label>
              <input type="checkbox" v-model="isVegetarian" @change="updateCache"/>
            </div>
            <div class="checkbox-item">
              <label>Vegan</label>
              <input type="checkbox" v-model="isVegan" @change="updateCache"/>
            </div>
            <div class="checkbox-item">
              <label>Gluten Intolerant</label>
              <input type="checkbox" v-model="isGlutenIntolerant" @change="updateCache"/>
            </div>
            <div class="checkbox-item checkbox-full-width">
              <label>Other</label>
              <input type="checkbox" v-model="hasOtherDiet" @change="updateCache"/>
            </div>
          </div>
          
          <div v-if="hasOtherDiet" class="other-diet-input">
            <input type="text" v-model="otherDietText" placeholder="Please specify" @input="updateCache"/>
          </div>

          <p>Allergies:</p>
          <div class="checkbox-item single-checkbox">
            <label>Has allergies</label>
            <input type="checkbox" v-model="hasAllergies" @change="updateCache"/>
          </div>
          
          <div v-if="hasAllergies" class="allergy-input">
            <input type="text" v-model="allergyText" placeholder="Please specify allergies" @input="updateCache"/>
          </div>

          <p>Observations:</p>
          <textarea v-model="observations" placeholder="Additional notes..." rows="3" @input="updateCache"></textarea>
        </div>
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

// New reactive states for checkboxes and inputs
const isChild = ref(false);
const isVegetarian = ref(false);
const isVegan = ref(false);
const isGlutenIntolerant = ref(false);
const hasOtherDiet = ref(false);
const otherDietText = ref("");
const hasAllergies = ref(false);
const allergyText = ref("");
const observations = ref("");
const guestDataCache = ref({});

const tablesData = ref([]);
const seatIdMap = ref({});
const emit = defineEmits(["guests"]);

const layoutTitle = computed(() => {
  const layout = currentLayout.value;
  return layout ? `Layout ${layoutNum.value} - (${layout.chairCount} chairs)` : `Layout ${layoutNum.value}`;
})

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

  // Reset new fields when opening a new seat
  resetExtraFields();
};

const isChairAssigned = (chairIndex) => {
  const layoutKey = `layout${layoutNum.value}`;
  const tableIndex = selectedTableIndex.value;
  const seatId = seatIdMap.value?.[layoutKey]?.[tableIndex]?.[chairIndex];

  const seat = tablesData.value.find(s => s.seat_id === seatId);
  return !!seat?.guest_name;
};

const closeZoom = () => {
  updateCache();
  showZoom.value = false;
};

const handleChairClick = (chairIndex) => {
  selectedChairIndex.value = chairIndex;

  const layoutKey = `layout${layoutNum.value}`;
  const cacheKey = `${layoutKey}-${selectedTableIndex.value}-${chairIndex}`;

  if (guestDataCache.value[cacheKey]) {
    const cached = guestDataCache.value[cacheKey];
    chairNameInput.value = cached.name || "";
    isChild.value = cached.isChild || false;
    isVegetarian.value = cached.isVegetarian || false;
    isVegan.value = cached.isVegan || false;
    isGlutenIntolerant.value = cached.isGlutenIntolerant || false;
    hasOtherDiet.value = cached.hasOtherDiet || false;
    otherDietText.value = cached.otherDietText || "";
    hasAllergies.value = cached.hasAllergies || false;
    allergyText.value = cached.allergyText || "";
    observations.value = cached.observations || "";
  } else {
    const seatId = seatIdMap.value?.[layoutKey]?.[selectedTableIndex.value]?.[chairIndex];
    const seat = tablesData.value.find(s => s.seat_id === seatId) || {};

    chairNameInput.value = seat.guest_name || "";
    isChild.value = !!seat.is_child;
    isVegetarian.value = !!seat.is_vegetarian;
    isVegan.value = !!seat.is_vegan;
    isGlutenIntolerant.value = !!seat.is_gluten_intolerant;
    hasOtherDiet.value = !!seat.has_other_diet;
    otherDietText.value = seat.other_diet_text || "";
    hasAllergies.value = !!seat.has_allergies;
    allergyText.value = seat.allergy_text || "";
    observations.value = seat.observations || "";

    guestDataCache.value[cacheKey] = {
      name: chairNameInput.value,
      isChild: isChild.value,
      isVegetarian: isVegetarian.value,
      isVegan: isVegan.value,
      isGlutenIntolerant: isGlutenIntolerant.value,
      hasOtherDiet: hasOtherDiet.value,
      otherDietText: otherDietText.value,
      hasAllergies: hasAllergies.value,
      allergyText: allergyText.value,
      observations: observations.value,
    };
  }
};

const updateCache = () => {
  if (selectedChairIndex.value === null || selectedTableIndex.value === null) return;

  const layoutKey = `layout${layoutNum.value}`;
  const cacheKey = `${layoutKey}-${selectedTableIndex.value}-${selectedChairIndex.value}`;

  guestDataCache.value[cacheKey] = {
    name: chairNameInput.value,
    isChild: isChild.value,
    isVegetarian: isVegetarian.value,
    isVegan: isVegan.value,
    isGlutenIntolerant: isGlutenIntolerant.value,
    hasOtherDiet: hasOtherDiet.value,
    otherDietText: otherDietText.value,
    hasAllergies: hasAllergies.value,
    allergyText: allergyText.value,
    observations: observations.value,
  };
};

const resetExtraFields = () => {
  isChild.value = false;
  isVegetarian.value = false;
  isVegan.value = false;
  isGlutenIntolerant.value = false;
  hasOtherDiet.value = false;
  otherDietText.value = "";
  hasAllergies.value = false;
  allergyText.value = "";
  observations.value = "";
};

const saveGuestData = async () => {
  if (
    selectedTableIndex.value === null ||
    selectedChairIndex.value === null ||
    !chairNameInput.value.trim()
  ) return;

  const layoutKey = `layout${layoutNum.value}`;
  const seatId = seatIdMap.value?.[layoutKey]?.[selectedTableIndex.value]?.[selectedChairIndex.value];
  if (!seatId) {
    alert("Seat ID not found");
    return;
  }

  const guestData = {
    name: chairNameInput.value.trim(),
    id_seat: seatId,
    is_child: isChild.value,
    is_vegetarian: isVegetarian.value,
    is_vegan: isVegan.value,
    is_gluten_intolerant: isGlutenIntolerant.value,
    has_other_diet: hasOtherDiet.value,
    other_diet_text: hasOtherDiet.value ? otherDietText.value.trim() : null,
    has_allergies: hasAllergies.value,
    allergy_text: hasAllergies.value ? allergyText.value.trim() : null,
    observations: observations.value.trim(),
  };

  console.log("isChild.value antes de enviar:", isChild.value);

  try {
    const response = await api.addGuest(guestData);

    emit("guests");

    const seat = tablesData.value.find(s => s.seat_id === seatId);
    if (seat) {
      seat.guest_name = chairNameInput.value.trim();
    }

    closeZoom();
  } catch (error) {
    console.error("Error saving guest:", error);
    alert("An error occurred while saving guest");
  }
};


const deleteGuest = async () => {
  const layoutKey = `layout${layoutNum.value}`;
  const cacheKey = `${layoutKey}-${selectedTableIndex.value}-${selectedChairIndex.value}`;
  const seatId = seatIdMap.value?.[layoutKey]?.[selectedTableIndex.value]?.[selectedChairIndex.value];

  if (!seatId) {
    alert("Seat ID not found");
    return;
  }

  try {
    await api.deleteGuest(seatId);

    delete guestDataCache.value[cacheKey];

    const seat = tablesData.value.find(s => s.seat_id === seatId);
    if (seat) {
      seat.guest_name = null;
      seat.is_child = false;
      seat.is_vegetarian = false;
      seat.is_vegan = false;
      seat.is_gluten_intolerant = false;
      seat.has_other_diet = false;
      seat.other_diet_text = "";
      seat.has_allergies = false;
      seat.allergy_text = "";
      seat.observations = "";
    }

    chairNameInput.value = "";
    isChild.value = false;
    isVegetarian.value = false;
    isVegan.value = false;
    isGlutenIntolerant.value = false;
    hasOtherDiet.value = false;
    otherDietText.value = "";
    hasAllergies.value = false;
    allergyText.value = "";
    observations.value = "";

    alert("Successfully deleted guest");

    emit("guests");
    resetExtraFields();
    closeZoom(); // Cierra el modal
  } catch (error) {
    console.error("Error deleting guest: ", error);
    alert("An error occurred while deleting guest");
  }
};

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
@import 'primeicons/primeicons.css';

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

.enter-guest-modal {
  position: absolute;
  top: 50%;
  right: 250px;
  transform: translateY(-50%);
  background-color: #fff;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  z-index: 1010;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  max-height: 80vh;
  overflow-y: auto;
  width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.enter-guest-modal > input[type="text"] {
  padding: 8px 12px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.button-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin: 8px 0;
}

.button-row button {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  color: white;
  min-height: 36px;
}

.save-btn {
  background-color: #007ac1;
}

.save-btn:hover {
  background-color: #005f99;
  transform: translateY(-1px);
}

.delete-btn {
  background-color: #e63946;
}

.delete-btn:hover:not(:disabled) {
  background-color: #b22222;
  transform: translateY(-1px);
}

.delete-btn:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}


.guest-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guest-options p {
  margin: 0;
  text-align: left;
  font-weight: bold;
  font-size: 0.95rem;
  color: #2c3e50;
}

.checkbox-grid {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-top: 0.8rem;
}

.checkbox-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9em;
  min-height: 26px;
  padding: 0.3rem 0.5rem;
  border-radius: 6px;
  background-color: #f4f1e9;
}

.checkbox-item:hover {
  background-color: #e9e5d3;
}

.checkbox-item label {
  text-align: left;
  cursor: default;
  color: #4a3f2a;
  font-weight: 600;
  flex: 1;
  margin-right: 0.5rem;
}

.checkbox-item input[type="checkbox"] {
  margin: 0;
  transform: scale(1.2);
  cursor: pointer;
  accent-color: #80693e;
  flex-shrink: 0;
  transition: accent-color 0.3s ease;
}

.single-checkbox {
  background-color: #f4f1e9;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 6px;
}

.other-diet-input, .allergy-input {
  margin-top: 4px;
}

.other-diet-input input, .allergy-input input {
  width: 100%;
  padding: 6px 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 0.85rem;
  box-sizing: border-box;
}

.guest-options textarea {
  width: 100%;
  padding: 8px 10px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 0.85rem;
  font-family: inherit;
  resize: vertical;
  min-height: 60px;
  box-sizing: border-box;
}

.guest-options textarea:focus,
.other-diet-input input:focus,
.allergy-input input:focus,
.enter-guest-modal > input[type="text"]:focus {
  outline: none;
  border-color: #007ac1;
  box-shadow: 0 0 0 2px rgba(0, 122, 193, 0.2);
}
</style>