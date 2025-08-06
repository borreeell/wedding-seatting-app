<template>
  <button class="list close-btn" v-if="open" @click="toggleOpen(false)">
    <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 24 24">
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
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24">
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
      <option v-for="floor in sortedFloors" :key="floor" :value="floor">Floor {{ floor }}</option>
    </select>

    <h3 class="guest-counter">Total guests added: {{ totalGuests }}</h3>

    <p v-if="guests.length === 0">No guests found</p>

    <div v-for="(guests, floor) in filteredGuestsByFloor" :key="floor">
      <h3>Floor {{ floor }}:</h3>
      <ul>
        <li v-for="guest in guests" :key="guest.id">
          {{ guest.name }} - Table {{ guest.table }}, Chair {{ guest.chair }}
        </li>
      </ul>
    </div>

    <button class="export-btn" @click="openExportModal">Export Guest List as PDF</button>

    <!-- Modal per dades de la boda -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeExportModal">
      <div class="modal-content">
        <h3>Enter Wedding Details</h3>
        <form @submit.prevent="generatePDF" novalidate>
          <label for="weddingName">Name of the Bride/Groom</label>
          <input
            type="text"
            id="weddingName"
            v-model="weddingName"
            required
            :class="{ invalid: showErrors && !weddingName.trim() }"
          />

          <label for="weddingDate">Date of the Event</label>
          <input
            type="date"
            id="weddingDate"
            v-model="weddingDate"
            required
            :class="{ invalid: showErrors && !weddingDate }"
          />

          <label for="contactPhone">Contact Phone</label>
          <input
            type="tel"
            id="contactPhone"
            v-model="contactPhone"
            required
            :class="{ invalid: showErrors && !contactPhone.trim() }"
          />

          <div class="modal-buttons">
            <button type="button" @click="closeExportModal">Cancel</button>
            <button type="submit" :disabled="!formIsValid">Export PDF</button>
          </div>
        </form>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import jsPDF from "jspdf";
import api from "@/services/api";

const open = ref(false);
const guests = ref([]);
const selectedFloor = ref("all");

const weddingName = ref("");
const weddingDate = ref("");
const contactPhone = ref("");
const showModal = ref(false);
const showErrors = ref(false);

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
        // Afegir les dades dietètiques (assumint que l'API les retorna)
        dietary: row.dietary || {}, // objecte amb les preferències dietètiques
        allergies: row.allergies || null, // text amb al·lèrgies
        observations: row.observations || null // observacions adicionals
      }));

    guests.value = parsed;

    const savedOpen = localStorage.getItem("guestListOpen");
    if (savedOpen) open.value = savedOpen === "true";

    const savedFloor = localStorage.getItem("selectedFloor");
    if (savedFloor) selectedFloor.value = savedFloor;
  } catch (err) {
    console.error("Error fetching guests:", err);
  }
};

onMounted(fetchGuests);

watch(selectedFloor, (val) => {
  localStorage.setItem("selectedFloor", val);
});

const sortedFloors = computed(() => {
  const floors = [...new Set(guests.value.map((g) => g.floor))];
  return floors.sort((a, b) => a - b);
});

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
});

const totalGuests = computed(() => {
  if (selectedFloor.value === "all") {
    return guests.value.length;
  }
  return guests.value.filter(g => g.floor === Number(selectedFloor.value)).length;
});

// Funció auxiliar per crear el text de les preferències dietètiques
const getDietaryInfo = (guest) => {
  const dietary = guest.dietary || {};
  const allergies = guest.allergies;
  const observations = guest.observations;
  
  const dietaryItems = [];
  
  // Checkbox items
  if (dietary.child) dietaryItems.push("Child");
  if (dietary.vegetarian) dietaryItems.push("Vegetarian");
  if (dietary.vegan) dietaryItems.push("Vegan");  
  if (dietary.glutenIntolerant) dietaryItems.push("Gluten Free");
  if (dietary.otherDiet) dietaryItems.push(`Other: ${dietary.otherDiet}`);
  
  // Al·lèrgies
  if (allergies) dietaryItems.push(`Allergies: ${allergies}`);
  
  // Observacions
  if (observations) dietaryItems.push(`Notes: ${observations}`);
  
  return dietaryItems.length > 0 ? dietaryItems.join(", ") : "";
};

const openExportModal = () => {
  showErrors.value = false;
  weddingName.value = "";
  weddingDate.value = "";
  contactPhone.value = "";
  showModal.value = true;
};

// Tancar modal exportació
const closeExportModal = () => {
  showModal.value = false;
  showErrors.value = false;
};

// Validació formulari
const formIsValid = computed(() => {
  return (
    weddingName.value.trim().length > 0 &&
    weddingDate.value &&
    contactPhone.value.trim().length > 0
  );
});

