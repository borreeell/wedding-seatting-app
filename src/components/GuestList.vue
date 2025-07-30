<template>
  <button class="list close-btn" v-if="open" @click="toggleOpen(false)">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="50"
      height="50"
      viewBox="0 0 24 24"
    >
      <path
        fill="none"
        stroke="var(--secondary)"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M4 12h16M4 18h16M4 6h16"
      />
    </svg>
  </button>
  <aside class="guestList" v-else>
    <button class="list open-btn" @click="open = true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="40"
        height="40"
        viewBox="0 0 24 24"
      >
        <path
          fill="none"
          stroke="var(--primary)"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="m7 7l10 10M7 17L17 7"
        />
      </svg>
    </button>
    <h2>Guest List</h2>
    <hr style="margin: 12px 0" />

    <select id="floor-select" v-model="selectedFloor" class="floor-select">
      <option value="all">All floors</option>
      <option
        v-for="floor in sortedFloors"
        :key="floor"
        :value="floor"
      >
      Floor {{ floor }}
    </option>
    </select>
    <p v-if="guests.length === 0">No guests foud</p>

    <div v-for="(guests, floor) in filteredGuestsByFloor" :key="floor">
      <h3>Floor {{ floor }}:</h3>
      <ul>
        <li v-for="guest in guests" :key="guest.id">
          {{ guest.name }} - Chair {{ guest.chair }}, Table {{ guest.table }}
        </li>
      </ul>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import api from "@/services/api";

const open = ref(false);
const guests = ref([]);
const selectedFloor = ref("all");

const toggleOpen = (value) => {
  open.value = value;
  localStorage.setItem("guestListOpen", value.toString());
};

const fetchGuests = async () => {
  try {
    const { data } = await api.getTables();

    const parsed = data
      .filter((row) => row.guest_name) // Only seats with guests
      .map((row, index) => ({
        id: index + 1,
        name: row.guest_name,
        chair: row.seat_number,
        table: row.table_number,
        floor: row.floor,
      }));

    guests.value = parsed;

    const savedOpen = localStorage.getItem("guestListOpen");
    if (savedOpen) {
      open.value = savedOpen === "true";
    }

    const savedFloor = localStorage.getItem("selectedFloor");
    if (savedFloor) {
      selectedFloor.value = savedFloor;
    }
  } catch (err) {
    console.log(`Error fetching guests: ${err}`);
  }
};

onMounted(fetchGuests);

watch(selectedFloor, (val) => {
  localStorage.setItem("selectedFloor", val);
});

const sortedFloors = computed(() => {
  const floors = [...new Set(guests.value.map((g) => g.floor))];
  return floors.sort((a, b) => a - b);
})

const filteredGuestsByFloor = computed(() => {
  const filtered = selectedFloor.value === "all"
    ? guests.value
    : guests.value.filter((g) => g.floor === Number(selectedFloor.value));

  const grouped = {};
  filtered.forEach((guest) => {
    if (!grouped[guest.floor]) grouped[guest.floor] = [];
    grouped[guest.floor].push(guest);
  });

  Object.keys(grouped).forEach((floor) => {
    grouped[floor].sort((a, b) => a.table - b.table || a.chair - b.chair); 
  });

  return grouped;
})
</script>

<style scoped>
.guestList {
  z-index: 98;
  width: 350px;
  height: 100vh;
  background: #9f8f7b;
  padding: 2rem 1rem;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.04);
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.guestList::-webkit-scrollbar {
  display: none;
}

.guestList h2 {
  font-size: 1.5rem;
  color: #524939;
  margin-bottom: 1rem;
}

.guestList hr {
  border: none;
  border-top: 1px solid #ccc;
  margin: 1rem 0;
}

.guestList ul {
  list-style: none;
  padding: 0;
  margin-left: 12px;
  font-size: large;
}

.guestList h3 {
  font-size: 1.2rem;
  color: #524939;
  margin: 1rem 0 0.5rem 0;
}

.list {
  cursor: pointer;
  z-index: 120;
}

.close-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  background: none;
  border: none;
  padding: 0;
}

.open-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  background: none;
  border: none;
  padding: 0;
}

.floor-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  margin: 0.5rem 0 1.5rem 0;
  font-size: 1rem;
  background: #fdfcfb;
  border: 1px solid #ccc;
  border-radius: 8px;
  color: #524939;
  outline: none;
  appearance: none;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
}

.floor-select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(82, 73, 57, 0.2);
}
</style>
