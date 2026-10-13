import express from "express"
import { join } from "path"
import { readFileSync, writeFileSync } from "fs"
import cors from "cors"

const app = express();
const PORT = 4142; 
app.use(cors())

app.use(express.json());

let todosFilePath = join(process.cwd(), "db", "todos.json");

function readTodos() {
    let data = readFileSync(todosFilePath, "utf-8");
    return JSON.parse(data);
}

function writeTodos(todos) {
    writeFileSync(todosFilePath, JSON.stringify(todos, null, 4));
}

app.get("/todos", (req, res) => {
    let todos = readTodos();
    let { search, status } = req.query;

    if (search) {
        todos = todos.filter(todo => todo.name.toLowerCase().includes(search.toLowerCase()));
    }

    if (status === "active") {
        todos = todos.filter(todo => todo.completed === false);
    } else if (status === "completed") {
        todos = todos.filter(todo => todo.completed === true);
    }

    res.send(todos);
});

app.post("/todos", (req, res) => {
    let { name, completed, createdAt } = req.body;

    let todos = readTodos();

    let maxId = 0;
    for (let i = 0; i < todos.length; i++) {
        if (todos[i].id > maxId) {
            maxId = todos[i].id;
        }
    }

    let newTodo = {
        id: maxId + 1,
        name: name || "",
        completed: completed !== undefined ? completed : false,
        createdAt: createdAt || new Date().toLocaleString()
    };

    todos.push(newTodo);
    writeTodos(todos);

    res.status(201).send({
        status: 201,
        message: "user created!",
        data: newTodo
    });
});

app.put("/todos/toggle-all", (req, res) => {
    let todos = readTodos();

    let allCompleted = todos.every(todo => todo.completed);
    for (let i = 0; i < todos.length; i++) {
        todos[i].completed = !allCompleted;
    }

    writeTodos(todos);
    res.send(todos);
});

app.delete("/todos/completed", (req, res) => {
    let todos = readTodos();
    let remaining = todos.filter(todo => todo.completed === false);

    writeTodos(remaining);
    res.send(remaining);
});

app.delete("/todos", (req, res) => {
    writeTodos([]);
    res.send([]);
});

app.put("/todos/:id", (req, res) => {
    let id = Number(req.params.id);
    let todos = readTodos();

    let found = null;
    for (let i = 0; i < todos.length; i++) {
        if (todos[i].id === id) {
            found = todos[i];
            if (req.body.name !== undefined) {
                found.name = req.body.name;
            }
            if (req.body.completed !== undefined) {
                found.completed = req.body.completed;
            }
        }
    }

    if (!found) {
        return res.status(404).send("Bunday id li todo topilmadi");
    }

    writeTodos(todos);
    res.send(found);
});

app.delete("/todos/:id", (req, res) => {
    let id = Number(req.params.id);
    let todos = readTodos();
    let remaining = todos.filter(todo => todo.id !== id);

    writeTodos(remaining);
    res.send(remaining);
});

app.listen(PORT, () => console.log(`Server is running...`));