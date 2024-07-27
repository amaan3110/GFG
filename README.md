# Transaction Dashboard

## Overview

This is a Node.js application using Express.js to manage and display transaction data. The application connects to a MongoDB database to store and query transaction details, providing various endpoints to fetch and display data based on specific criteria.

## Features

- **Initialize Database**: Load seed data into the MongoDB database.
- **View Transactions**: List transactions with search and pagination functionality.
- **View Statistics**: Display statistics for transactions within a specified month.
- **View Bar Chart**: Display the count of transactions within different price ranges for a specified month.
- **View Pie Chart**: Display the distribution of transactions across different categories for a specified month.
- **Combined Data**: Fetch combined statistics, bar chart data, and pie chart data for a specified month.

## Prerequisites

- Node.js
- npm (Node Package Manager)
- MongoDB

## Installation

1. **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/transaction-management-system.git
    cd transaction-management-system
    ```

2. **Install dependencies:**
    ```bash
    npm install
    ```

3. **Set up MongoDB:**
    - Make sure MongoDB is running and accessible.
    - Update the MongoDB connection string in the `connectDB` function within the `index.js` file if necessary.

## Usage

1. **Initialize the database:**
    ```bash
    curl http://localhost:3000/initialize
    ```

2. **Start the server:**
    ```bash
    npm start
    ```

3. **Access the application:**
    - Visit `http://localhost:3000` to view the transactions list.
    - Use the following endpoints to access specific functionalities:

    - **Initialize Database:** `GET /initialize`
    - **List Transactions:** `GET /transactions`
    - **View Statistics:** `GET /statistics`
    - **View Bar Chart Data:** `GET /barchart`
    - **View Pie Chart Data:** `GET /piechart`
    - **Combined Data:** `GET /combined-data`
    - **Bar Chart View:** `GET /bar-chart`
    - **Pie Chart View:** `GET /pie-chart`

## API Endpoints

### Initialize Database

- **URL:** `/initialize`
- **Method:** `GET`
- **Description:** Fetches seed data and populates the MongoDB database.

### List Transactions

- **URL:** `/transactions`
- **Method:** `GET`
- **Query Parameters:**
  - `month`: Filter transactions by month.
  - `search`: Search transactions by title, description, or price.
  - `page`: Page number for pagination (default: 1).
  - `perPage`: Number of transactions per page (default: 10).

### View Statistics

- **URL:** `/statistics`
- **Method:** `GET`
- **Query Parameters:**
  - `month`: Filter statistics by month (required).

### View Bar Chart Data

- **URL:** `/barchart`
- **Method:** `GET`
- **Query Parameters:**
  - `month`: Filter bar chart data by month (required).

### View Pie Chart Data

- **URL:** `/piechart`
- **Method:** `GET`
- **Query Parameters:**
  - `month`: Filter pie chart data by month (required).

### Combined Data

- **URL:** `/combined-data`
- **Method:** `GET`
- **Query Parameters:**
  - `month`: Filter combined data by month (required).

### Bar Chart View

- **URL:** `/bar-chart`
- **Method:** `GET`
- **Description:** Renders the bar chart view.

### Pie Chart View

- **URL:** `/pie-chart`
- **Method:** `GET`
- **Description:** Renders the pie chart view.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
