const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskDate = document.getElementById("taskDate");
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const emptyMessage = document.getElementById("emptyMessage");

let tasks = JSON.parse(localStorage.getItem("sadyaTasks") || "[]");
let currentFilter = "all";

function saveTasks() {
    localStorage.setItem("sadyaTasks", JSON.stringify(tasks));
}

function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const progress = total ? Math.round((completed / total) * 100) : 0;

    document.getElementById("totalTasks").textContent = total;
    document.getElementById("completedTasks").textContent = completed;
    document.getElementById("pendingTasks").textContent = pending;
    document.getElementById("progressText").textContent = progress + "%";
    document.getElementById("progressBar").style.width = progress + "%";
}

function createButton(text, classes, action) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = classes;
    button.addEventListener("click", action);
    return button;
}

function renderTasks() {
    taskList.replaceChildren();

    const query = searchInput.value.trim().toLowerCase();

    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(query);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "completed" && task.completed) ||
            (currentFilter === "pending" && !task.completed);

        return matchesSearch && matchesFilter;
    });

    emptyMessage.classList.toggle("hidden", filteredTasks.length > 0);

    filteredTasks.forEach(task => {
        const card = document.createElement("div");
        card.className =
            "flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 p-4 transition hover:border-blue-200 hover:bg-blue-50";

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = task.completed;
        checkbox.className = "h-5 w-5 cursor-pointer accent-blue-600";

        checkbox.addEventListener("change", () => {
            task.completed = checkbox.checked;
            saveTasks();
            renderTasks();
        });

        const details = document.createElement("div");
        details.className = "min-w-0 flex-1";

        const title = document.createElement("p");
        title.textContent = task.title;
        title.className = task.completed
            ? "break-words font-semibold text-slate-400 line-through"
            : "break-words font-semibold text-slate-800";

        const date = document.createElement("p");
        date.className = "mt-1 text-xs text-slate-400";
        date.textContent = task.date
            ? "📅 Due: " + task.date
            : "No due date";

        details.append(title, date);

        const editButton = createButton(
            "✏️ Edit",
            "rounded-lg bg-amber-100 px-3 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-200",
            () => {
                const newTitle = prompt("Edit your task:", task.title);

                if (newTitle === null || !newTitle.trim()) return;

                task.title = newTitle.trim();
                saveTasks();
                renderTasks();
            }
        );

        const deleteButton = createButton(
            "🗑️ Delete",
            "rounded-lg bg-red-100 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-200",
            () => {
                if (!confirm("Are you sure you want to delete this task?")) return;

                tasks = tasks.filter(item => item.id !== task.id);
                saveTasks();
                renderTasks();
            }
        );

        card.append(checkbox, details, editButton, deleteButton);
        taskList.appendChild(card);
    });

    updateStats();
}

taskForm.addEventListener("submit", event => {
    event.preventDefault();

    const title = taskInput.value.trim();

    if (!title) return;

    tasks.push({
        id: Date.now().toString() + Math.random().toString(16).slice(2),
        title,
        date: taskDate.value,
        completed: false
    });

    saveTasks();
    taskForm.reset();
    renderTasks();
    taskInput.focus();
});

searchInput.addEventListener("input", renderTasks);

document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", () => {
        currentFilter = button.dataset.filter;

        document.querySelectorAll(".filter-btn").forEach(btn => {
            btn.className =
                "filter-btn rounded-lg px-4 py-2 text-sm font-semibold " +
                (btn === button
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200");
        });

        renderTasks();
    });
});

renderTasks();