let tasksList = document.getElementsByClassName("tasks-list")[0];
let searchBar = document.getElementsByClassName("search-bar")[0];
let addBtn = document.getElementsByClassName("add-btn")[0];
let modeBtn = document.querySelector(".mode-btn");
let tasksCount = document.querySelector(".tasks-count");

const initialize = () => {
  fetch("https://dummyjson.com/todos")
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      const tasksDeleted = localStorage.getItem("tasksDeleted");
      if (tasksDeleted) {
        tasksCount.innerHTML = "Total Tasks: 0";
        return;
      }
      let tasks = result.todos;

      const fromLocalStorage = localStorage.length === 0;

      tasksList.innerHTML = "";
      if (fromLocalStorage) {
        for (let task of tasks) {
          localStorage.setItem(task.id, JSON.stringify(task));
          createLi(task);
        }
      } else {
        Object.keys(localStorage).forEach((key) => {
          const task = JSON.parse(localStorage.getItem(key));
          createLi(task);
        });
      }
      tasksCount.innerHTML = "Total Tasks: " + localStorage.length;
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};
initialize();

//basic operations implementations
//mode btn
modeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  Array.from(modeBtn.children).forEach((mode) => {
    mode.style.display = mode.style.display == "none" ? "inline" : "none";
    console.log(mode);
  });
});

// event delegation

//checkbox task completion implementation
tasksList.addEventListener("change", (Event) => {
  let checkbox;
  let id;
  if (Event.target.tagName !== "INPUT") {
    return;
  } else {
    checkbox = Event.target;
    id = checkbox.parentElement.dataset.id;
  }
  let newItem = JSON.parse(localStorage.getItem(id));
  newItem.completed = checkbox.checked;
  checkbox.parentElement.style.textDecoration = checkbox.checked
    ? "line-through"
    : "none";

  localStorage.setItem(id, JSON.stringify(newItem));
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
  console.log(newTask);
  await localStorage.setItem(newTask.id, JSON.stringify(newTask));
  localStorage.removeItem("tasksDeleted");
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
tasksList.addEventListener("click", async (Event) => {
  let trash;
  let parentLi;
  let id;
  if (!Event.target.classList.contains("trash")) {
    return;
  } else {
    trash = Event.target;
    parentLi = trash.parentElement;
    id = trash.parentElement.dataset.id;
  }
  let newItem = JSON.parse(localStorage.getItem(id));
  const { value: confirmed } = await Swal.fire({
    title: "Delete alert",
    icon: "error",
    showCancelButton: true,
  });
  if (confirmed) {
    localStorage.removeItem(id);
    tasksList.removeChild(parentLi);
    if (localStorage.length == 0) {
      console.log("there is no children");
      clearTasks();
    }
  }
  tasksCount.innerHTML = "Total Tasks: " + localStorage.length;
});

//search implementation
searchBar.addEventListener("input", () => {
  clearSearchResult();
  let searchValue = searchBar.value.trim();
  if (searchValue === "") {
    return;
  }
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
tasksList.addEventListener("click", async (Event) => {
  let pen;
  let parentLi;
  let id;
  if (!Event.target.classList.contains("pen")) {
    return;
  } else {
    pen = Event.target;
    parentLi = pen.parentElement;
    id = pen.parentElement.dataset.id;
  }
  let newItem = JSON.parse(localStorage.getItem(id));

  const { value: edits } = await Swal.fire({
    title: "Edit your Task ",
    input: "text",
    inputLabel: "Today I will",
    inputValue: newItem.todo,
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
  newItem.todo = edits;
  localStorage.setItem(newItem.id, JSON.stringify(newItem));
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
    // Generate a random ID (modify this logic as needed)
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
// Function to clear all tasks from localStorage and set the flag
function clearTasks() {
  localStorage.clear(); // Remove tasks from localStorage
  localStorage.setItem("tasksDeleted", true); // Set a flag indicating tasks were deleted
  initialize();
}
