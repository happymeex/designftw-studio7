// Get references to DOM elements
export const dom = {
    tasksList: document.querySelector("#tasks_list"),
    taskTemplate: document.querySelector("#task_template"),
    doneCount: document.querySelector("#done_count"),
    totalCount: document.querySelector("#total_count"),
    clearButton: document.querySelector("#clear"),
};

// Initialize data. Do we have anything stored?
if (localStorage.tasks) {
    let tasks = JSON.parse(localStorage.tasks);
    for (let task of tasks) {
        addItem(task);
    }
} else {
    // Add one empty task to start with
    addItem();
}

dom.clearButton.addEventListener("click", clearCompleted);

dom.tasksList.addEventListener("keydown", (e) => {
    if (!e.target.matches("input.title")) {
        // We are only interested in key events on the text field
        return;
    }

    let li = e.target.closest("li");
    const previousSibling = li.previousElementSibling;

    if (e.key === "Enter" && !e.repeat) {
        addItem();
    } else if (
        e.key === "Backspace" &&
        li.querySelector(".title")?.value.length === 0 &&
        !e.repeat
    ) {
        li.querySelector(".delete").click();
        focusTask(previousSibling ?? dom.tasksList.firstElementChild);
        e.preventDefault(); // prevent data corruption
    } else if (e.key === "ArrowUp") {
        focusTask(previousSibling ?? dom.tasksList.firstElementChild);
    } else if (e.key === "ArrowDown") {
        focusTask(li.nextElementSibling ?? dom.tasksList.lastElementChild);
    }
});

dom.tasksList.addEventListener("click", (e) => {
    if (e.target.className === "delete") {
        const li = e.target.closest("li");
        const previousSibling = li.previousElementSibling;
        li.remove();
        focusTask(previousSibling ?? dom.tasksList.firstElementChild);
        updateCounts();
    }
});

// Store data when page is closed
globalThis.addEventListener("beforeunload", () => {
    localStorage.tasks = JSON.stringify(getData());
});

/**
 * Add a new item at the end of the todo list
 * @param {Object} data data for the item to be added
 */
export function addItem(data = { done: false, title: "" }) {
    dom.tasksList.insertAdjacentHTML("beforeend", dom.taskTemplate.innerHTML);

    let element = dom.tasksList.lastElementChild;

    element.querySelector(".title").value = data.title;
    element.addEventListener("input", () => {
        updateCounts();
    });

    let done = element.querySelector(".done");
    done.checked = data.done;

    updateCounts();
    focusTask(element);
}

/**
 * Delete all tasks that are marked as done
 */
export function clearCompleted() {
    const buttons = dom.tasksList.querySelectorAll(":has(:checked) > .delete");
    for (const elt of buttons) {
        elt.click();
    }
}

/**
 * Focus the title field of the specified task
 * @param {Node} element Reference to DOM element of the task to focus (or any of its descendants)
 */
export function focusTask(element) {
    element?.closest("li")?.querySelector("input.title").focus();
}

export function getData() {
    return Array.from(dom.tasksList.children).map((element) => ({
        title: element.querySelector(".title").value,
        done: element.querySelector(".done").checked,
    }));
}

function updateDoneCount() {
    dom.doneCount.textContent =
        dom.tasksList.querySelectorAll(".done:checked").length;
}

function updateTotalCount() {
    dom.totalCount.textContent = dom.tasksList.children.length;
}

// Update expressions etc when data changes
function updateCounts() {
    updateDoneCount();
    updateTotalCount();
}
