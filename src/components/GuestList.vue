<template>
  <button class="list close-btn" v-if="open" @click="open = false">
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
    <div v-for="(guests, floor) in guestsByFloor" :key="floor">
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
import { ref, onMounted, computed } from "vue";
import api from "@/services/api";

const open = ref(false);
const guests = ref([]);

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
  } catch (err) {
    console.log(`Error fetching guests: ${err}`);
  }
};

onMounted(fetchGuests);

const guestsByFloor = computed(() => {
  const grouped = {};
  guests.value.forEach((guest) => {
    if (!grouped[guest.floor]) grouped[guest.floor] = [];
    grouped[guest.floor].push(guest);
  });

  Object.keys(grouped).forEach((floor) => {
    grouped[floor].sort((a, b) => a.table - b.table || a.chair - b.chair);
  });

  return grouped;
});
</script>

<style scoped>
.guestList {
  z-index: 98;
  width: 300px;
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
</style>
