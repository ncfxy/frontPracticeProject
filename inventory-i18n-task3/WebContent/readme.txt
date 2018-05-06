Inventory Management System
    This system is designed for wholesaler company which purchase items from the manufacturer and sale to the retailer in different places. So the company can have several warehouses to store inventory around the world. It supports six user roles: salesman, buyer, financial, warehouse keeper, deliveryman, company manager.  And it can simplify their work a lot.
    Now let us see how to use this useful system together.


User Login
    A. User Login
        1. Different user type has different operate permission on this system.
        2. User can login the system by clicking the login link in right top of the page.
        3. Input his username and password.
        4. The functions which he can use appear and the login link change into logout link.
    B. Responsibility  And Todo List
        1. User get into their operation page by clicking the navigation bar in the top.
        2. The default page list their responsibility and provide a quick link.
        3. The default page also have a todo list which contains the nearest work he need solve.


Sales Man
    A. Input Sales Plan
        1. Look at every stock's sales yearly plan in table.
        2. Export the selected sales plan to csv file which is named “salesplan-timestring.csv”.
        3. Import sales plan from csv file and the database will be updated.
        4. Look at and edit one stock's monthly sales plan in a year.

    B. Visit Customers and Sign Contracts
        1. Look at item introduction list and detailed specification.
        2. Look at existing contracts and add new contracts.
        3. Manage customers' information.

    C. Create Sales Orders
        1. Sales Order is created according to existing contracts.
        2. Add some valid contracts to the create order page. Then create a new sales order.

    D. Arrange Sales Order
        1. Wait order state change to be “Paid” after financial employee confirm the order.
        2. Arrange the items to exact warehouse. It is ideal to arrange all the items to one warehouse.
        3. Choose a deliveryman to take charge in this order.
        4. Submit the arrange result.

    E. Follow the Sales Order
        1. Check the “Arranged” or “Warehouse Exiting” order to see the process of this order.
        2. The order state change into “Delivered” after the delivery man finish the delivery.
        3. Click the Finish button and close the order successfully.

    F. Look at Sales Report.
        The same with manager's function.


Buyer
    A. Make Purchase Plan
        1. Look at every stock's purchase yearly plan in table.
        2. Export the selected purchase plan to csv file which is named “purchaseplan-timestring.csv”.
        3. Import purchase plan from csv file and the database will be updated.
        4. Look at and edit one stock's monthly plan in a year.
        5. A inventory variation line chart is calculated based on sales plan and purchase plan, buyer should make the line always over the warning line.
        6. Buyers can evaluate different monthly plan by input estimated holding cost, order cost and per price.

    B. Create Purchase Orders
        1. View the purchase plan of this month and import them to the purchase order. And the system will calculate an adjusted purchase amount based on current inventory.
        2. Look at all the stocks' inventory and adjust the purchase order.
        3. Confirm and create a new purchase order.

    C. Confirm Price With Suppliers
        1. Buyer should contact with suppliers and ask the item price after they create purchase order.
        2. Fill every item's purchase price in the order.
        3. Confirm the price and change order state into “Confirmed Purchase Price”

    D. Follow the Purchase Order
        1. Check the “Paid” or “Warehouse Entering” order to see the process of this order.
        2. When all the stocks have been entered, click the Finish button and close the order successfully.

    E. Look at Purchase Report.
        The same with manager's function.


Warehouse Keeper
    A. Manage Warehouse and Inventory Inspection
        1. Check the warehouse's items. If the balance is below warning line, the background of that item will be set red.
        2. Look at the item's detail information and all the operation history.
        3. Update the warning value.

    B. Operate Warehouse Entry
        1. Search all the warehouse entry record of this warehouse.
        2. Print a Entry Counting Report when some supplier deliver items to the warehouse.
        3. Fill a Warehouse Entry report after counting the received amount of items.

    C. Confirm Price With Suppliers
        1. Search all the warehouse exit record of this warehouse.
        2. Print a Exit Counting Report when some deliveryman fetch items from the warehouse.
        3. Fill a Warehouse Exit Report after counting the fetched amount of items.


Delivery Man
    A. Deliver Items to Customers
        1. Collect stocks from warehouses.
        2. Deliver stocks to customer.
        3. Confirm the sales order and change the state to “Delivery”


Financial Employee
    A. Pay Money for Purchase Order.
        1. Pay money to suppliers.
        2. Confirm the purchase order and change the state to “Paid”.

    B. Receive Money and Confirm Sales Order
        1. Receive the money from customers.
        2. Confirm the sales order and change the state to “Paid”.


Manager
    A. Look at Purchase Report.
        1. Look, export and print monthly purchase report.
        2. Look, export and print yearly purchase amount report.
        3. Look, export and print yearly purchase cost report.
        4. Look, export and print detailed monthly purchase record for one stock.
        5. Look, export and print  detailed yearly purchase record for one stock.

    B. Look at Sales Report.
        1. Look, export and print monthly sales report.
        2. Look, export and print yearly sales amount report.
        3. Look, export and print yearly sales cost report.
        4. Look, export and print detailed monthly sales record for one stock.
        5. Look, export and print  detailed yearly sales record for one stock.





