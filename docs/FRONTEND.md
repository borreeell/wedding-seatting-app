# Frontend Architecture Documentation

## Overview

The Wedding Seating Application is built using Vue 3, leveraging its composition API and modern frontend development practices. This document provides a detailed overview of the frontend architecture, components, and data flow.

## Project Structure
Here are the main directories and files in the frontend project:
```
src/
├── components/         # Vue components
│   ├── Carousel.vue          # Layout selection carousel
│   ├── GuestList.vue         # Guest management interface
│   ├── not-found.vue         # 404 page component
├── data/                 # Configuration and static data
│   ├── tableButtons.js     # Table layout configurations
│   ├── zoomChairs.js       # Chair zoom settings
│   └── zoomImageConfig.js  # Image zoom configurations
├── services/       # Connection to backend services
│   └── api.js     
├── App.vue         # Root component
```

## Core Components

### App.vue
The root component that orchestrates the entire application. It:
- Manages the global application state
- Handles routing
- Provides the main layout structure

### Carousel.vue
The layout selection component that allows users to browse through different seating arrangements see table zoomed in detail and add guests to specific seats.

```
Key features:
- Interactive layout preview
- Interactive seat selection
- Modal view to add guests
```

### GuestList.vue
Manages the guest list and seating assignments:
- Real-time updates
- Search and filter functionality

## Data Management
### Table Configurations (tableButtons.js)
Defines the position for each table button:
```javascript
// Example configuration structure
export const tableButtons = [
  {
    id: 'layout1',
    chairCount: 121,
    tables: [
      { x: 29.5, y: 14 },
      { x: 29.5, y: 36 },
      { x: 29.5, y: 58 },
      { x: 29.5, y: 80 },
      { x: 42, y: 29 },
      { x: 41.5, y: 58 },
      { x: 41.5, y: 80 },
      { x: 53, y: 14 },
      { x: 53, y: 36 },
      { x: 53, y: 58 },
      { x: 53, y: 80 },
    ],
  },
]
```

### Zoom Configuration (zoomImageConfig.js)
```javascript
// Main configuration for zoomable table images by layout and variant
export const zoomImageConfig = {
    layout1: {
        default: {
            src: new URL("/layout1/default_table_layout1.png", import.meta.url).href,
        },
        4: {
            src: new URL("/layout1/table5_layout1.png", import.meta.url).href,
        }
    },
    layout2: {
        default: { /// revisar imatge taules a les que les cadiras estan en grup de 3
            src: new URL("/layout2/default_table_layout2.png", import.meta.url).href,
            style: commonStyle210
        },
        4: {
            src: new URL("/layout2/table5_layout2.png", import.meta.url).href,
        }
    },
}
```

### Chair Configuration (zoomChairs.js)
```javascript
// Chair positions for each layout and variant
export const zoomChairs = {
    layout1: {
        0: [
            { top: 11, left: 40 }, { top: 11, left: 60 },
            { top: 34, left: 79 }, { top: 55, left: 79 },
            { top: 79, left: 60 }, { top: 79, left: 40 },
            { top: 54, left: 22 }, { top: 33, left: 22 },
        ],
        1: [
            { top: 11, left: 40 }, { top: 11, left: 60 },
            { top: 34, left: 79 }, { top: 55, left: 79 },
            { top: 79, left: 60 }, { top: 79, left: 40 },
            { top: 54, left: 22 }, { top: 33, left: 22 },
        ],
        2: [
            { top: 11, left: 40 }, { top: 11, left: 60 },
            { top: 34, left: 79 }, { top: 55, left: 79 },
            { top: 79, left: 60 }, { top: 79, left: 40 },
            { top: 54, left: 22 }, { top: 33, left: 22 },
        ],
    }
}
```

## API Integration
The `services/api.js` module handles all communication with the backend:

```javascript
Key endpoints:
- getAllGuests
- addGuest
- deleteGuest
- getAllTables
```

## State Management
The application uses Vue's built-in reactivity system for state management:
- Component-level state for UI interactions
- Shared state for guest list and seating arrangements
- Computed properties for derived data
- Watchers for reactive updates

