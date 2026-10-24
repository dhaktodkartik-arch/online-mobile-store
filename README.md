# Online Mobile Store (Industrial Training Project)

A beginner-friendly web application for an Online Mobile Store built with:
- **Backend:** Node.js + Express + MySQL (`mysql2` with connection pool)
- **Frontend:** Plain HTML, CSS, and Vanilla JavaScript (no frameworks)

---

## Project Structure

```
ip evalution/
├── backend/
│   ├── node_modules/
│   ├── routes/
│   │   ├── auth.js            # POST /register, POST /login
│   │   ├── products.js        # GET /products (?search=&brand=), GET /products/:id
│   │   └── orders.js          # POST /orders (MySQL transaction), GET /orders/my
│   ├── middleware/
│   │   └── auth.js            # JWT verification middleware
│   ├── .env.example           # Example environment variables (MySQL credentials)
│   ├── .env                   # Active environment configuration
│   ├── .gitignore             # Ignores node_modules, .env
│   ├── db.js                  # MySQL connection pool & automatic table creation
│   ├── seed.js                # Auto-seeds 12 realistic mobile phones into MySQL
│   ├── package.json           # Project dependencies & scripts
│   └── server.js              # Express server with /api/health route
└── frontend/
    ├── css/
    │   └── style.css          # Shared styles (Blue & White student theme)
    ├── js/
    │   ├── config.js          # API URL configuration
    │   ├── cart.js            # Shopping cart management (localStorage)
    │   └── auth.js            # Auth state & dynamic navbar greeting/logout
    ├── index.html             # Homepage with Hero banner & 6 Featured Phones
    ├── products.html          # All Phones catalog with Search & Brand filter
    ├── product.html           # Single phone details page with quantity selector
    ├── cart.html              # Cart page with item table, quantities, and totals
    ├── checkout.html          # Checkout page with delivery address & COD payment
    ├── orders.html            # My Orders page showing past order history
    ├── login.html             # User login page
    └── register.html          # User registration page
```

---

## MySQL Setup & Configuration

1. Make sure your **MySQL Server** or **XAMPP MySQL** is running on port `3306`.
2. Open `backend/.env` and enter your MySQL credentials:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=mobile_store
   DB_PORT=3306
   ```
3. The server will **automatically create the `mobile_store` database and all 4 tables** (`users`, `products`, `orders`, `order_items`), and seed 12 initial smartphones into MySQL when it starts!

---

## How to Run

### 1. Start the Backend Server

Open your terminal, navigate to the `backend` folder, and run:

```bash
cd backend
npm run dev
```

*(Or `npm.cmd run dev` on Windows PowerShell)*

Your backend server will start at:
```
http://localhost:5000
```

You can test the health check route by opening this URL in your browser:
```
http://localhost:5000/api/health
```
You should see:
```json
{ "status": "ok", "database": "MySQL" }
```

### 2. Open the Frontend

Simply open `frontend/index.html` in your web browser (double-click the file or use VS Code Live Server). It will automatically connect to your backend!
