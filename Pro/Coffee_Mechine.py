import Coffee_Requirements
import os

def pay():
    no_of_5s = int(input("How many no.of ₹5 coins :"))*5
    no_of_10s = int(input("How many no.of ₹10 coins :"))*10
    no_of_20s = int(input("How many no.of ₹20 coins :"))*20
    change = (no_of_5s + no_of_10s + no_of_20s) - items[count[selected_item]]["cost"]
    return change

def quantity(selected_item,count):
    if (machine["water"] - items[count[selected_item]]["water"] > 0) and (machine["coffee"] - items[count[selected_item]]["coffee"] > 0) and (machine["milk"] - items[count[selected_item]]["milk"] > 0) and (machine["suger"] - items[count[selected_item]]["suger"] > 0) :
        return True
    else:
        return False


       
def print_report(a,w,c,m,s):
        print("Amount :",a)
        print("Water :",w)
        print("Coffee :",c)
        print("Milk :",m)
        print("Suger :",s)



items = Coffee_Requirements.data
machine = Coffee_Requirements.machine
count = {
    "espresso" : 0,
    "latte" : 1,
    "cappuccino" : 2,
    "black coffee" : 3,
    "mocha" : 4,

}
selected_item = ''
while selected_item != 'report' or selected_item != 'exit':
    selected_item = input("Enter the item\nEspresso - ₹30\nLatte - ₹90\nCappuccino - ₹80\nBlack Coffee - ₹50\nMocha - ₹110\n--->").lower()
    if selected_item == 'report' or selected_item == 'exit':
        if selected_item == 'report':
            password = input("Enter the password :")
            if password == '2006':
                os.system('cls')
                print_report(machine["amount"],machine["water"],machine["coffee"],machine["milk"],machine["suger"] )
                break
            else :
                os.system('cls')
                print("Incorrect Password")
                continue
        elif selected_item == 'exit':
            print(Coffee_Requirements.thank_you)
            break
    
    elif selected_item == 'espresso' or selected_item =='latte' or selected_item =='cappuccino' or selected_item =='black coffee' or selected_item =='blackcoffee' or selected_item =='mocha':
        qu = quantity(selected_item,count)
        if qu:
            machine["amount"] += items[count[selected_item]]["cost"]
            machine["water"] -= items[count[selected_item]]["water"]
            machine["coffee"] -= items[count[selected_item]]["coffee"]
            machine["milk"] -= items[count[selected_item]]["milk"]
            machine["suger"] -= items[count[selected_item]]["suger"]
            change = pay()
            if change < 0:
                again = input("Insufficient Amount. Do you want to Repay(y/n)?")
                if again == 'y':
                    pay()
                else:
                    break
            print("Here is your change",change)  
        else:
            os.system('cls')
            print("Insufficient Ingredirnts, please select another item.")
    else:
        os.system('cls')
        print("Item Not Found. Please enter valied item")