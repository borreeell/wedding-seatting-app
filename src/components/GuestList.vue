<template>
  <aside class="guestList">
    <h2>Guest List</h2>
    <hr style="margin: 12px 0;">
    <ul>
      <!-- Loop through guests and display their names and tables -->
      <li v-for="guest in guests" :key="guest.id">
        {{ guest.name }} - {{ guest.table }}
      </li>
    </ul>
  </aside>
</template>

<script>
import { ref, onMounted } from 'vue';

export default {
  name: 'GuestList',
  setup() {
    const guests = ref([]);

    onMounted(() => {
      // Simulate fetching guest data (replace this with an API call to fetch database in the future)
      guests.value = [
        { id: 1, name: 'Guest 1', table: 'Table 1' },
        { id: 2, name: 'Guest 2', table: 'Table 2' },
        { id: 3, name: 'Guest 3', table: 'Table 3' },
        { id: 4, name: 'Guest 4', table: 'Table 4' }
      ];
    });

    return {
      guests
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
</style>

