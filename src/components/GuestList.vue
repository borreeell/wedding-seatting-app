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

    <div v-for="(guestsOnFloor, floor) in filteredGuestsByFloor" :key="floor">
      <h3>Floor {{ floor }}:</h3>
      <ul>
        <li 
          v-for="guest in guestsOnFloor" 
          :key="guest.id"
          @click="fetchGuestDetails(guest.id_seat)"
          class="guest-item"
        >
          {{ guest.name }} - Table {{ guest.table }}, Chair {{ guest.chair }}
        </li>
      </ul>
    </div>

    <button class="export-btn" @click="openExportModal">Export Guest List as PDF</button>

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

    <div v-if="showGuestInfoModal" class="modal-overlay" @click.self="closeGuestInfoModal">
      <div class="chair-name-input">
        <h3>Guest {{ selectedGuest?.name }} info</h3>

        <table>
          <caption>Seating info</caption>
          <thead>
            <tr>
              <th>Floor</th>
              <th>Table</th>
              <th>Chair</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{{ selectedGuest?.floor }}</td>
              <td>{{ selectedGuest?.table }}</td>
              <td>{{ selectedGuest?.chair }}</td>
            </tr>
          </tbody>
        </table>

        <hr style="margin: 12px 0" />

        <div class="guest-options">
          <!-- Child -->
          <div class="checkbox-item">
            <label>Child</label>
            <input type="checkbox" :checked="selectedGuest?.isChild" disabled />
          </div>

          <!-- Dietary -->
          <p>Dietary preferences:</p>
          <div class="checkbox-grid">
            <div class="checkbox-item">
              <label>Vegetarian</label>
              <input type="checkbox" :checked="selectedGuest?.dietary?.vegetarian" disabled />
            </div>
            <div class="checkbox-item">
              <label>Vegan</label>
              <input type="checkbox" :checked="selectedGuest?.dietary?.vegan" disabled />
            </div>
            <div class="checkbox-item">
              <label>Gluten Intolerant</label>
              <input type="checkbox" :checked="selectedGuest?.dietary?.glutenIntolerant" disabled />
            </div>
            <div class="checkbox-item other-diet-input">
              <label>Other</label>
              <input type="text" :value="selectedGuest?.dietary?.other || ''" readonly />
            </div>
          </div>

          <!-- Allergies -->
          <p>Allergies:</p>
          <div class="single-checkbox">
            <label>
              <input type="checkbox" :checked="!!selectedGuest?.allergies" disabled />
              Has allergies
            </label>
            <div class="allergy-input">
              <input type="text" :value="selectedGuest?.allergies || ''" readonly />
            </div>
          </div>

          <!-- Observations -->
          <p>Observations:</p>
          <textarea readonly>{{ selectedGuest?.observations || '' }}</textarea>
        </div>

        <div class="button-row">
          <button class="save-btn" @click="closeGuestInfoModal">Close</button>
        </div>
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

const selectedGuest = ref(null);
const showGuestInfoModal = ref(false);

const openGuestInfoModal = (guest) => {
  selectedGuest.value = guest;
  showGuestInfoModal.value = true;
};

const closeGuestInfoModal = () => {
  selectedGuest.value = null;
  showGuestInfoModal.value = false;
};

const toggleOpen = (value) => {
  open.value = value;
  localStorage.setItem("guestListOpen", value.toString());
};

const fetchGuestDetails = (seatId) => {
  const guest = guests.value.find(g => g.id_seat === seatId);
  openGuestInfoModal(guest)
};

