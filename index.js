const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = express();
dotenv.config();

// Importing mongodb model schemas
const TodoTask = require("./models/TodoTask");

app.use("/static", express.static("public"));

app.use(express.urlencoded({ extended: true }));

// Setting up connection to db
mongoose.connect(process.env.DB_CONNECT).then(() => {
  console.log("Connected to db!");
  app.listen(process.env.PORT || 3000, () => console.log("Server Up and running"));
});

// view engine configuration
app.set("view engine", "ejs");

// Post method
app.post("/", async (req, res) => {
  // Create a new TodoTask
  const todoTask = new TodoTask({
    content: req.body.content,
  });

  // Try to save the new TodoTask to MongoDB
  try {
    await todoTask.save();
    res.redirect("/");
  } catch (err) {
    res.redirect("/");
  }
});

// Get method
app.get("/", (req, res) => {
  // All tasks from mongodb are passed to todo.ejs to render
  TodoTask.find({}, (err, tasks) => {
    res.render("todo.ejs", { todoTasks: tasks });
  });
});

// Update method
app
  .route("/edit/:id")
  .get((req, res) => {
    const id = req.params.id;
    TodoTask.find({}, (err, tasks) => {
      // Render page with an update field
      res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
    });
  })
  .post((req, res) => {
    const id = req.params.id;

    // Update the task with new contents
    TodoTask.findByIdAndUpdate(id, { content: req.body.content }, (err) => {
      if (err) return res.send(500, err);
      res.redirect("/");
    });
  });

// Delete method
app.route("/remove/:id").get((req, res) => {
  const id = req.params.id;

  // Delete task based on ID
  TodoTask.findByIdAndRemove(id, (err) => {
    if (err) return res.send(500, err);
    res.redirect("/");
  });
});
