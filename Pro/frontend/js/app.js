// Coffee Machine Frontend JavaScript

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// State Management
let currentMachineState = {
    amount: 1000,
    water: 500,
    coffee: 500,
    milk: 500,
    suger: 500
};

let adminSession = null;
let selectedCoffee = null;
let currentIngredient = null;
let currentAction = null;
let currentMoneyAction = null;

// Coffee images mapping - Professional high-quality images from Unsplash
// Using curated professional coffee photography with consistent style
const coffeeImages = {
    'espresso': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=1000&h=1000&fit=crop&crop=center&auto=format&q=95',
    'latte': 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=1000&h=1000&fit=crop&crop=center&auto=format&q=95',
    'cappuccino': 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=1000&h=1000&fit=crop&crop=center&auto=format&q=95',
    'black coffee': 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&h=1000&fit=crop&crop=center&auto=format&q=95',
    'mocha': 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=1000&h=1000&fit=crop&crop=center&auto=format&q=95'
};

// Coffee icons mapping (fallback)
const coffeeIcons = {
    'espresso': '☕',
    'latte': '🥛',
    'cappuccino': '☕',
    'black coffee': '☕',
    'mocha': '🍫'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    setupEventListeners();
});

// Initialize App
async function initializeApp() {
    showLoading();
    await Promise.all([
        loadMenu(),
        loadStatus()
    ]);
    hideLoading();
}

// Setup Event Listeners
function setupEventListeners() {
    // Header buttons
    document.getElementById('adminBtn').addEventListener('click', () => {
        document.getElementById('adminLoginModal').classList.add('show');
    });

    document.getElementById('exitBtn').addEventListener('click', showThankYou);

    // Payment modal
    document.getElementById('closePayment').addEventListener('click', closePaymentModal);
    document.getElementById('cancelPayment').addEventListener('click', closePaymentModal);
    document.getElementById('confirmPayment').addEventListener('click', processPayment);

    // Coin inputs
    ['coins5', 'coins10', 'coins20'].forEach(id => {
        document.getElementById(id).addEventListener('input', calculatePayment);
    });

    // Admin login
    document.getElementById('closeAdminLogin').addEventListener('click', closeAdminLogin);
    document.getElementById('cancelAdminLogin').addEventListener('click', closeAdminLogin);
    document.getElementById('adminLoginBtn').addEventListener('click', adminLogin);
    document.getElementById('adminPassword').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') adminLogin();
    });

    // Admin dashboard
    document.getElementById('closeAdminDashboard').addEventListener('click', closeAdminDashboard);
    document.getElementById('adminLogoutBtn').addEventListener('click', adminLogout);

    // Ingredient management
    document.getElementById('closeIngredient').addEventListener('click', closeIngredientModal);
    document.getElementById('cancelIngredient').addEventListener('click', closeIngredientModal);
    document.getElementById('confirmIngredient').addEventListener('click', confirmIngredientChange);
    document.getElementById('ingredientQuantity').addEventListener('input', updateIngredientPreview);

    // Money management
    document.getElementById('closeMoney').addEventListener('click', closeMoneyModal);
    document.getElementById('cancelMoney').addEventListener('click', closeMoneyModal);
    document.getElementById('confirmMoney').addEventListener('click', confirmMoneyTransaction);
    document.getElementById('moneyAmount').addEventListener('input', updateMoneyPreview);

    // Success modal
    document.getElementById('closeSuccess').addEventListener('click', closeSuccessModal);

    // Thank you modal
    document.getElementById('closeThankYou').addEventListener('click', closeThankYouModal);

    // Close modals on outside click
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
}