const fetchGuests = async () => {
  try {
    const { data } = await api.getTables();
    console.log(data);
    const parsed = data
      .filter((row) => row.guest_name)
      .map((row) => ({
        id: row.guest_id,
        id_seat: row.id_seat,
        name: row.guest_name,
        chair: row.seat_number,
        table: row.table_number,
        floor: row.floor,
        isChild: !!row.is_child,
        dietary: {
          vegetarian: !!row.is_vegetarian,
          vegan: !!row.is_vegan,
          glutenIntolerant: !!row.is_gluten_intolerant,
          other: row.has_other_diet ? row.other_diet_text : "",
        },
        allergies: row.has_allergies ? row.allergy_text : "",
        observations: row.observations || ""
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

const getDietaryInfo = (guest) => {
  const dietary = guest.dietary || {};
  const allergies = guest.allergies;
  const observations = guest.observations;

  const dietaryItems = [];

  if (guest.isChild) dietaryItems.push("Child");
  if (dietary.vegetarian) dietaryItems.push("Vegetarian");
  if (dietary.vegan) dietaryItems.push("Vegan");
  if (dietary.glutenIntolerant) dietaryItems.push("Gluten Free");
  if (dietary.other && dietary.other.trim().length > 0) dietaryItems.push(`Other: ${dietary.other}`);

  if (allergies && allergies.trim().length > 0) {
    dietaryItems.push(`Allergies: ${allergies}`);
  }

  if (observations && observations.trim().length > 0) {
    dietaryItems.push(`Notes: ${observations}`);
  }

  return dietaryItems.length > 0 ? dietaryItems.join(", ") : "";
};

const openExportModal = () => {
  showErrors.value = false;
  weddingName.value = "";
  weddingDate.value = "";
  contactPhone.value = "";
  showModal.value = true;
};

const closeExportModal = () => {
  showModal.value = false;
  showErrors.value = false;
};

const formIsValid = computed(() => {
  return (
    weddingName.value.trim().length > 0 &&
    weddingDate.value &&
    contactPhone.value.trim().length > 0
  );
});

const generatePDF = () => {
  showErrors.value = true;
  if (!formIsValid.value) return;

  const doc = new jsPDF();
  let y = 20;

  // Date format dd/mm/aa
  const dateObj = new Date(weddingDate.value);
  const formatDate = `${String(dateObj.getDate()).padStart(2, "0")}/${String(
    dateObj.getMonth() + 1
  ).padStart(2, "0")}/${String(dateObj.getFullYear()).slice(-2)}`;

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

  const col1Center = 42.5;
  const col2Center = 90;     
  const col3Center = 120;   
  const col4Center = 167.5; 

  for (const layout of Object.keys(filteredGuestsByFloor.value).sort()) {
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(`Layout ${layout}:`, labelX, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Guest Name", col1Center, y, { align: "center" });
    doc.text("Table", col2Center, y, { align: "center" });
    doc.text("Chair", col3Center, y, { align: "center" });
    doc.text("Dietary Info", col4Center, y, { align: "center" });
    y += 6;

    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(10, y, 200, y);
    
    doc.setLineWidth(0.3);
    doc.line(75, y - 6, 75, y); 
    doc.line(105, y - 6, 105, y); 
    doc.line(135, y - 6, 135, y);
    
    y += 6;

    doc.setFont("helvetica", "normal");

    filteredGuestsByFloor.value[layout].forEach((guest, index) => {
      const dietaryInfo = getDietaryInfo(guest);

      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(75, y - 3, 75, y + 10);
      doc.line(105, y - 3, 105, y + 10);
      doc.line(135, y - 3, 135, y + 10);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(guest.name, col1Center, y, { align: "center" });

      doc.text(String(guest.table), col2Center, y, { align: "center" });
      doc.text(String(guest.chair), col3Center, y, { align: "center" });

      if (dietaryInfo) {
        doc.setFontSize(8);

        const maxWidth = 60;
        const lines = doc.splitTextToSize(dietaryInfo, maxWidth);

        lines.forEach((line, lineIndex) => {
          doc.text(line, col4Center, y + (lineIndex * 3), { align: "center" });
        });

        doc.setFontSize(10);

        y += Math.max(7, lines.length * 3);
      } else {
        y += 7;
      }

      doc.setDrawColor(220, 220, 220);
      doc.setLineWidth(0.2);
      doc.line(10, y + 2, 200, y + 2);
      
      y += 12;

      if (y > 260) {
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

.guest-item {
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.guest-item:hover {
  text-decoration: underline;
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

.chair-name-input {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #be9772;
  padding: 16px;
  border-radius: 10px;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.3);
  z-index: 1010;
  font-family: 'Trebuchet MS', 'Lucida Sans Unicode', 'Lucida Grande', 'Lucida Sans', Arial, sans-serif;
  max-height: 80vh;
  overflow-y: auto;
  width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

table {
  border-collapse: collapse;
  border: 2px solid wheat;
  font-size: 1rem;
  letter-spacing: 1px;
}

caption {
  caption-side: top;
  padding: 10px;
  font-weight: 600;
}

th, td {
  border: 1px solid wheat;
  padding: 8px 10px;
}

.chair-name-input > input[type="text"] {
  padding: 8px 12px;
  border: 2px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.guest-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.guest-options p {
  margin: 0;
  font-weight: bold;
  font-size: 0.95rem;
  color: #2c3e50;
}

.checkbox-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.checkbox-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.88rem;
  min-height: 26px;
  padding: 2px 4px;
  border-radius: 4px;
  background-color: rgba(255, 255, 255, 0.1);
}

.checkbox-item label {
  text-align: left;
  cursor: default;
  color: #2c3e50;
  font-weight: 500;
  flex: 1;
  margin-right: 8px;
}

.checkbox-item input[type="checkbox"] {
  margin: 0;
  transform: scale(1.2);
  cursor: default;
  accent-color: #007ac1;
  flex-shrink: 0;
}

.single-checkbox {
  background-color: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 6px;
}

.other-diet-input input,
.allergy-input input {
  width: 100%;
  padding: 6px 10px;
  border: 2px solid #ccc;
  border-radius: 4px;
  font-size: 0.85rem;
  box-sizing: border-box;
  background-color: #f9f9f9;
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
  background-color: #f9f9f9;
}

.guest-options textarea:focus,
.other-diet-input input:focus,
.allergy-input input:focus,
.chair-name-input > input[type="text"]:focus {
  outline: none;
  border-color: #007ac1;
  box-shadow: 0 0 0 2px rgba(0, 122, 193, 0.2);
}
</style>