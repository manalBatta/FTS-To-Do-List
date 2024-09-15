let tasksList = document.getElementsByClassName("tasks-list")[0];
let searchBar = document.getElementsByClassName("search-bar")[0];
let addBtn = document.getElementsByClassName("add-btn")[0];
let modeBtn = document.querySelector(".mode-btn");
let tasksCount = document.querySelector(".tasks-count");
const todoIdAtLocalStorage = "123";

const initialize = async () => {
  tasksList.innerHTML = "";
  if (localStorage.getItem(todoIdAtLocalStorage) !== null) {
    const todoListFromLocalStorage = localStorage.getItem(todoIdAtLocalStorage);
    tasks = JSON.parse(todoListFromLocalStorage);
  } else {
    try {
      const response = await fetch("https://dummyjson.com/todos");
      const result = await response.json();
      tasks = result.todos;
      localStorage.setItem(todoIdAtLocalStorage, JSON.stringify(tasks));
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      return;
    }
  }
  for (let task of tasks) {
    createLi(task);
  }
  tasksCount.innerHTML = "Total Tasks: " + tasks.length;
};
initialize();

//basic operations implementations
//mode btn
modeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  Array.from(modeBtn.children).forEach((mode) => {
    mode.style.display = mode.style.display == "none" ? "inline" : "none";
  });
});

// event delegation

//checkbox task completion implementation
tasksList.addEventListener("change", (event) => {
  if (event.target.tagName !== "INPUT") return;
  const checkbox = event.target;
  const { id } = checkbox.parentElement.dataset;
  checkbox.parentElement.style.textDecoration = checkbox.checked
    ? "line-through"
    : "none";
  const tasks = JSON.parse(localStorage.getItem(todoIdAtLocalStorage));
  const checkedTask = tasks.find((task) => task.id == id);
  checkedTask.completed = checkbox.checked;
  localStorage.setItem(
    todoIdAtLocalStorage,
    JSON.stringify([...tasks, checkedTask])
  );
});

//add new Task function
async function addNewTask() {
  const { value: newTaskTodo } = await Swal.fire({
    title: "Enter your Task Todo",
    input: "text",
    inputLabel: "Today I will",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
  });
  if (newTaskTodo === undefined) {
    return;
  }
  let newTask = {
    id: generateUniqueId(),
    todo: newTaskTodo,
    completed: false,
    userId: 152,
  };
  const tasks = JSON.parse(localStorage.getItem(todoIdAtLocalStorage));
  tasks.unshift(newTask);
  await localStorage.setItem(todoIdAtLocalStorage, JSON.stringify(tasks));
  fetch("https://dummyjson.com/todos", {
    method: "POST",
    body: JSON.stringify(newTask),
    headers: {
      "Content-type": "application/json; charset=UTF-8",
    },
  });

  initialize();
}
addBtn.addEventListener("click", addNewTask);

//delete button implementation
tasksList.addEventListener("click", async (event) => {
  //change the Event to event
  if (!event.target.classList.contains("trash")) return;

  const trash = event.target;
  const parentLi = trash.parentElement;
  const idToDelete = trash.parentElement.dataset.id;
  const { value: confirmed } = await Swal.fire({
    title: "Delete alert",
    icon: "error",
    showCancelButton: true,
  });
  if (confirmed) {
    const tasks = JSON.parse(localStorage.getItem(todoIdAtLocalStorage));
    const updatedTasks = tasks.filter((task) => task.id != idToDelete);
    localStorage.setItem(todoIdAtLocalStorage, JSON.stringify(updatedTasks));
    tasksList.removeChild(parentLi);
    tasksCount.innerHTML = "Total Tasks: " + updatedTasks.length;
    if (updatedTasks.length == 0) {
      clearTasks();
    }
  }
});

//search implementation
searchBar.addEventListener("input", () => {
  let searchValue = searchBar.value.trim();

  if (searchValue === "") return;
  clearSearchResult();

  for (let li of tasksList.children) {
    const taskVal = li.textContent.trim().toLowerCase();
    if (taskVal.includes(searchValue.toLowerCase())) {
      li.classList.add("search-result");
    } else {
      li.hidden = true;
    }
  }
});

//edit task implementation
tasksList.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("pen")) return;
  const idToEdit = event.target.parentElement.dataset.id;
  const newItem = JSON.parse(localStorage.getItem(idToEdit));
  const tasks = JSON.parse(localStorage.getItem(todoIdAtLocalStorage));
  const editedTask = tasks.find((task) => task.id == idToEdit);

  const { value: edits } = await Swal.fire({
    title: "Edit your Task ",
    input: "text",
    inputLabel: "Today I will",
    inputValue: editedTask.todo,
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
  });
  if (edits === undefined) {
    return;
  }
  editedTask.todo = edits;
  localStorage.setItem(
    todoIdAtLocalStorage,
    JSON.stringify([...tasks, editedTask])
  );

  initialize();
});
//helper functions/////////////////////////////////////
function createLi(task) {
  let li = ` <li data-id=${task.id} style="text-decoration:${
    task.completed ? "line-through" : "none"
  }">
  <input type="checkbox" class="checkbox-done" ${
    task.completed ? "checked" : ""
  }/>
  <span>${task.todo} </span>
  <i class="fa-regular fa-trash-can trash" style="color: #d4d4d4"></i
  ><i class="fa-solid fa-pencil pen" style="color: #d4d4d4"></i>
  </li>`;
  tasksList.innerHTML += li;
}
// Function to generate a unique ID
function generateUniqueId() {
  let newId;
  do {
    newId = Math.floor(Math.random() * 10000);
  } while (
    Array.from(tasksList.children).some((task) => task.dataset.id === newId)
  );

  return newId;
}

function clearSearchResult() {
  for (let li of tasksList.children) {
    li.classList.remove("search-result"); // Show all tasks
    li.hidden = false;
  }
}
