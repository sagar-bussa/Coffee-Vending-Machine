"""
Coffee Machine Business Logic
Handles all coffee machine operations and state management
"""
import coffee_requirements

# Coffee type mapping
COFFEE_MAP = {
    "espresso": 0,
    "latte": 1,
    "cappuccino": 2,
    "black coffee": 3,
    "blackcoffee": 3,  # Alternative spelling
    "mocha": 4
}

# Admin password
ADMIN_PASSWORD = "2006"

# Active admin sessions (in production, use proper session management)
active_sessions = set()


def get_machine_state():
    """Get current machine state"""
    return coffee_requirements.machine.copy()


def check_ingredient_availability(coffee_type):
    """
    Check if there are sufficient ingredients for a coffee type
    Returns: (is_available, coffee_data)
    """
    if coffee_type not in COFFEE_MAP:
        return False, None
    
    coffee_index = COFFEE_MAP[coffee_type]
    coffee_data = coffee_requirements.data[coffee_index]
    machine = coffee_requirements.machine
    
    # Check if all ingredients are sufficient
    if (machine["water"] - coffee_data["water"] >= 0 and
        machine["coffee"] - coffee_data["coffee"] >= 0 and
        machine["milk"] - coffee_data["milk"] >= 0 and
        machine["suger"] - coffee_data["suger"] >= 0):
        return True, coffee_data
    
    return False, coffee_data


def process_payment(coffee_type, coins_5, coins_10, coins_20):
    """
    Process payment for a coffee order
    Returns: (success, change_amount, updated_state, error_message)
    """
    # Validate inputs
    if coffee_type not in COFFEE_MAP:
        return False, 0, None, "Invalid coffee type"
    
    # Check availability again
    is_available, coffee_data = check_ingredient_availability(coffee_type)
    if not is_available:
        return False, 0, None, "Insufficient ingredients"
    
    # Calculate payment
    total_paid = (coins_5 * 5) + (coins_10 * 10) + (coins_20 * 20)
    cost = coffee_data["cost"]
    
    if total_paid < cost:
        return False, 0, None, f"Insufficient payment. Required: ₹{cost}, Paid: ₹{total_paid}"
    
    # Calculate change
    change = total_paid - cost
    
    # Update machine state
    machine = coffee_requirements.machine
    machine["amount"] += cost
    machine["water"] -= coffee_data["water"]
    machine["coffee"] -= coffee_data["coffee"]
    machine["milk"] -= coffee_data["milk"]
    machine["suger"] -= coffee_data["suger"]
    
    # Ensure no negative values
    machine["water"] = max(0, machine["water"])
    machine["coffee"] = max(0, machine["coffee"])
    machine["milk"] = max(0, machine["milk"])
    machine["suger"] = max(0, machine["suger"])
    
    return True, change, get_machine_state(), None


def get_menu():
    """
    Get menu with availability status
    Returns: List of coffee items with availability
    """
    menu = []
    for coffee_data in coffee_requirements.data:
        coffee_type = coffee_data["item"]
        is_available, _ = check_ingredient_availability(coffee_type)
        menu.append({
            "name": coffee_type,
            "price": coffee_data["cost"],
            "available": is_available
        })
    return menu


def authenticate_admin(password):
    """
    Authenticate admin user
    Returns: (is_valid, session_token)
    """
    if password == ADMIN_PASSWORD:
        import uuid
        session_token = str(uuid.uuid4())
        active_sessions.add(session_token)
        return True, session_token
    return False, None


def is_admin_authenticated(session_token):
    """Check if admin session is valid"""
    return session_token in active_sessions


def manage_ingredients(action, ingredient, quantity, session_token):
    """
    Manage ingredients (add or decrease)
    Returns: (success, updated_state, error_message)
    """
    # Validate session
    if not is_admin_authenticated(session_token):
        return False, None, "Unauthorized. Please login again."
    
    # Validate ingredient
    valid_ingredients = ["water", "coffee", "milk", "suger"]
    if ingredient not in valid_ingredients:
        return False, None, "Invalid ingredient"
    
    # Validate quantity
    if quantity <= 0:
        return False, None, "Quantity must be greater than 0"
    
    # Validate action
    if action not in ["add", "decrease"]:
        return False, None, "Invalid action. Use 'add' or 'decrease'"
    
    machine = coffee_requirements.machine
    current_level = machine[ingredient]
    
    # Process action
    if action == "add":
        new_level = current_level + quantity
    else:  # decrease
        if current_level < quantity:
            return False, None, f"Insufficient amount. Current: {current_level}"
        new_level = current_level - quantity
        # Ensure no negative values
        new_level = max(0, new_level)
    
    # Update machine state
    machine[ingredient] = new_level
    
    return True, get_machine_state(), None


def bulk_update_ingredients(mode, ingredients_dict, session_token):
    """
    Bulk update multiple ingredients
    Returns: (success, updated_state, error_message)
    """
    # Validate session
    if not is_admin_authenticated(session_token):
        return False, None, "Unauthorized. Please login again."
    
    # Validate mode
    if mode not in ["add", "set"]:
        return False, None, "Invalid mode. Use 'add' or 'set'"
    
    machine = coffee_requirements.machine
    valid_ingredients = ["water", "coffee", "milk", "suger"]
    
    # Validate and calculate new values
    updates = {}
    for ingredient, value in ingredients_dict.items():
        if ingredient not in valid_ingredients:
            continue
        
        if value == 0:
            continue
        
        current_level = machine[ingredient]
        
        if mode == "add":
            new_level = current_level + value
        else:  # set
            new_level = value
        
        # Ensure no negative values
        new_level = max(0, new_level)
        updates[ingredient] = new_level
    
    # Apply updates
    for ingredient, new_level in updates.items():
        machine[ingredient] = new_level
    
    return True, get_machine_state(), None


def logout_admin(session_token):
    """Logout admin session"""
    if session_token in active_sessions:
        active_sessions.remove(session_token)
    return True


def manage_money(action, amount, session_token):
    """
    Manage money (deposit or withdraw)
    Returns: (success, updated_state, error_message)
    """
    # Validate session
    if not is_admin_authenticated(session_token):
        return False, None, "Unauthorized. Please login again."
    
    # Validate amount
    if amount <= 0:
        return False, None, "Amount must be greater than 0"
    
    # Validate action
    if action not in ["deposit", "withdraw"]:
        return False, None, "Invalid action. Use 'deposit' or 'withdraw'"
    
    machine = coffee_requirements.machine
    current_amount = machine["amount"]
    
    # Process action
    if action == "deposit":
        new_amount = current_amount + amount
    else:  # withdraw
        if current_amount < amount:
            return False, None, f"Insufficient balance. Current: ₹{current_amount}, Requested: ₹{amount}"
        new_amount = current_amount - amount
        # Ensure no negative values
        new_amount = max(0, new_amount)
    
    # Update machine state
    machine["amount"] = new_amount
    
    return True, get_machine_state(), None

