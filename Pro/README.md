# Coffee Machine Web Application

A modern web-based coffee machine prototype with HTML/CSS/JS frontend and Python Flask backend. This application allows users to order coffee, make payments, and provides admin functionality for managing ingredients and viewing reports.

## Table of Contents

- [Features](#features)
- [Project Structure](#project-structure)
- [Coffee Menu](#coffee-menu)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Project Flows](#project-flows)
- [Architecture](#architecture)
- [Contributing](#contributing)

## Features

### User Features
- **Coffee Selection**: Choose from 5 different coffee types
- **Real-time Availability**: See which coffees are available based on ingredients
- **Payment System**: Pay using ₹5, ₹10, and ₹20 coins
- **Change Calculation**: Automatic change calculation and display
- **Resource Monitoring**: Visual indicators for ingredient levels

### Admin Features
- **Password-Protected Access**: Admin dashboard with password authentication (default: 2006)
- **Machine Report**: View total amount collected and resource levels
- **Ingredient Management**: Add or decrease ingredients (water, coffee, milk, sugar)
- **Bulk Operations**: Update multiple ingredients at once (optional)
- **Real-time Updates**: See changes reflected immediately

## Coffee Menu

| Coffee Type | Price | Water | Coffee | Milk | Sugar |
|------------|-------|-------|--------|------|-------|
| Espresso   | ₹30   | 30ml  | 8g     | 0ml  | 5g    |
| Latte      | ₹90   | 30ml  | 8g     | 150ml| 10g   |
| Cappuccino | ₹80   | 30ml  | 8g     | 120ml| 10g   |
| Black Coffee| ₹50  | 150ml | 10g    | 0ml  | 10g   |
| Mocha      | ₹110  | 30ml  | 8g     | 150ml| 10g   |

## Installation

### Prerequisites
- Python 3.7 or higher
- Modern web browser (Chrome, Firefox, Edge, Safari)

### Setup Steps

1. **Clone or navigate to the project directory**
   ```bash
   cd c:\python\Pro
   ```

2. **Install Python dependencies**
   ```bash
   pip install -r backend/requirements.txt
   ```

3. **Run the backend server**
   ```bash
   cd backend
   python app.py
   ```
   The server will start on `http://localhost:5000`

4. **Open the frontend**
   - Open `frontend/index.html` in your web browser
   - Or use a local server (recommended):
     ```bash
     # Using Python
     cd frontend
     python -m http.server 8000
     # Then open http://localhost:8000
     ```

## Usage

### For Users

1. **Browse Coffee Menu**: View available coffee options with prices
2. **Select Coffee**: Click on a coffee card to select
3. **Make Payment**: Enter the number of ₹5, ₹10, and ₹20 coins
4. **Confirm**: Review payment and confirm your order
5. **Receive Change**: View your change amount (if any)

### For Administrators

1. **Access Admin Panel**: Click "Admin Report" button
2. **Enter Password**: Default password is `2006`
3. **View Report**: See machine status and resource levels
4. **Manage Ingredients**: 
   - Click "Manage Ingredients"
   - Click "Add" or "Decrease" for any ingredient
   - Enter quantity and confirm
5. **Logout**: Return to main menu

## API Endpoints

### Public Endpoints

#### Get Coffee Menu
```
GET /api/menu
```
Returns list of all coffee items with availability status

**Response:**
```json
{
  "status": "success",
  "menu": [
    {
      "name": "espresso",
      "price": 30,
      "available": true
    },
    ...
  ]
}
```

#### Get Machine Status
```
GET /api/status
```
Returns current resource levels

**Response:**
```json
{
  "status": "success",
  "machine": {
    "amount": 1000,
    "water": 500,
    "coffee": 500,
    "milk": 500,
    "sugar": 500
  }
}
```

#### Select Coffee
```
POST /api/select
Content-Type: application/json

{
  "coffee_type": "espresso"
}
```

**Response:**
```json
{
  "status": "success",
  "available": true,
  "cost": 30
}
```

#### Process Payment
```
POST /api/pay
Content-Type: application/json

{
  "coffee_type": "espresso",
  "coins_5": 2,
  "coins_10": 1,
  "coins_20": 1
}
```

**Response:**
```json
{
  "status": "success",
  "change": 20,
  "updated_state": {
    "amount": 1030,
    "water": 470,
    "coffee": 492,
    "milk": 500,
    "sugar": 495
  }
}
```

### Admin Endpoints

#### Admin Login
```
POST /api/admin/report
Content-Type: application/json

{
  "password": "2006"
}
```

**Response:**
```json
{
  "status": "success",
  "report": {
    "amount": 1000,
    "water": 500,
    "coffee": 500,
    "milk": 500,
    "sugar": 500
  },
  "admin_session": "session_token"
}
```

#### Manage Ingredients
```
POST /api/admin/manage-ingredients
Content-Type: application/json
Headers: { "Authorization": "Bearer session_token" }

{
  "action": "add",
  "ingredient": "water",
  "quantity": 100
}
```

**Valid actions:** `add`, `decrease`  
**Valid ingredients:** `water`, `coffee`, `milk`, `sugar`

**Response:**
```json
{
  "status": "success",
  "message": "Ingredients updated successfully",
  "updated_state": {
    "water": 600,
    "coffee": 500,
    "milk": 500,
    "sugar": 500
  }
}
```

#### Bulk Update (Optional)
```
POST /api/admin/bulk-update
Content-Type: application/json
Headers: { "Authorization": "Bearer session_token" }

{
  "mode": "add",
  "ingredients": {
    "water": 100,
    "coffee": 50,
    "milk": 0,
    "sugar": 0
  }
}
```

## Project Flows

### Flow 1: User Coffee Selection and Purchase

```
START
  │
  ├─► Frontend: Display Coffee Menu (5 options)
  │
  ├─► User clicks on a coffee type
  │
  ├─► Frontend: Send POST /api/select
  │
  ├─► Backend: Validate coffee type
  │     │
  │     ├─ NO: Return error "Invalid coffee type"
  │     │
  │     └─ YES: Check ingredient availability
  │           │
  │           ├─ INSUFFICIENT: Return error
  │           │
  │           └─ SUFFICIENT: Return success + required payment
  │
  ├─► Frontend: Open Payment Modal
  │
  ├─► User enters coin amounts
  │
  ├─► Frontend: Calculate total_paid
  │
  ├─► Frontend: Validate payment
  │     │
  │     ├─ total_paid < cost: Show "Insufficient Payment"
  │     │
  │     └─ total_paid >= cost: Enable "Confirm Payment"
  │
  ├─► User clicks "Confirm Payment"
  │
  ├─► Frontend: Send POST /api/pay
  │
  ├─► Backend: Process Payment
  │     │
  │     ├─ Re-validate ingredient availability
  │     ├─ Calculate change = total_paid - cost
  │     ├─ Update Machine State
  │     └─ Return success response
  │
  ├─► Frontend: Display Success Message
  │
  ├─► Frontend: Update UI (resource bars, availability)
  │
  └─► RETURN TO MAIN MENU
```

### Flow 2: Admin Report Access

```
START
  │
  ├─► User clicks "Admin Report" button
  │
  ├─► Frontend: Display Password Input Modal
  │
  ├─► User enters password
  │
  ├─► Frontend: Send POST /api/admin/report
  │
  ├─► Backend: Validate Password
  │     │
  │     ├─ INCORRECT: Return error
  │     │
  │     └─ CORRECT: Generate report
  │
  ├─► Frontend: Display Admin Dashboard
  │     ├─ Show resource levels
  │     ├─ Show total amount collected
  │     ├─ Display "Manage Ingredients" button
  │     └─ Display "Logout" button
  │
  └─► User can click "Manage Ingredients"
        └─► GO TO FLOW 2A: Ingredient Management
```

### Flow 2A: Admin Ingredient Management

```
START (from Admin Dashboard)
  │
  ├─► Frontend: Display Ingredient Management Panel
  │     ├─ Current Levels Display with progress bars
  │     ├─ Action Buttons for each ingredient (Add/Decrease)
  │     └─ "Back to Report" button
  │
  ├─► User clicks on an action button
  │
  ├─► Frontend: Display Quantity Input Modal
  │     ├─ Input field for quantity
  │     ├─ Current level display
  │     ├─ Preview display (new level)
  │     └─ "Confirm" and "Cancel" buttons
  │
  ├─► User enters quantity value
  │     │
  │     ├─ For DECREASE: Validate input
  │     │   └─ Check if value > current level
  │     │
  │     └─ For ADD: Allow any positive value
  │
  ├─► Frontend: Real-time calculation
  │     ├─ For ADD: new_level = current_level + input_value
  │     └─ For DECREASE: new_level = current_level - input_value
  │
  ├─► User clicks "Confirm"
  │
  ├─► Frontend: Send POST /api/admin/manage-ingredients
  │
  ├─► Backend: Validate Request
  │     │
  │     ├─ Validate admin session
  │     ├─ Validate ingredient name
  │     ├─ Validate quantity
  │     └─ Process action
  │         │
  │         ├─ ACTION = "add": Update state
  │         └─ ACTION = "decrease": Update state (prevent negatives)
  │
  ├─► Backend: Save updated state
  │
  ├─► Frontend: Display Success Message
  │
  ├─► Frontend: Update Ingredient Management Panel
  │
  ├─► Frontend: Refresh menu availability
  │
  └─► RETURN TO MANAGEMENT PANEL or ADMIN DASHBOARD
```

### Flow 3: Initial Page Load

```
START
  │
  ├─► Browser loads index.html
  │
  ├─► Frontend: Execute app.js initialization
  │
  ├─► Frontend: Send GET /api/menu
  │
  ├─► Backend: Get menu data with availability status
  │
  ├─► Frontend: Receive menu data
  │
  ├─► Frontend: Send GET /api/status
  │
  ├─► Backend: Return current machine state
  │
  ├─► Frontend: Receive status data
  │
  ├─► Frontend: Render UI
  │     ├─ Display coffee menu cards
  │     ├─ Update availability indicators
  │     ├─ Render resource level bars
  │     └─ Enable user interactions
  │
  └─► READY STATE (Waiting for user actions)
```

### Flow 4: Real-time Status Updates

```
AFTER EACH TRANSACTION
  │
  ├─► Frontend: Automatically sends GET /api/status
  │
  ├─► Backend: Return latest machine state
  │
  ├─► Frontend: Receive updated status
  │
  ├─► Frontend: Update UI Elements
  │     ├─ Update resource progress bars
  │     ├─ Check and update coffee availability
  │     ├─ Change color indicators:
  │     │   ├─ Green: > 50% remaining
  │     │   ├─ Yellow: 25-50% remaining
  │     │   └─ Red: < 25% remaining
  │     └─ Disable unavailable coffee options
  │
  └─► UI REFRESHED
```

## Architecture

### Frontend Architecture
```
frontend/
├── index.html          # Main HTML structure
├── css/
│   └── style.css      # Styling and animations
├── js/
│   └── app.js         # JavaScript logic and API calls
└── assets/
    └── images/        # Coffee icons/images
```

### Backend Architecture
```
backend/
├── app.py                    # Flask application and routes
├── coffee_machine.py         # Business logic
├── coffee_requirements.py   # Data definitions
└── requirements.txt          # Python dependencies
```

### Communication Flow
```
Frontend (HTML/JS) → REST API → Python Backend → State Management → Response
```

### State Management
- Machine state stored in memory (can be persisted to JSON file)
- State updates are atomic and validated
- Prevents negative values
- Thread-safe operations

## Error Handling

### Common Error Scenarios

1. **Insufficient Ingredients**
   - Check before order confirmation
   - Display user-friendly message
   - Refresh availability status

2. **Insufficient Payment**
   - Validate before API call
   - Show exact amount needed
   - Allow retry or cancel

3. **Network Errors**
   - Display connection error message
   - Provide retry functionality
   - Graceful degradation

4. **Invalid Admin Access**
   - Session validation
   - Logout on unauthorized access
   - Log security events

5. **Ingredient Management Errors**
   - Prevent negative values
   - Validate quantity inputs
   - Show clear error messages

## Security Considerations

- Admin password protection
- Input validation and sanitization
- CORS configuration for API
- Session management for admin access
- Prevent negative resource values

## Future Enhancements

- Real-time WebSocket updates
- Transaction history log
- Recipe display for each coffee
- Sound effects
- Dark/light theme toggle
- Multi-language support
- Database persistence
- User authentication
- Order history for users

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available for educational purposes.

## Contact

For questions or issues, please open an issue on the repository.

---

**Note**: Default admin password is `2006`. Change this in production!

