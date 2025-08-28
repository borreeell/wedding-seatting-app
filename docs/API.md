# API Documentation

This document provides detailed information about the API endpoints, functions, and components used in the Wedding Seating Application. <br>
Keep in mind that backend server runs in `http://localhost:3000`

## Backend API Endpoints

### Guest Management

#### `GET /api/guests`
Retrieves all guests.

**Response:**
```json
{
    "id": 1,
    "name": "testGuest",
    "id_seat": 1,
    "is_child": 1,
    "is_vegetarian": 0,
    "is_vegan": 0,
    "is_gluten_intolerant": 1,
    "has_other_diet": 0,
    "other_diet_text": null,
    "has_allergies": 0,
    "allergy_text": null,
    "observations": ""
}
```

#### `POST /api/guests`
Creates a new guest.

**Request Body:**
```json
{
  "name": "testGuest",
  "id_seat": 12,
  "is_child": false,
  "is_vegetarian": true,
  "is_vegan": false,
  "is_gluten_intolerant": true,
  "has_other_diet": true,
  "other_diet_text": "",
  "has_allergies": true,
  "allergy_text": "",
  "observations": ""
}
```

### `DELETE /api/guests/:id_seat`
Deletes a guest by their seat ID.

** Request Body:**
```json
{
  "id_seat": "number"
}
```

### Table Management

#### `GET /api/tables`
Retrieves all tables and their configurations.
**Response:**
```json
{
    "table_id": "t10l1",
    "table_number": 10,
    "floor": 1,
    "seat_id": 106,
    "seat_number": 1,
    "guest_id": null,
    "guest_name": null,
},
```