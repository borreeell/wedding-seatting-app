<template>
  <div class="seat-layout" :class="{ zoom: zoomMode }">
    <!-- GENERAL MAP -->
    <div v-if="!zoomMode">
      <button
        v-for="(seat, index) in currentSeats"
        :key="index"
        class="seat"
        :style="{ top: seat.top + 'px', left: seat.left + 'px' }"
        @click="selectSeat(index)"
      >
        {{ index + 1 }}
      </button>
    </div>

    <!-- ZOOM INTO A TABLE -->
    <div 
      v-else 
      class="zoom-container"
      @click="logChairPosition"
    >
      <button class="back-button" @click="exitZoom">← Back</button>
      <img :src="tableZoomImage" class="zoomed-table" />
      
      <!-- Chair buttons -->
      <button
        v-for="(chair, i) in currentChairs"
        :key="i"
        class="chair-button"
        :style="{ top: chair.top + 'px', left: chair.left + 'px' }"
        @click.stop="startAddGuest(i + 1)"
      >
        {{ i + 1 }}
      </button>

      <!-- Add guest form -->
      <div v-if="addingGuest" class="add-guest-form">
        <p>Add guest to Table {{ selectedTable }}, Chair {{ chairToAdd }}:</p>
        <input v-model="newGuestName" placeholder="Guest name" />
        <button @click="confirmAddGuest">Save</button>
        <button @click="cancelAddGuest">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Layout control
  const currentLayout = ref(1)
const zoomMode = ref(false)
const selectedTable = ref(null)
const tableZoomImage = ref('src/assets/zoom1.png')

const guestList = ref([])

// TAULES per layout diferent
const seatsLayouts = {
  1: [
    { top: 197, left: 655 }, { top: 370, left: 655 },
    { top: 540, left: 655 }, { top: 715, left: 655 },
    { top: 540, left: 820 }, { top: 715, left: 820 },
    { top: 197, left: 985 }, { top: 370, left: 985 },
    { top: 540, left: 985 }, { top: 715, left: 985 },
    { top: 300, left: 835 }
  ],
  2: [
    { top: 100, left: 200 }, { top: 360, left: 620 },
    { top: 540, left: 620 }, { top: 720, left: 620 },
    { top: 540, left: 850 }, { top: 720, left: 850 },
    { top: 180, left: 1020 }, { top: 360, left: 1020 },
    { top: 540, left: 1020 }, { top: 720, left: 1020 },
    { top: 300, left: 830 }
  ],
  3: [
    { top: 150, left: 600 }, { top: 330, left: 600 },
    { top: 510, left: 600 }, { top: 690, left: 600 },
    { top: 510, left: 870 }, { top: 690, left: 870 },
    { top: 150, left: 1050 }, { top: 330, left: 1050 },
    { top: 510, left: 1050 }, { top: 690, left: 1050 },
    { top: 300, left: 825 }
  ],
  4: [
    { top: 210, left: 650 }, { top: 400, left: 650 },
    { top: 590, left: 650 }, { top: 780, left: 650 },
    { top: 590, left: 840 }, { top: 780, left: 840 },
    { top: 210, left: 1000 }, { top: 400, left: 1000 },
    { top: 590, left: 1000 }, { top: 780, left: 1000 },
    { top: 320, left: 830 }
  ]
}

const currentSeats = computed(() => seatsLayouts[currentLayout.value])

const chairsZoom1 = [
  { top: 130, left: 245 }, { top: 130, left: 323 },
  { top: 225, left: 418 }, { top: 300, left: 418 },
  { top: 400, left: 329 }, { top: 400, left: 251 },
  { top: 300, left: 161 }, { top: 225, left: 161 }
]

const chairsZoom2 = [
  { top: 128, left: 145 }, { top: 172, left: 145 },
  { top: 212, left: 145 }, { top: 276, left: 145 },
  { top: 360, left: 145 }, { top: 426, left: 145 },
  { top: 468, left: 145 }, { top: 508, left: 145 },
  { top: 128, left: 235 }, { top: 172, left: 235 },
  { top: 212, left: 235 }, { top: 276, left: 235 }, 
  { top: 318, left: 235 }, { top: 360, left: 235 }, 
  { top: 426, left: 235 }, { top: 468, left: 235 },
  { top: 508, left: 235 },
  { top: 128, left: 339 }, { top: 172, left: 339 },
  { top: 212, left: 339 }, { top: 276, left: 339 },
  { top: 318, left: 339 }, { top: 360, left: 339 },
  { top: 426, left: 339 }, { top: 468, left: 339 },
  { top: 508, left: 339 },
  { top: 128, left: 428 }, { top: 172, left: 428 },
  { top: 212, left: 428 }, { top: 276, left: 428 },
  { top: 318, left: 428 }, { top: 360, left: 428 },
  { top: 426, left: 428 }, { top: 468, left: 428 },
  { top: 508, left: 428 },
  { top: 15, left: 167 }, { top: 15, left: 208 },
  { top: 15, left: 249 }, { top: 15, left: 315 },
  { top: 15, left: 357 }, { top: 15, left: 399 }
]

const currentChairs = computed(() => {
  return selectedTable.value === 11 ? chairsZoom2 : chairsZoom1
})

// Form
const addingGuest = ref(false)
const chairToAdd = ref(null)
const newGuestName = ref('')

// Quan fas clic a una taula
function selectSeat(index) {
  selectedTable.value = index + 1
  zoomMode.value = true
  cancelAddGuest()

  if (index === 10) {
    tableZoomImage.value = 'src/assets/zoom2.png'
  } else {
    tableZoomImage.value = 'src/assets/zoom1.png'
  }

  console.log(`Selected table ${selectedTable.value}`)
}

function startAddGuest(chairNumber) {
  addingGuest.value = true
  chairToAdd.value = chairNumber
  newGuestName.value = ''
}

function confirmAddGuest() {
  if (!newGuestName.value.trim()) {
    alert('Please enter a name')
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

function cancelAddGuest() {
  addingGuest.value = false
  newGuestName.value = ''
  chairToAdd.value = null
}

function exitZoom() {
  zoomMode.value = false
  selectedTable.value = null
  cancelAddGuest()
}

function logChairPosition(event) {
  const container = event.currentTarget.getBoundingClientRect()
  const x = Math.round(event.clientX - container.left)
  const y = Math.round(event.clientY - container.top)
  console.log(`{ top: ${y}, left: ${x} },`)
}
console.log('Layout actual:', currentLayout.value)

</script>

<style scoped>
.seat-layout {
  position: absolute;
  top: 0;
  left: 0;
  width: 1350px;
  height: 1000px;
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