// API Functions
async function apiCall(endpoint, method = 'GET', data = null) {
    try {
        const options = {
            method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data) {
            options.body = JSON.stringify(data);
        }

        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }

        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load Menu
async function loadMenu() {
    try {
        const result = await apiCall('/menu');
        displayMenu(result.menu);
    } catch (error) {
        showError('Failed to load menu. Please refresh the page.');
    }
}

// Display Menu
function displayMenu(menu) {
    const coffeeGrid = document.getElementById('coffeeGrid');
    coffeeGrid.innerHTML = '';

    menu.forEach(coffee => {
        const card = document.createElement('div');
        card.className = `coffee-card ${coffee.available ? '' : 'unavailable'}`;
        card.onclick = () => coffee.available && selectCoffee(coffee);

        const imageUrl = coffeeImages[coffee.name] || coffeeImages['espresso'];
        const badge = coffee.available ? 
            '<span class="availability-badge available">Available</span>' :
            '<span class="availability-badge unavailable">Unavailable</span>';

        card.innerHTML = `
            ${badge}
            <div class="coffee-image-container">
                <img src="${imageUrl}" alt="${coffee.name}" class="coffee-image" loading="lazy" 
                     onerror="this.style.display='none'; const fallback = this.nextElementSibling; fallback.style.display='flex'; fallback.style.alignItems='center'; fallback.style.justifyContent='center';">
                <div class="coffee-icon" style="display: none;">${coffeeIcons[coffee.name] || '☕'}</div>
            </div>
            <div class="coffee-name">${coffee.name}</div>
            <div class="coffee-price">₹${coffee.price}</div>
        `;

        coffeeGrid.appendChild(card);
    });
}

// Load Status
async function loadStatus() {
    try {
        const result = await apiCall('/status');
        currentMachineState = result.machine;
        updateResourceBars();
    } catch (error) {
        showError('Failed to load machine status.');
    }
}

// Update Resource Bars
function updateResourceBars() {
    const maxValues = {
        water: 500,
        coffee: 500,
        milk: 500,
        suger: 500
    };

    ['water', 'coffee', 'milk', 'suger'].forEach(ingredient => {
        const maxValue = maxValues[ingredient];
        const currentValue = currentMachineState[ingredient];
        const percentage = (currentValue / maxValue) * 100;

        const bar = document.getElementById(`${ingredient}Bar`);
        const valueDisplay = document.getElementById(`${ingredient}Value`);

        if (bar) {
            bar.style.width = `${percentage}%`;
            
            // Update color based on level
            bar.classList.remove('low', 'critical');
            if (percentage < 25) {
                bar.classList.add('critical');
            } else if (percentage < 50) {
                bar.classList.add('low');
            }
        }

        if (valueDisplay) {
            const unit = ingredient === 'coffee' || ingredient === 'suger' ? 'g' : 'ml';
            valueDisplay.textContent = `${currentValue} ${unit}`;
        }
    });
}

// Select Coffee
async function selectCoffee(coffee) {
    try {
        showLoading();
        const result = await apiCall('/select', 'POST', {
            coffee_type: coffee.name
        });

        if (result.available) {
            selectedCoffee = coffee;
            openPaymentModal();
        } else {
            showError('This coffee is currently unavailable.');
        }
    } catch (error) {
        showError(error.message || 'Failed to select coffee.');
    } finally {
        hideLoading();
    }
}

// Open Payment Modal
function openPaymentModal() {
    if (!selectedCoffee) return;

    document.getElementById('selectedCoffeeName').textContent = selectedCoffee.name;
    document.getElementById('selectedCoffeeCost').textContent = selectedCoffee.price;
    document.getElementById('coins5').value = 0;
    document.getElementById('coins10').value = 0;
    document.getElementById('coins20').value = 0;
    document.getElementById('paymentError').classList.remove('show');
    calculatePayment();
    document.getElementById('paymentModal').classList.add('show');
}

// Close Payment Modal
function closePaymentModal() {
    document.getElementById('paymentModal').classList.remove('show');
    selectedCoffee = null;
}

// Calculate Payment
function calculatePayment() {
    const coins5 = parseInt(document.getElementById('coins5').value) || 0;
    const coins10 = parseInt(document.getElementById('coins10').value) || 0;
    const coins20 = parseInt(document.getElementById('coins20').value) || 0;

    const totalPaid = (coins5 * 5) + (coins10 * 10) + (coins20 * 20);
    const cost = selectedCoffee ? selectedCoffee.price : 0;
    const change = Math.max(0, totalPaid - cost);

    document.getElementById('totalPaid').textContent = totalPaid;
    document.getElementById('changeAmount').textContent = change;

    const confirmBtn = document.getElementById('confirmPayment');
    if (totalPaid >= cost) {
        confirmBtn.disabled = false;
        confirmBtn.style.opacity = '1';
    } else {
        confirmBtn.disabled = true;
        confirmBtn.style.opacity = '0.5';
    }
}

// Process Payment
async function processPayment() {
    const coins5 = parseInt(document.getElementById('coins5').value) || 0;
    const coins10 = parseInt(document.getElementById('coins10').value) || 0;
    const coins20 = parseInt(document.getElementById('coins20').value) || 0;
    const cost = selectedCoffee.price;
    const totalPaid = (coins5 * 5) + (coins10 * 10) + (coins20 * 20);

    if (totalPaid < cost) {
        document.getElementById('paymentError').textContent = 
            `Insufficient payment. Required: ₹${cost}, Paid: ₹${totalPaid}`;
        document.getElementById('paymentError').classList.add('show');
        return;
    }

    try {
        showLoading();
        const result = await apiCall('/pay', 'POST', {
            coffee_type: selectedCoffee.name,
            coins_5: coins5,
            coins_10: coins10,
            coins_20: coins20
        });

        currentMachineState = result.updated_state;
        updateResourceBars();
        
        closePaymentModal();
        showSuccess(`Payment successful! Your change is ₹${result.change}. Enjoy your coffee!`);
        
        // Refresh menu
        await loadMenu();
    } catch (error) {
        document.getElementById('paymentError').textContent = error.message;
        document.getElementById('paymentError').classList.add('show');
    } finally {
        hideLoading();
    }
}

// Admin Login
async function adminLogin() {
    const password = document.getElementById('adminPassword').value;

    if (!password) {
        document.getElementById('adminLoginError').textContent = 'Please enter password';
        document.getElementById('adminLoginError').classList.add('show');
        return;
    }

    try {
        showLoading();
        const result = await apiCall('/admin/report', 'POST', { password });

        adminSession = result.admin_session;
        currentMachineState = result.report;
        
        closeAdminLogin();
        openAdminDashboard();
    } catch (error) {
        document.getElementById('adminLoginError').textContent = error.message;
        document.getElementById('adminLoginError').classList.add('show');
    } finally {
        hideLoading();
    }
}

// Close Admin Login
function closeAdminLogin() {
    document.getElementById('adminLoginModal').classList.remove('show');
    document.getElementById('adminPassword').value = '';
    document.getElementById('adminLoginError').classList.remove('show');
}

// Open Admin Dashboard
function openAdminDashboard() {
    updateAdminDashboard();
    document.getElementById('adminDashboardModal').classList.add('show');
}

// Update Admin Dashboard
function updateAdminDashboard() {
    document.getElementById('reportAmount').textContent = currentMachineState.amount;
    document.getElementById('reportWater').textContent = `${currentMachineState.water} ml`;
    document.getElementById('reportCoffee').textContent = `${currentMachineState.coffee} g`;
    document.getElementById('reportMilk').textContent = `${currentMachineState.milk} ml`;
    document.getElementById('reportSugar').textContent = `${currentMachineState.suger} g`;
}

// Close Admin Dashboard
function closeAdminDashboard() {
    document.getElementById('adminDashboardModal').classList.remove('show');
}

// Admin Logout
async function adminLogout() {
    if (adminSession) {
        try {
            await apiCall('/admin/logout', 'POST', { admin_session: adminSession });
        } catch (error) {
            console.error('Logout error:', error);
        }
    }
    adminSession = null;
    closeAdminDashboard();
}

// Open Ingredient Modal (called from HTML)
function openIngredientModal(ingredient, action) {
    if (!adminSession) {
        showError('Please login as admin first.');
        return;
    }

    currentIngredient = ingredient;
    currentAction = action;

    const actionText = action === 'add' ? 'Add' : 'Decrease';
    document.getElementById('ingredientModalTitle').textContent = `${actionText} ${ingredient.charAt(0).toUpperCase() + ingredient.slice(1)}`;
    
    const ingredientKey = ingredient === 'sugar' ? 'suger' : ingredient;
    const currentValue = currentMachineState[ingredientKey];
    const unit = ingredient === 'coffee' || ingredient === 'sugar' ? 'g' : 'ml';
    
    document.getElementById('currentIngredientLevel').textContent = `${currentValue} ${unit}`;
    document.getElementById('ingredientQuantity').value = 1;
    document.getElementById('ingredientQuantity').min = 1;
    document.getElementById('ingredientError').classList.remove('show');
    
    updateIngredientPreview();
    document.getElementById('ingredientModal').classList.add('show');
}

// Update Ingredient Preview
function updateIngredientPreview() {
    const quantity = parseInt(document.getElementById('ingredientQuantity').value) || 0;
    const ingredientKey = currentIngredient === 'sugar' ? 'suger' : currentIngredient;
    const currentValue = currentMachineState[ingredientKey];
    const unit = currentIngredient === 'coffee' || currentIngredient === 'sugar' ? 'g' : 'ml';

    let newValue;
    if (currentAction === 'add') {
        newValue = currentValue + quantity;
    } else {
        newValue = Math.max(0, currentValue - quantity);
    }

    document.getElementById('previewLevel').textContent = `${newValue} ${unit}`;
}

// Confirm Ingredient Change
async function confirmIngredientChange() {
    const quantity = parseInt(document.getElementById('ingredientQuantity').value) || 0;

    if (quantity <= 0) {
        document.getElementById('ingredientError').textContent = 'Please enter a valid quantity';
        document.getElementById('ingredientError').classList.add('show');
        return;
    }

    const ingredientKey = currentIngredient === 'sugar' ? 'suger' : currentIngredient;

    try {
        showLoading();
        const result = await apiCall('/admin/manage-ingredients', 'POST', {
            action: currentAction,
            ingredient: ingredientKey,
            quantity: quantity,
            admin_session: adminSession
        });

        currentMachineState = result.updated_state;
        updateResourceBars();
        updateAdminDashboard();
        
        closeIngredientModal();
        showSuccess(`${currentAction === 'add' ? 'Added' : 'Decreased'} ${quantity} ${currentIngredient === 'coffee' || currentIngredient === 'sugar' ? 'g' : 'ml'} of ${currentIngredient}`);
        
        // Refresh menu
        await loadMenu();
    } catch (error) {
        document.getElementById('ingredientError').textContent = error.message;
        document.getElementById('ingredientError').classList.add('show');
    } finally {
        hideLoading();
    }
}

// Close Ingredient Modal
function closeIngredientModal() {
    document.getElementById('ingredientModal').classList.remove('show');
    currentIngredient = null;
    currentAction = null;
}

// Open Money Modal (called from HTML)
function openMoneyModal(action) {
    if (!adminSession) {
        showError('Please login as admin first.');
        return;
    }

    currentMoneyAction = action;

    const actionText = action === 'deposit' ? 'Deposit' : 'Withdraw';
    document.getElementById('moneyModalTitle').textContent = `${actionText} Money`;
    
    const currentBalance = currentMachineState.amount;
    document.getElementById('currentBalance').textContent = currentBalance.toFixed(2);
    document.getElementById('moneyAmount').value = '';
    document.getElementById('moneyAmount').min = '0.01';
    document.getElementById('moneyError').classList.remove('show');
    
    updateMoneyPreview();
    document.getElementById('moneyModal').classList.add('show');
}

// Make openMoneyModal globally accessible
window.openMoneyModal = openMoneyModal;

// Update Money Preview
function updateMoneyPreview() {
    const amount = parseFloat(document.getElementById('moneyAmount').value) || 0;
    const currentBalance = currentMachineState.amount;

    let newBalance;
    if (currentMoneyAction === 'deposit') {
        newBalance = currentBalance + amount;
    } else {
        newBalance = Math.max(0, currentBalance - amount);
    }

    document.getElementById('previewBalance').textContent = newBalance.toFixed(2);
    
    // Update button state for withdraw
    if (currentMoneyAction === 'withdraw') {
        const confirmBtn = document.getElementById('confirmMoney');
        if (amount > currentBalance || amount <= 0) {
            confirmBtn.disabled = true;
            confirmBtn.style.opacity = '0.5';
        } else {
            confirmBtn.disabled = false;
            confirmBtn.style.opacity = '1';
        }
    }
}

// Confirm Money Transaction
async function confirmMoneyTransaction() {
    const amount = parseFloat(document.getElementById('moneyAmount').value) || 0;

    if (amount <= 0) {
        document.getElementById('moneyError').textContent = 'Please enter a valid amount';
        document.getElementById('moneyError').classList.add('show');
        return;
    }

    if (currentMoneyAction === 'withdraw' && amount > currentMachineState.amount) {
        document.getElementById('moneyError').textContent = `Insufficient balance. Current: ₹${currentMachineState.amount.toFixed(2)}`;
        document.getElementById('moneyError').classList.add('show');
        return;
    }

    try {
        showLoading();
        const result = await apiCall('/admin/manage-money', 'POST', {
            action: currentMoneyAction,
            amount: amount,
            admin_session: adminSession
        });

        currentMachineState = result.updated_state;
        updateResourceBars();
        updateAdminDashboard();
        
        closeMoneyModal();
        showSuccess(`Successfully ${currentMoneyAction === 'deposit' ? 'deposited' : 'withdrew'} ₹${amount.toFixed(2)}`);
    } catch (error) {
        document.getElementById('moneyError').textContent = error.message;
        document.getElementById('moneyError').classList.add('show');
    } finally {
        hideLoading();
    }
}

// Close Money Modal
function closeMoneyModal() {
    document.getElementById('moneyModal').classList.remove('show');
    currentMoneyAction = null;
    document.getElementById('moneyAmount').value = '';
    document.getElementById('moneyError').classList.remove('show');
}

// Show Success
function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    document.getElementById('successModal').classList.add('show');
}