// Generar PDF
const generatePDF = () => {
  showErrors.value = true;
  if (!formIsValid.value) return;

  const doc = new jsPDF();
  let y = 20;

  // Format data dd/mm/aa
  const dateObj = new Date(weddingDate.value);
  const formatDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(
    dateObj.getMonth() + 1
  ).padStart(2, "0")}/${String(dateObj.getFullYear()).slice(-2)}`;

  // Títol principal centrat i negreta
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text("Wedding Guest List", doc.internal.pageSize.getWidth() / 2, y, {
    align: "center",
  });
  y += 15;

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  const labelX = 10;
  const valueX = 60;

  // Info boda
  doc.text("Name:", labelX, y);
  doc.setFont("helvetica", "normal");
  doc.text(weddingName.value, valueX, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Date:", labelX, y);
  doc.setFont("helvetica", "normal");
  doc.text(formatDate, valueX, y);
  y += 8;

  doc.setFont("helvetica", "bold");
  doc.text("Contact Phone:", labelX, y);
  doc.setFont("helvetica", "normal");
  doc.text(contactPhone.value, valueX, y);
  y += 12;

  // Títol Guest List centrat i més gran
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Guest List", doc.internal.pageSize.getWidth() / 2, y, {
    align: "center",
  });
  y += 15;

  const totalGuestsInPDF = Object.values(filteredGuestsByFloor.value).reduce(
    (acc, guestsArr) => acc + guestsArr.length,
    0
  );
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total guests: ${totalGuestsInPDF}`, doc.internal.pageSize.getWidth() / 2, y, {
    align: "center",
  });
  y += 15;

  // Capçaleres de la taula (ajustar posicions per fer espai per la info dietètica)
  const guestNameX = 15;
  const guestTableX = 80;
  const guestChairX = 110;
  const guestDietaryX = 140; // Nova columna per info dietètica

  for (const layout of Object.keys(filteredGuestsByFloor.value).sort()) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Layout ${layout}:`, labelX, y);
    y += 10;

    // Capçalera de la taula de convidats (ampliada)
    doc.setFontSize(10); // Font més petita per que hi càpiga tot
    doc.setFont("helvetica", "bold");
    doc.text("Guest Name", guestNameX, y);
    doc.text("Table", guestTableX, y);
    doc.text("Chair", guestChairX, y);
    doc.text("Dietary Info", guestDietaryX, y);
    y += 6;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y); // línia sota capçalera
    y += 6;

    doc.setFont("helvetica", "normal");

    filteredGuestsByFloor.value[layout].forEach((guest) => {
      const dietaryInfo = getDietaryInfo(guest);
      
      // Nom del convidat
      doc.text(guest.name, guestNameX, y);
      
      // Taula i cadira
      doc.text(String(guest.table), guestTableX, y);
      doc.text(String(guest.chair), guestChairX, y);
      
      // Info dietètica (si n'hi ha)
      if (dietaryInfo) {
        doc.setFontSize(8); // Font encara més petita per la info dietètica
        
        // Si el text és molt llarg, parteix-lo en línies
        const maxWidth = 60; // Amplada màxima en unitats PDF
        const lines = doc.splitTextToSize(dietaryInfo, maxWidth);
        
        lines.forEach((line, index) => {
          doc.text(line, guestDietaryX, y + (index * 3));
        });
        
        doc.setFontSize(10); // Tornar a la mida normal
        
        // Ajustar y basant-se en quantes línies s'han afegit
        y += Math.max(7, lines.length * 3);
      } else {
        y += 7;
      }

      // Control de pàgina
      if (y > 260) { // Reduïr el límit per deixar més espai
        doc.addPage();
        y = 20;
      }
    });
    y += 10;
  }

  doc.save(`guestList - ${weddingName.value}.pdf`);
  closeExportModal();
};

defineExpose({ fetchGuests })
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
  border-radius: 6px;
  border: 1px solid #ccc;
  outline-color: #c0a16b;
  background-color: #d6cdbd;
  color: #524939;
  margin-bottom: 4px;
}

.guest-counter {
  font-weight: bold;
  color: var(--primary);
  margin-top: 0px;
}

.export-btn {
  margin-top: 2rem;
  padding: 0.7rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  background-color: #80693e;
  border: none;
  border-radius: 8px;
  color: white;
  transition: background-color 0.3s ease;
}

.export-btn:hover {
  background-color: #4f3e18;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 130;
}

.modal-content {
  background-color: #fff;
  padding: 2rem;
  border-radius: 10px;
  width: 320px;
  max-width: 90vw;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.25);
}

.modal-content h3 {
  margin-bottom: 1rem;
  color: #524939;
  text-align: center;
}

.modal-content label {
  display: block;
  margin-top: 1rem;
  margin-bottom: 0.4rem;
  font-weight: 600;
  color: #4a3f2a;
}

.modal-content input {
  width: 100%;
  padding: 0.5rem 0.7rem;
  font-size: 1rem;
  border-radius: 6px;
  border: 1px solid #ccc;
  outline-color: #c0a16b;
  background-color: #f4f1e9;
  color: #524939;
}

.modal-content input.invalid {
  border-color: red;
}

.modal-buttons {
  margin-top: 1.8rem;
  display: flex;
  justify-content: space-between;
}

.modal-buttons button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  background-color: #80693e;
  color: white;
  transition: background-color 0.3s ease;
}

.modal-buttons button:hover {
  background-color: #4f3e18;
}

.modal-buttons button:disabled {
  background-color: #c2bca6;
  cursor: not-allowed;
}
</style>