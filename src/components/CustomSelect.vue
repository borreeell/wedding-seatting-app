<template>
    <div class="custom-select-wrapper" @click.outside="closeOptions" ref="wrapper">
        <div
            class="custom-select"
            :tabindex="0"
            @click="toggleOptions"
            @keydown.enter.prevent="toggleOptions"
        >
            <span class="selected">{{ selectedLabel || placeholder }}</span>
            <div class="select-arrow"></div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';



const props = defineProps({
    options: {
        type: Array,
        required: true,
        default: () => [],
    },
    modelValue: [String, Number],
    placeholder: {
        type: String,
        default: 'Select a floor',
    },
});

const emit = defineEmits(['update:modelValue']);

const isOpen = ref(false);
const wrapper = ref(null);

const selectedLabel = computed(() => {
    const selected = props.options.find(o => o.value === props.modelValue);
    return selected ? selected.label : '';
});

function toggleOptions() {
    isOpen.value = !isOpen.valuel
}

function closeOptions() {
    isOpen.value = false;
}

function selectOptions(options) {
    emit('update:modelValue', option.value);
    isOpen.value = false;
}

onMounted()
</script>

<style scoped>
.custom-select-wrapper {
  position: relative;
  width: 100%;
}

.custom-select {
  background: #fdfcfb;
  border: 1px solid #b6a58d;
  border-radius: 8px;
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem; /* ~14px */
  color: #524939;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  min-height: 2.2rem;
}

.custom-select:focus {
  outline: none;
  border-color: #7a6850;
  box-shadow: 0 0 0 2px rgba(122, 104, 80, 0.2);
}

.select-arrow {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 5px solid #524939;
}

.select-options {
  position: absolute;
  top: calc(100% + 0.3rem);
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #b6a58d;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  max-height: 180px;
  overflow-y: auto;
  z-index: 99;
}

.select-options li {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background 0.2s ease;
}

.select-options li:hover {
  background: #f1ece7;
}

.select-options li.selected {
  background: #ede3d7;
  font-weight: 600;
}
</style>