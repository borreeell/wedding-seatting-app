<template>
  <aside class="guestList">
    <h2>Guest List</h2>
    <hr style="margin: 12px 0;">
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

<script>
import { ref, onMounted, computed } from 'vue';

export default {
  name: 'GuestList',
  setup() {
    const guests = ref([]);

    onMounted(() => {
      guests.value = [
        { id: 1, name: 'Guest 1', chair: 2, table: 1, floor: 1 },
        { id: 2, name: 'Guest 2', chair: 3, table: 1, floor: 1 },
        { id: 3, name: 'Guest 3', chair: 1, table: 2, floor: 1 },
        { id: 4, name: 'Guest 4', chair: 4, table: 2, floor: 1 }
      ];
    });

    // Group guests by floor
    const guestsByFloor = computed(() => {
      const grouped = {};
      guests.value.forEach(guest => {
        if (!grouped[guest.floor]) grouped[guest.floor] = [];
        grouped[guest.floor].push(guest);
      });
      // Optionally sort guests by chair or table if needed
      Object.keys(grouped).forEach(floor => {
        grouped[floor].sort((a, b) => a.chair - b.chair);
      });
      return grouped;
    });

    return {
      guests,
      guestsByFloor
    };
  }
};
</script>

<style scoped>
    @import url('https://fonts.cdnfonts.com/css/cathiren');

    * {
      font-family: 'Cathiren', sans-serif;
    }
    
    .guestList {
      width: 300px;
      height: 100vh;
      background: #9f8f7b;
      padding: 2rem 1rem;
      box-shadow: 2px 0 8px rgba(0,0,0,0.04);
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

    .guestList ul{
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
</style>

