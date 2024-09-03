let tasksList = document.getElementsByClassName("tasks-list")[0];
let searchBar = document.getElementsByClassName("search-bar")[0];
let addBtn = document.getElementsByClassName("add-btn")[0];

const initialize = () => {
  fetch("https://dummyjson.com/todos")
    .then((response) => {
      return response.json();
    })
    .then((result) => {
      const tasksDeleted = localStorage.getItem("tasksDeleted");
      if (tasksDeleted) {
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
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });
};
initialize();

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
  localStorage.setItem(id, JSON.stringify(newItem));
});

//add new Task function
async function addNewTask() {
  const { value: newTaskTodo } = await Swal.fire({
    title: "Enter your Task Todo",
    input: "text",
    inputLabel: "Your Task Todo",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value) {
        return "You need to write something!";
      }
    },
  });
  let newTask = {
    id: generateUniqueId(),
    todo: newTaskTodo,
    completed: false,
    userId: 152,
  };
  console.log(newTask);
  await localStorage.setItem(newTask.id, JSON.stringify(newTask));
  initialize();
}

addBtn.addEventListener("click", addNewTask);

//delete button implementation
tasksList.addEventListener("click", (Event) => {
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
  let confirmed = confirm("Are you sure to delete this element", newItem.todo);
  if (confirmed) {
    localStorage.removeItem(id);
    tasksList.removeChild(parentLi);
    if (tasksList.childElementCount == 0) {
      console.log("there is no children");
      clearTasks();
    }
  } else console.log("deletion canceled");
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

//helper functions/////////////////////////////////////

function createLi(task) {
  let li = ` <li data-id=${task.id}>
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
}

// tasksList.addEventListener("click", (Event) => {
//   let liClicked;
//   if (Event.target.tagName !== "LI") {
//     liClicked = Event.target.closest("li");
//     if (!tasksList.contains(liClicked)) {
//       return;
//     }
//   } else {
//     liClicked = Event.target;
//   }

//   liClicked.firstChild();
// });
