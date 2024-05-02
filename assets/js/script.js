// Global Variables Needed
let taskList = JSON.parse(localStorage.getItem('tasks')) || [];

const taskDisplayEl = $('#task-display');
const taskFormEl = $('#task-form');
const taskTitleEl = $('#task-title');
const taskDueDateEl = $('#task-due-date');
const taskDescriptionEl = $('#task-description');
const todoCardEl = $('#todo-cards');
const inProgressCardEl = $('#in-progress-cards');
const doneCardEl = $('#done-cards');


// Generate A Secure Non-Sequential Random ID For Each Task
const generateTaskId = () => {
    return crypto.randomUUID();
}

// Create Task Card And Append Them To The Todo Lane
const createTaskCard = (task) => {
    const taskCard = $('<div>').addClass('card task-card draggable my-3').attr('data-task-id', task.id);
    const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
    const cardBody = $('<div>').addClass('card-body');
    const cardDescription = $('<p>').addClass('card-text').text(task.description);
    const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
    const cardDeleteBtn = $('<button>').addClass('btn btn-danger delete').text('Delete');
    const deleteFn = () => {
        handleDeleteTask(task.id);
    }
    cardDeleteBtn.on('click', deleteFn);

    if (task.dueDate && task.status !== 'done') {
        const now = dayjs();
        const taskDueDate = dayjs(task.dueDate, 'DD/MM/YYYY');

        if (now.isSame(taskDueDate, 'day')) {
            taskCard.addClass('bg-warning text-white');
        } else if (now.isAfter(taskDueDate)) {
            taskCard.addClass('bg-danger text-white');
            cardDeleteBtn.addClass('border-light');
        }
    }

    cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
    taskCard.append(cardHeader, cardBody);

    return taskCard;
}

// Render The Task List And Make Each Card Draggable
const renderTaskList = (tasks) => {
    todoCardEl.empty();
    inProgressCardEl.empty();
    doneCardEl.empty();

    for (let task of tasks) {
        if (task.status === 'to-do') {
            todoCardEl.append(createTaskCard(task));
        } else if (task.status === 'in-progress') {
            inProgressCardEl.append(createTaskCard(task));
        } else if (task.status === 'done') {
            doneCardEl.append(createTaskCard(task));
        }
    };

    $('.draggable').draggable({
        opacity: 0.7,
        zIndex: 100,
        helper: (e) => {
            const original = $(e.target).hasClass('ui-draggable')
                ? $(e.target)
                : $(e.target).closest('.ui-draggable');
            return original.clone().css({
                width: original.outerWidth(),
            });
        },
    });
}

// Handle Adding New Task And Store Them Into User's LocalStorage
const handleAddTask = (event) => {
    event.preventDefault();

    const taskItem = {
        name: taskTitleEl.val().trim(),
        dueDate: taskDueDateEl.val().trim(),
        description: taskDescriptionEl.val().trim(),
        id: generateTaskId(),
        status: 'to-do',
    }
    taskList.push(taskItem)

    localStorage.setItem('tasks', JSON.stringify(taskList));
    const taskModal = bootstrap.Modal.getInstance(document.getElementById('formModal'))
    taskModal.hide();
    renderTaskList(taskList);

    taskTitleEl.val('');
    taskDueDateEl.val('');
    taskDescriptionEl.val('');
}

taskFormEl.on('submit', handleAddTask);

// Handle User Deleting A Task And Updating LocalStorage
const handleDeleteTask = (taskId) => {
    taskList.forEach((task) => {
        if (task.id === taskId) {
            taskList.splice(taskList.indexOf(task), 1);
        }
    });

    localStorage.setItem('tasks', JSON.stringify(taskList));

    renderTaskList(taskList);
};

// Handle Moving Card To New Lane And Update LocalStorage
const handleDrop = (event, ui) => {

    const todoId = ui.draggable[0].dataset.taskId;
    const newStatus = event.target.id;

    for (let task of taskList) {
        if (task.id === todoId) {
            task.status = newStatus;
        }
    }
    localStorage.setItem('tasks', JSON.stringify(taskList));
    renderTaskList(taskList);
}

// Render Task List Upon Page Load, Make A Datepicker In Date Field, Make Lanes Accept The Draggable Cards
$(document).ready(() => {
    renderTaskList(taskList);

    $('#task-due-date').datepicker({
        changeMonth: true,
        changeYear: true,
    });

    $('.lane').droppable({
        accept: '.draggable',
        drop: handleDrop,
    });
});