// Close Success Modal
function closeSuccessModal() {
    document.getElementById('successModal').classList.remove('show');
}

// Show Thank You
function showThankYou() {
    const thankYouMessage = `
$$$$$$$$\\ $$\\   $$\\  $$$$$$\\  $$\\   $$\\ $$\\   $$\\       $$\\     $$\\  $$$$$$\\  $$\\   $$\\         $$\\ 
\\__$$  __|$$ |  $$ |$$  __$$\\ $$$\\  $$ |$$ | $$  |      \\$$\\   $$  |$$  __$$\\ $$ |  $$ |        $$ |
   $$ |   $$ |  $$ |$$ /  $$ |$$$$\\ $$ |$$ |$$  /        \\$$\\ $$  / $$ /  $$ |$$ |  $$ |        $$ |
   $$ |   $$$$$$$$ |$$$$$$$$ |$$ $$\\$$ |$$$$$  /          \\$$$$  /  $$ |  $$ |$$ |  $$ |        $$ |
   $$ |   $$  __$$ |$$  __$$ |$$ \\$$$$ |$$  $$<            \\$$  /   $$ |  $$ |$$ |  $$ |        \\__|
   $$ |   $$ |  $$ |$$ |  $$ |$$ |\\$$$ |$$ |\\$$\\            $$ |    $$ |  $$ |$$ |  $$ |            
   $$ |   $$ |  $$ |$$ |  $$ |$$ | \\$$ |$$ | \\$$\\           $$ |     $$$$$$  |\\$$$$$$  |$$\\ $$\\ $$\\ 
   \\__|   \\__|  \\__|\\__|  \\__|\\__|  \\__|\\__|  \\__|          \\__|     \\______/  \\______/ \\__|\\__|\\__|`;
    
    document.getElementById('thankYouMessage').textContent = thankYouMessage;
    document.getElementById('thankYouModal').classList.add('show');
}

// Close Thank You Modal
function closeThankYouModal() {
    document.getElementById('thankYouModal').classList.remove('show');
}

// Show Loading
function showLoading() {
    document.getElementById('loadingOverlay').classList.add('show');
}

// Hide Loading
function hideLoading() {
    document.getElementById('loadingOverlay').classList.remove('show');
}

// Show Error
function showError(message) {
    alert(message); // Simple error display, can be enhanced with a modal
}

