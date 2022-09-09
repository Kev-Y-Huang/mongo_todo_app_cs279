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
  app.listen(3000, () => console.log("Server Up and running"));
});

// view engine configuration
app.set("view engine", "ejs");

// Post method - Save the request as a todo task in mongodb
app.post("/", async (req, res) => {
  const todoTask = new TodoTask({
    content: req.body.content,
  });
  try {
    await todoTask.save();
    res.redirect("/");
  } catch (err) {
    res.redirect("/");
  }
});

// Get method - Pass in all tasks from mongodb to render using todo.ejs
app.get("/", (req, res) => {
  TodoTask.find({}, (err, tasks) => {
    res.render("todo.ejs", { todoTasks: tasks });
  });
});

// Update method - Render page with update field and the pass the updated content to the old task in mongodb
app
  .route("/edit/:id")
  .get((req, res) => {
    const id = req.params.id;
    TodoTask.find({}, (err, tasks) => {
      res.render("todoEdit.ejs", { todoTasks: tasks, idTask: id });
    });
  })
  .post((req, res) => {
    const id = req.params.id;
    TodoTask.findByIdAndUpdate(id, { content: req.body.content }, (err) => {
      if (err) return res.send(500, err);
      res.redirect("/");
    });
  });

// Delete method - Delete a task based on ID
app.route("/remove/:id").get((req, res) => {
  const id = req.params.id;
  TodoTask.findByIdAndRemove(id, (err) => {
    if (err) return res.send(500, err);
    res.redirect("/");
  });
});
