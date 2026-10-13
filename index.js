const inputName = document.getElementById('inputName');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('list');
const search = document.querySelector("#searchInput");
const clearAllBtn = document.getElementById("clearAllBtn");
const toggleAllBtn = document.getElementById("toggleAllBtn");
const totalCount = document.getElementById("totalCount");
const filterSelect = document.getElementById("filterSelect");

async function getTodos() {
    let response = await fetch("http://localhost:4142/todos");
    let todos = await response.json();
    renderTodos(todos);
  
}
function renderTodos(todos) {
  list.innerHTML = "";
  for (const todo of todos) {
    list.innerHTML += `
      <div class="items">
          <input onClick="onChecked(${todo.id})" class="task-checkbox" type="checkbox" style="margin-right: 8px;" ${todo.completed ? "checked" : ""}>
          <li class="task-text">
              ${todo.name}
          <span class="task-date">${todo.createdAt}</span>
          </li>
          <button onclick="editTask(${todo.id})" class="editBtn"><i class="fa-solid fa-pen-to-square" style="margin-right: 8px;"></i>Edit</button>
          <button onClick="deleteTask(${todo.id})" class="deleteBtn"><i class="fa-solid fa-trash" style="margin-right: 8px;"></i>Delete</button>
      </div>
    `;
  }

  if (todos.length > 0 && todos.every(todo => todo.completed)) {
    toggleAllBtn.textContent = "Set All Active";
  } else {
    toggleAllBtn.textContent = "Set All Completed";
  }
  
  if (totalCount) {
    totalCount.textContent = todos.length;
  }
}

async function addNewTask() {
  let todoname = inputName.value.trim();
  if (todoname !== "") {
    await fetch("http://localhost:4142/todos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name: todoname })
    });

    inputName.value = "";
    getTodos(); 
  }   
}

inputName.onkeydown = (e) => {
  if (e.keyCode === 13) {
    addNewTask();
  }
};

addBtn.onclick = () => {
  addNewTask();
};

search.addEventListener("input", async (eventt) => {
  let query = eventt.target.value;
  let response = await fetch(`http://localhost:4142/todos?search=${query}`);
  let todos = await response.json();
  renderTodos(todos);
});

async function onChecked(id) {
  let response = await fetch("http://localhost:4142/todos");
  let todos = await response.json();
  let todo = todos.find(t => t.id == id);
  if (!todo) return;

  await fetch(`http://localhost:4142/todos/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ completed: !todo.completed })
  });

  getTodos();
}

filterSelect.addEventListener("change", async (ev) => {
  let status = ev.target.value;
  let url = "http://localhost:4142/todos";
  
  if (status === "active") {
    url = "http://localhost:4142/todos?status=active";
  } else if (status === "completed") {
    url = "http://localhost:4142/todos?status=completed";
  }

  let response = await fetch(url);
  let todos = await response.json();
  renderTodos(todos);
});

async function deleteTask(id) {
  await fetch(`http://localhost:4142/todos/${id}`, {
    method: "DELETE"
  });
  getTodos();
}
async function editTask(id) {
  let response = await fetch("http://localhost:4142/todos");
  let todos = await response.json();
  let todoToEdit = todos.find(todo => todo.id === id);

  if (todoToEdit) {
    let newName = prompt("Vazifani tahrirlang:", todoToEdit.name);
    if (newName !== null && newName.trim() !== "") {
      await fetch(`http://localhost:4142/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: newName.trim() })
      });
      getTodos();
    }
  }
}

clearAllBtn.onclick = async () => {
  if (confirm("Rostdan ham barcha vazifalarni o'chirib tashlamoqchimisiz?")) {
    await fetch("http://localhost:4142/todos", {
      method: "DELETE"
    });
    getTodos();
  }
};
async function clearAllCompleted() {
  await fetch("http://localhost:4142/todos/completed", {
    method: "DELETE"
  });
  getTodos();
}

toggleAllBtn.onclick = async () => {
  await fetch("http://localhost:4142/todos/toggle-all", {
    method: "PUT"
  });
  getTodos();
};

getTodos();