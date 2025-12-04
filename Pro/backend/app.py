"""
Flask API Server for Coffee Machine
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
import coffee_machine

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend


@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Get coffee menu with availability"""
    try:
        menu = coffee_machine.get_menu()
        return jsonify({
            "status": "success",
            "menu": menu
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/status', methods=['GET'])
def get_status():
    """Get current machine status"""
    try:
        machine_state = coffee_machine.get_machine_state()
        return jsonify({
            "status": "success",
            "machine": machine_state
        }), 200
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/select', methods=['POST'])
def select_coffee():
    """Select a coffee and check availability"""
    try:
        data = request.get_json()
        coffee_type = data.get('coffee_type', '').lower()
        
        if not coffee_type:
            return jsonify({
                "status": "error",
                "message": "Coffee type is required"
            }), 400
        
        is_available, coffee_data = coffee_machine.check_ingredient_availability(coffee_type)
        
        if not is_available:
            return jsonify({
                "status": "error",
                "message": "Insufficient ingredients",
                "available": False
            }), 400
        
        return jsonify({
            "status": "success",
            "available": True,
            "cost": coffee_data["cost"]
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/pay', methods=['POST'])
def process_payment():
    """Process payment for coffee order"""
    try:
        data = request.get_json()
        coffee_type = data.get('coffee_type', '').lower()
        coins_5 = int(data.get('coins_5', 0))
        coins_10 = int(data.get('coins_10', 0))
        coins_20 = int(data.get('coins_20', 0))
        
        if not coffee_type:
            return jsonify({
                "status": "error",
                "message": "Coffee type is required"
            }), 400
        
        success, change, updated_state, error_message = coffee_machine.process_payment(
            coffee_type, coins_5, coins_10, coins_20
        )
        
        if not success:
            return jsonify({
                "status": "error",
                "message": error_message
            }), 400
        
        return jsonify({
            "status": "success",
            "change": change,
            "updated_state": updated_state
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/admin/report', methods=['POST'])
def admin_report():
    """Admin login and get report"""
    try:
        data = request.get_json()
        password = data.get('password', '')
        
        is_valid, session_token = coffee_machine.authenticate_admin(password)
        
        if not is_valid:
            return jsonify({
                "status": "error",
                "message": "Incorrect password"
            }), 401
        
        machine_state = coffee_machine.get_machine_state()
        
        return jsonify({
            "status": "success",
            "report": machine_state,
            "admin_session": session_token
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/admin/manage-ingredients', methods=['POST'])
def manage_ingredients():
    """Manage ingredients (add or decrease)"""
    try:
        data = request.get_json()
        action = data.get('action', '').lower()
        ingredient = data.get('ingredient', '').lower()
        quantity = int(data.get('quantity', 0))
        session_token = data.get('admin_session', '')
        
        if not session_token:
            return jsonify({
                "status": "error",
                "message": "Admin session required"
            }), 401
        
        # Handle "sugar" vs "suger" spelling
        if ingredient == "sugar":
            ingredient = "suger"
        
        success, updated_state, error_message = coffee_machine.manage_ingredients(
            action, ingredient, quantity, session_token
        )
        
        if not success:
            return jsonify({
                "status": "error",
                "message": error_message
            }), 400
        
        return jsonify({
            "status": "success",
            "message": "Ingredients updated successfully",
            "updated_state": updated_state
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/admin/bulk-update', methods=['POST'])
def bulk_update():
    """Bulk update multiple ingredients"""
    try:
        data = request.get_json()
        mode = data.get('mode', '').lower()
        ingredients = data.get('ingredients', {})
        session_token = data.get('admin_session', '')
        
        if not session_token:
            return jsonify({
                "status": "error",
                "message": "Admin session required"
            }), 401
        
        # Handle "sugar" vs "suger" spelling
        if "sugar" in ingredients:
            ingredients["suger"] = ingredients.pop("sugar")
        
        success, updated_state, error_message = coffee_machine.bulk_update_ingredients(
            mode, ingredients, session_token
        )
        
        if not success:
            return jsonify({
                "status": "error",
                "message": error_message
            }), 400
        
        return jsonify({
            "status": "success",
            "message": "Bulk update successful",
            "updated_state": updated_state
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/admin/manage-money', methods=['POST'])
def manage_money():
    """Manage money (deposit or withdraw)"""
    try:
        data = request.get_json()
        action = data.get('action', '').lower()
        amount = float(data.get('amount', 0))
        session_token = data.get('admin_session', '')
        
        if not session_token:
            return jsonify({
                "status": "error",
                "message": "Admin session required"
            }), 401
        
        success, updated_state, error_message = coffee_machine.manage_money(
            action, amount, session_token
        )
        
        if not success:
            return jsonify({
                "status": "error",
                "message": error_message
            }), 400
        
        return jsonify({
            "status": "success",
            "message": f"Money {action}ed successfully",
            "updated_state": updated_state
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/admin/logout', methods=['POST'])
def admin_logout():
    """Logout admin session"""
    try:
        data = request.get_json()
        session_token = data.get('admin_session', '')
        
        coffee_machine.logout_admin(session_token)
        
        return jsonify({
            "status": "success",
            "message": "Logged out successfully"
        }), 200
        
    except Exception as e:
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "success",
        "message": "Coffee Machine API is running"
    }), 200


if __name__ == '__main__':
    print("Starting Coffee Machine API Server...")
    print("API will be available at http://localhost:5000")
    print("Make sure frontend is configured to connect to this URL")
    app.run(debug=True, host='0.0.0.0', port=5000)

