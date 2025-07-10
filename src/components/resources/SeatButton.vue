<template>
  <div class="seat-layout" :class="{ zoom: zoomMode }">
    <!-- Llista de convidats -->
    <div v-if="!zoomMode" class="guest-list">
      <h3>Guest List:</h3>
      <ul>
        <li
          v-for="(guest, index) in guestList"
          :key="index"
        >
          Table {{ guest.table }}, Sit {{ guest.chair }}: {{ guest.name }}
        </li>
      </ul>
    </div>

    <!-- PLÀNOL GENERAL -->
    <div v-if="!zoomMode">
      <button
        v-for="(seat, index) in seats"
        :key="index"
        class="seat"
        :style="{ top: seat.top + 'px', left: seat.left + 'px' }"
        @click="selectSeat(index)"
      >
        {{ index + 1 }}
      </button>
    </div>

    <!-- ZOOM EN UNA TAULA -->
    <div v-else class="zoom-container">
      <button class="back-button" @click="exitZoom">← Exit</button>
      <img :src="tableZoomImage" class="zoomed-table" />
      
      <!-- Botons cadira -->
      <button
        v-for="(chair, i) in chairs"
        :key="i"
        class="chair-button"
        :style="{ top: chair.top + 'px', left: chair.left + 'px' }"
        @click="startAddGuest(i + 1)"
      >
        {{ i + 1 }}
      </button>

      <!-- Formulari per afegir convidat -->
      <div v-if="addingGuest" class="add-guest-form">
        <p>Add a guest to Table {{ selectedTable }}, Sit {{ chairToAdd }}:</p>
        <input v-model="newGuestName" placeholder="Name " />
        <button @click="confirmAddGuest">Save</button>
        <button @click="cancelAddGuest">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const zoomMode = ref(false)
const selectedTable = ref(null)
const tableZoomImage = 'src/assets/zoom1.png'

const guestList = ref([])

const seats = [
  { top: 197, left: 655 }, { top: 370, left: 655 },
  { top: 540, left: 655 }, { top: 715, left: 655 },
  { top: 540, left: 820 }, { top: 715, left: 820 },
  { top: 197, left: 985 }, { top: 370, left: 985 },
  { top: 540, left: 985 }, { top: 715, left: 985 }
]

const chairs = [
  { top: 130, left: 245 }, { top: 130, left: 323 },
  { top: 225, left: 418 }, { top: 300, left: 418 },
  { top: 400, left: 329 }, { top: 400, left: 251 },
  { top: 300, left: 161 }, { top: 225, left: 161 }
]

// Quan cliquem una taula al plànol general
function selectSeat(index) {
  selectedTable.value = index + 1
  zoomMode.value = true
  // Reset de qualsevol estat d'afegir convidat
  cancelAddGuest()
  console.log(`table selected ${selectedTable.value}`)
}

// Estat per gestionar el formulari d'afegir convidat
const addingGuest = ref(false)
const chairToAdd = ref(null)
const newGuestName = ref('')

// Quan cliquem una cadira al zoom, mostrem el formulari
function startAddGuest(chairNumber) {
  addingGuest.value = true
  chairToAdd.value = chairNumber
  newGuestName.value = ''
}

// Confirmar i afegir convidat
function confirmAddGuest() {
  if (!newGuestName.value.trim()) {
    alert('Name')
    return
  }
  guestList.value.push({
    table: selectedTable.value,
    chair: chairToAdd.value,
    name: newGuestName.value.trim()
  })
  addingGuest.value = false
  newGuestName.value = ''
  chairToAdd.value = null
}

// Cancel·lar afegir convidat
function cancelAddGuest() {
  addingGuest.value = false
  newGuestName.value = ''
  chairToAdd.value = null
}

// Sortir del zoom
function exitZoom() {
  zoomMode.value = false
  selectedTable.value = null
  cancelAddGuest()
}
</script>

<style scoped>
.seat-layout {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 99;
}

.seat-layout.zoom {
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.seat {
  position: absolute;
  width: 32px;
  height: 32px;
  background-color: rgba(200, 150, 100, 0.8);
  border-radius: 50%;
  border: 2px solid #fff;
  color: white;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}

.zoom-container {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 600px;
  max-height: 600px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}

.zoomed-table {
  width: 400px;
  display: block;
  position: relative;
  z-index: 1;
}

.chair-button {
  position: absolute;
  width: 24px;
  height: 24px;
  background-color: teal;
  border-radius: 50%;
  color: white;
  font-size: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2;
  cursor: pointer;
}

.back-button {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #ddd;
  padding: 6px 12px;
  border-radius: 6px;
  font-weight: bold;
  cursor: pointer;
  z-index: 3;
}

.guest-list {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  padding: 10px;
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.add-guest-form {
  margin-top: 1rem;
  background: #f0f0f0;
  padding: 1rem;
  border-radius: 8px;
  width: 90%;
  max-width: 350px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}

.add-guest-form input {
  width: 70%;
  padding: 6px;
  margin-right: 8px;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.add-guest-form button {
  padding: 6px 12px;
  font-weight: bold;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.add-guest-form button:first-of-type {
  background-color: #4caf50;
  color: white;
  margin-right: 8px;
}

.add-guest-form button:last-of-type {
  background-color: #f44336;
  color: white;
}
</style>
