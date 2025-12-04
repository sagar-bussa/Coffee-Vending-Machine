# Quick Start Guide

## Prerequisites
- Python 3.7 or higher
- pip (Python package manager)

## Installation Steps

### 1. Install Backend Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Start Backend Server
```bash
python app.py
```
The server will start on `http://localhost:5000`

### 3. Open Frontend
- Option 1: Open `frontend/index.html` directly in your browser
- Option 2: Use a local server (recommended):
  ```bash
  cd frontend
  python -m http.server 8000
  # Then open http://localhost:8000 in your browser
  ```

## Usage

### For Users
1. Select a coffee from the menu
2. Enter payment using ₹5, ₹10, and ₹20 coins
3. Confirm payment and receive your coffee

### For Administrators
1. Click "Admin Report" button
2. Enter password: `2006`
3. View machine status and manage ingredients
4. Click "Add" or "Decrease" for any ingredient
5. Enter quantity and confirm

## Troubleshooting

### Backend not starting
- Make sure Flask is installed: `pip install flask flask-cors`
- Check if port 5000 is available

### Frontend can't connect to backend
- Ensure backend is running on `http://localhost:5000`
- Check browser console for errors
- Verify CORS is enabled in backend

### Port already in use
- Change port in `backend/app.py` (line: `app.run(..., port=5000)`)
- Update API_BASE_URL in `frontend/js/app.js` accordingly

## Project Structure
```
C:\python\Pro\
├── backend/
│   ├── app.py                    # Flask server
│   ├── coffee_machine.py         # Business logic
│   ├── coffee_requirements.py   # Data definitions
│   └── requirements.txt          # Dependencies
├── frontend/
│   ├── index.html               # Main HTML
│   ├── css/
│   │   └── style.css           # Styling
│   └── js/
│       └── app.js              # JavaScript logic
└── README.md                    # Full documentation
```

## Default Admin Password
**Password: `2006`**

Change this in production!

