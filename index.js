// Import necessary modules
import express from "express"; // Express framework for building web applications
import bodyParser from "body-parser"; // Middleware to parse request bodies
import pg from "pg"; // PostgreSQL client for Node.js
import dotenv from "dotenv"; // Module to load environment variables from a .env file

// Load environment variables from .env file
dotenv.config();

// Create an instance of an Express application
const app = express();

// Define the port number the server will listen on
const port = 3000;

// Create a new PostgreSQL client using credentials from environment variables
const db = new pg.Client({
  user: process.env.DB_USER, // Database user
  host: process.env.DB_HOST, // Database host
  database: process.env.DB_DATABASE, // Database name
  password: process.env.DB_PASSWORD, // Database password
  port: process.env.DB_PORT, // Database port
});

// Connect to the PostgreSQL database
db.connect((err) => {
  if (err) {
    // If there is an error connecting to the database, log the error and exit the process
    console.error("Failed to connect to the database:", err);
    process.exit(1);
  } else {
    // If the connection is successful, log a success message
    console.log("Connected to the database");
  }
});

// Use body-parser middleware to parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

// Sample data for demonstration purposes
let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

// Define a route for the root URL ("/")
app.get("/", async (req, res) => {
  const date = req.query.date || new Date().toISOString().split('T')[0]; // Get the date from query parameters or use today's date

  try {
    // Query the database to get all items, ordered by ID in ascending order
    const result = await db.query("SELECT * FROM items WHERE date = $1 ORDER BY id ASC", [date]);
    items = result.rows; // Store the query result in the items array

    // Render the "index.ejs" template with the list of items
    res.render("index.ejs", {
      listTitle: "Today",
      listItems: items,
    });
  } catch (err) {
    // If there is an error, log it
    console.log(err);
  }
  //res is the short form for response and it is used to send a response back to the client
});

// Define a route to handle adding a new item
app.post("/add", async (req, res) => {
  const item = req.body.newItem; // Get the new item from the request body
  const date = req.body.date || new Date().toISOString().split('T')[0]; // Get the date from the request body or use today's date

  try {
    // Insert the new item into the database
    await db.query("INSERT INTO items (title, date) VALUES ($1, $2)", [item, date]);
    res.redirect("/"); // Redirect to the root URL
  } catch (err) {
    // If there is an error, log it
    console.log(err);
  }
});

// Define a route to handle editing an existing item
app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle; // Get the updated item title from the request body
  const id = req.body.updatedItemId; // Get the item ID from the request body
  const date = req.body.date || new Date().toISOString().split('T')[0]; // Get the date from the request body or use today's date

  try {
    // Update the item in the database
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/?date=" + date); // Redirect to the root URL with the specified date
  } catch (err) {
    // If there is an error, log it
    console.log(err);
  }
});

// Define a route to handle deleting an item
app.post("/delete", async (req, res) => {
  const id = req.body.deleteItemId; // Get the item ID to delete from the request body All this are done using body parsers parsing of data
  const date = req.body.date || new Date().toISOString().split('T')[0]; // Get the date from the request body or use today's date

  try {
    // Delete the item from the database
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/"); // Redirect to the root URL
  } catch (err) {
    // If there is an error, log it
    console.log(err);
  }
});

// Start the server and listen on the defined port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});