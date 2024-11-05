// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks")) || [];
let nextId = JSON.parse(localStorage.getItem("nextId")) || 1;

// Function to generate a unique task id
function generateTaskId() {
  return nextId++;
}

// Function to create a task card
function createTaskCard(task) {
  const { id, title, description, deadline, status } = task;
  const taskCard = $(`
        <div class="card task-card mb-3" data-id="${id}" data-status="${status}">
            <div class="card-body">
                <h5 class="card-title">${title}</h5>
                <p class="card-text">${description}</p>
                <p class="card-text"><strong>Deadline:</strong> ${dayjs(
                  deadline
                ).format("MM-DD-YYYY")}</p>
                <button class="btn btn-danger btn-sm delete-btn"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `);

  // Color rendering based on deadline
  if (deadline && status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(deadline);
    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-dark"); // Yellow for nearing deadline
    } else if (now.isAfter(taskDueDate)) {
      taskCard.find(".card-body").addClass("bg-danger text-white"); // Red for overdue
    }
  }
  return taskCard;
}

// Function to render the task list and make cards draggable
function renderTaskList() {
  $("#todo-cards, #in-progress-cards, #done-cards").empty(); // Clear existing cards
  taskList.forEach((task) => {
    const taskCard = createTaskCard(task);
    $(`#${task.status}-cards`).append(taskCard); // Append to the correct lane
  });

  // Make task cards draggable
  $(".task-card").draggable({
    revert: "invalid",
    cursor: "move",
    helper: "clone",
  });
}

// Function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault(); // Prevent default form submission

  const title = $("#title").val().trim();
  const description = $("#description").val().trim();
  const deadline = $("#deadline").val();

  if (title && description && deadline) {
    const newTask = {
      id: generateTaskId(), // Generate unique ID
      title,
      description,
      deadline,
      status: "todo", // Default status
    };

    taskList.push(newTask); // Add new task to the list
    localStorage.setItem("tasks", JSON.stringify(taskList));
    localStorage.setItem("nextId", nextId);

    $("#formModal").modal("hide"); // Hide modal
    $("#addTaskForm")[0].reset(); // Reset form fields
    renderTaskList(); // Update the task list
  } else {
    alert("Please fill out all fields."); // Alert if fields are missing
  }
}

// Function to handle deleting a task
function handleDeleteTask(event) {
  const taskId = $(this).closest(".task-card").data("id");
  console.log("TASK ID: ", taskId);
  taskList = taskList.filter((task) => task.id !== taskId); // Remove task from list
  localStorage.setItem("tasks", JSON.stringify(taskList));
  localStorage.setItem("nextId", nextId);
  renderTaskList();
}

// Function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  const taskId = ui.draggable.data("id");
  const newStatus = $(this).attr("id"); // Get new status from lane ID

  const taskIndex = taskList.findIndex((task) => task.id === taskId);
  if (taskIndex !== -1) {
    // Ensure task exists
    taskList[taskIndex].status = newStatus; // Update task status
    localStorage.setItem("tasks", JSON.stringify(taskList)); // Update localStorage
    renderTaskList(); // Update the task list
  }
}

// On page load, render the task list and set up event listeners
$(document).ready(function () {
  renderTaskList(); // Render tasks on load

  // Focus on title field when modal is shown
  $("#formModal").on("shown.bs.modal", function () {
    $("#title").focus();
  });

  // Bind event listeners
  $("#addTaskForm").on("submit", handleAddTask); // Handle adding task
  $(document).on("click", ".delete-btn", handleDeleteTask); // Handle deleting task

  // Make lanes droppable
  $(".lane").droppable({
    accept: ".task-card",
    drop: handleDrop, // Handle dropping task
  });

  // Initialize date picker
  $("#deadline").datepicker({
    dateFormat: "yy-mm-dd",
  });
});