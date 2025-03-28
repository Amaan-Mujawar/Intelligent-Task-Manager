function addManualTask() {
    let task = document.getElementById("task-input").value.trim();
    let dueDate = document.getElementById("due-date").value;
    let dueTime = document.getElementById("due-time").value;
    let priority = document.getElementById("priority").value;

    if (!task) {
        alert("Task cannot be empty!");
        return;
    }

    addTask(task, dueDate, dueTime, priority);
    document.getElementById("task-input").value = "";
}

function addTask(taskInput, dueDate, dueTime, priority) {
    let table = document.getElementById("task-table");
    let row = table.insertRow();

    row.innerHTML = `
        <td>${taskInput}</td>
        <td>${dueDate ? dueDate + (dueTime ? " at " + dueTime : "") : "No due date"}</td>
        <td>${priority.charAt(0).toUpperCase() + priority.slice(1)}</td>
        <td><button class="edit-btn" onclick="editTask(this)">Edit</button></td>
        <td><button class="delete-btn" onclick="deleteTask(this)">Delete</button></td>
        <td><button class="done-btn" onclick="moveToCompleted(this)">Done</button></td>
    `;

    row.classList.add(priority);
}

function moveToCompleted(button) {
    let row = button.parentElement.parentElement;
    let completedTable = document.getElementById("completed-task-table");

    let completedRow = completedTable.insertRow();
    completedRow.innerHTML = `
        <td>${row.cells[0].innerText}</td>
        <td>${row.cells[1].innerText}</td>
        <td>${row.cells[2].innerText}</td>
        <td><button class="delete-btn" onclick="deleteTask(this)">Delete</button></td>
    `;

    row.remove();
}

function deleteTask(button) {
    button.parentElement.parentElement.remove();
}

async function generateTasks() {
    let userInput = document.getElementById("task-input").value.trim();
    if (!userInput) return;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer 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",
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: "Generate exactly 10 task ideas based on user input. Provide them in JSON format: {\"tasks\": [\"meaningful task 1\", \"meaningful task 2\", ..., \"meaningful task 10\"]}." },
                { role: "user", content: `Generate 10 task suggestions based on this input: "${userInput}"` },
            ],
        })
    });

    const data = await response.json();
    let jsonResponse = data.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "").trim();

    try {
        let parsedData = JSON.parse(jsonResponse);
        if (parsedData.tasks) {
            displaySuggestedTasks(parsedData.tasks);
        } else {
            throw new Error("Invalid JSON Structure");
        }
    } catch (error) {
        console.error("Invalid AI Response:", error);
    }
}


function displaySuggestedTasks(tasks) {
    let container = document.getElementById("ai-container");
    container.innerHTML = "";

    tasks.forEach(taskText => {
        let div = document.createElement("div");
        div.classList.add("ai-task");

        div.innerHTML = `
            <p class="ai-task-text"><b>${taskText}</b></p>
            <input type="date" class="due-date">
            <input type="time" class="due-time">
            <select class="priority">
                <option value="low">Low</option>
                <option value="medium" selected>Medium</option>
                <option value="high">High</option>
            </select>
            <button onclick="addSuggestedTask(this)">✔ Add</button>
        `;

        container.appendChild(div);
    });
}

function addSuggestedTask(button) {
    let taskText = button.parentElement.querySelector(".ai-task-text").innerText;
    let dueDate = button.parentElement.querySelector(".due-date").value;
    let dueTime = button.parentElement.querySelector(".due-time").value;
    let priority = button.parentElement.querySelector(".priority").value;

    addTask(taskText, dueDate, dueTime, priority);
    button.parentElement.remove();
}
