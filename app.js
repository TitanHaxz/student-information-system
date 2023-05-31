const nameInput = document.getElementById("name");
const surnameInput = document.getElementById("surname");
const ageInput = document.getElementById("age");
const emailInput = document.getElementById("email");
const studentNumberInput = document.getElementById("student-number");
const saveButton = document.getElementById("save-btn");
const tbody = document.getElementById("tbody");
const pagination = document.getElementById("pagination");

// add tooltip 
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// ID generator
const generateID = () => {
    let id = '';
    for (let i = 0; i < 6; i++) {
        let randomNumber = Math.floor(Math.random() * 10);
        id += randomNumber;
    };
    return id;
};

const showBootstrapToast = (message, strongMessage, bg) => {
    const toastContainer = document.createElement("div");
    toastContainer.classList.add("position-fixed", "top-0", "start-50", "translate-middle-x", "p-3");

    const toast = document.createElement("div");
    toast.classList.add("toast", "text-white");
    toast.classList.add(bg);
    toast.setAttribute("role", "alert");
    toast.setAttribute("aria-live", "assertive");
    toast.setAttribute("aria-atomic", "true");

    const toastHeader = document.createElement("div");
    toastHeader.classList.add("toast-header");

    const strong = document.createElement("strong");
    strong.classList.add("me-auto");
    strong.innerHTML = strongMessage;

    const closeButton = document.createElement("button");
    closeButton.classList.add("btn-close");
    closeButton.setAttribute("type", "button");
    closeButton.setAttribute("data-bs-dismiss", "toast");
    closeButton.setAttribute("aria-label", "Close");

    const toastBody = document.createElement("div");
    toastBody.classList.add("toast-body");
    toastBody.textContent = message;

    toastHeader.appendChild(strong);
    toastHeader.appendChild(closeButton);

    toast.appendChild(toastHeader);
    toast.appendChild(toastBody);

    toastContainer.appendChild(toast);
    document.body.appendChild(toastContainer);

    const toastInstance = new bootstrap.Toast(toast);
    toastInstance.show();
};

let students = [];
// save student information
saveButton.addEventListener("click", () => {
    const inputs = [nameInput, surnameInput, ageInput, emailInput, studentNumberInput];

    if (inputs.some(input => input.value.trim() === "")) {
        showBootstrapToast("Formu boşluk olmadan doldurun.",
            `<i class="bi bi-emoji-frown-fill text-danger"></i>`,
            "bg-danger");
        return;
    };

    if (!emailInput.value.includes("@")) {
        showBootstrapToast(`E-postada "@" sembolü kullanılmalıdır.`,
            `<i class="bi bi-emoji-frown-fill text-danger"></i>`,
            "bg-danger");
        return;
    };

    const isDuplicate = students.some(student => student.studentNumber === studentNumberInput.value);
    if (isDuplicate) {
        showBootstrapToast("Bu öğrenci numarası zaten sisteme eklenmiş.",
            `<i class="bi bi-emoji-frown-fill text-danger"></i>`,
            "bg-danger");
        return;
    }

    const student = {
        ID: generateID(),
        name: nameInput.value,
        surname: surnameInput.value,
        age: ageInput.value,
        email: emailInput.value,
        studentNumber: studentNumberInput.value
    };

    students.unshift(student);

    renderTable();

    inputs.forEach(input => {
        input.value = "";
    });

    saveDataToLocalStorage();
    showBootstrapToast("Öğrenci bilgileri başarıyla kaydedildi!",
        `<i class="bi bi-check-circle-fill text-success"></i>`,
        "bg-success");
});

const handleInputKeydown = (event, inputElement, errorMessage) => {
    const key = event.key;
    const isNumber = /^\d$/.test(key);
    const isAllow = key === "Backspace" || key === "Delete" || key === "Tab" || (event.ctrlKey && key === "v");
    if (!isNumber && !isAllow) {
        event.preventDefault();
        inputElement.setAttribute("data-bs-original-title", errorMessage);
        inputElement.classList.add("is-invalid");
    } else {
        inputElement.removeAttribute("data-bs-original-title");
        inputElement.classList.remove("is-invalid");
    }
};

ageInput.addEventListener("keydown", (event) => {
    handleInputKeydown(event, ageInput, "Lütfen geçerli bir yaş girin.");
});

studentNumberInput.addEventListener("keydown", (event) => {
    handleInputKeydown(event, studentNumberInput, "Lütfen geçerli bir öğrenci numarası girin.");
});

const saveDataToLocalStorage = () => {
    localStorage.setItem("students", JSON.stringify(students));
};

const itemsPerPage = 20;
let currentPage = 1;

const renderTable = () => {
    tbody.innerHTML = "";
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = students.slice(startIndex, endIndex);

    currentStudents.forEach((student, index) => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", student.ID);

        if (index % 2 !== 0) {
            tr.style.backgroundColor = "#eff4f3";
        }

        Object.values(student).forEach((value, columnIndex) => {
            if (columnIndex === 0) {
                return;
            }

            const td = document.createElement("td");
            td.textContent = value;
            tr.appendChild(td);
        });

        const actionsTd = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.classList.add("btn", "btn-warning", "me-1");
        editButton.innerHTML = '<i class="bi bi-pencil-square text-white"></i>';

        const deleteButton = document.createElement("button");
        deleteButton.classList.add("btn", "btn-danger");
        deleteButton.innerHTML = '<i class="bi bi-trash"></i>';

        deleteButton.addEventListener("click", () => {
            const rowIndex = Array.from(tbody.getElementsByTagName("tr")).indexOf(tr);
            students.splice(rowIndex + startIndex, 1);
            tr.remove();

            setTimeout(() => {
                showBootstrapToast("Öğrenci Bilgisi başarıyla silindi.",
                    `<i class="bi bi-check-circle-fill text-success"></i>`,
                    "bg-success");
            }, 200);

            saveDataToLocalStorage();
        });

        actionsTd.appendChild(editButton);
        actionsTd.appendChild(deleteButton);

        tr.appendChild(actionsTd);

        tbody.appendChild(tr);
    });

    addEditEventListeners();
    renderPagination();
};

const retrieveDataFromLocalStorage = () => {
    const storedData = localStorage.getItem("students");
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        students.push(...parsedData);
        renderTable();
    }
};

window.addEventListener("load", () => {
    retrieveDataFromLocalStorage();
});

// edit button
const addEditEventListeners = () => {
    const editButtons = document.getElementsByClassName("btn-warning");

    Array.from(editButtons).forEach((editButton) => {
        const tr = editButton.parentElement.parentElement;
        const tdList = Array.from(tr.querySelectorAll("td:not(:last-child)"));
        const studentID = tr.getAttribute("data-id");
        const student = students.find(student => student.ID === studentID);

        const makeEditable = () => {
            tdList.forEach((td) => {
                const text = td.textContent;
                td.innerHTML = `<input type="text" class="form-control" value="${text}">`;
            });

            editButton.removeEventListener("click", makeEditable);
            editButton.addEventListener("click", saveChanges);
            editButton.classList.remove("btn-warning");
            editButton.classList.add("btn-success");
            editButton.innerHTML = '<i class="bi bi-check-square"></i>';
        };

        const saveChanges = () => {
            const inputs = Array.from(tr.querySelectorAll("input"));

            if (!validateInputs(inputs)) {
                return;
            }

            inputs.forEach((input, index) => {
                const value = input.value;
                tdList[index].textContent = value;
                student[Object.keys(student)[index + 1]] = value;
            });

            editButton.removeEventListener("click", saveChanges);
            editButton.addEventListener("click", makeEditable);
            editButton.classList.remove("btn-success");
            editButton.classList.add("btn-warning");
            editButton.innerHTML = '<i class="bi bi-pencil-square text-white"></i>';

            saveDataToLocalStorage();
            showBootstrapToast("Öğrenci bilgileri başarıyla güncellendi!",
                `<i class="bi bi-check-circle-fill text-success"></i>`,
                "bg-success");
        };

        const validateInputs = (inputs) => {
            let isValid = true;

            inputs.forEach((input) => {
                if (input.value.trim() === "") {
                    showBootstrapToast("Formu boşluk olmadan doldurun.",
                        `<i class="bi bi-emoji-frown-fill text-danger"></i>`,
                        "bg-danger");
                    isValid = false;
                }
            });

            const ageValue = inputs[2].value;
            if (!/^\d+$/.test(ageValue)) {
                showBootstrapToast("Lütfen geçerli bir yaş girin.",
                    `<i class="bi bi-emoji-frown-fill text-danger"></i>`,
                    "bg-danger");
                isValid = false;
            }

            const studentNumberValue = inputs[4].value;
            if (!/^\d+$/.test(studentNumberValue)) {
                showBootstrapToast("Lütfen geçerli bir öğrenci numarası girin.",
                    `<i class="bi bi-emoji-frown-fill text-danger"></i>`,
                    "bg-danger");
                isValid = false;
            }

            const emailValue = inputs[3].value;
            if (!emailValue.includes("@")) {
                showBootstrapToast(`E-postada "@" sembolü kullanılmalıdır.`,
                    `<i class="bi bi-emoji-frown-fill text-danger"></i>`,
                    "bg-danger");
                isValid = false;
            }

            return isValid;
        };

        editButton.addEventListener("click", makeEditable);
    });
};

const renderPagination = () => {
    pagination.innerHTML = "";

    const pageCount = Math.ceil(students.length / itemsPerPage);

    for (let i = 1; i <= pageCount; i++) {
        const li = document.createElement("li");
        li.classList.add("page-item");
        const button = document.createElement("button");
        button.classList.add("page-link");
        button.textContent = i;
        button.addEventListener("click", () => {
            currentPage = i;
            renderTable();
        });
        li.appendChild(button);
        pagination.appendChild(li);
    }
};

// ------------------- sorting ----------------- //

// name, surname and email sorting
const addSortingEventListener = (headerElement, columnIndex, sortingState, dataType) => {
    headerElement.addEventListener("click", () => {
        const rows = Array.from(tbody.getElementsByTagName("tr"));

        rows.sort((a, b) => {
            const valueA = getValueFromColumn(a, columnIndex, dataType);
            const valueB = getValueFromColumn(b, columnIndex, dataType);

            if (valueA === valueB) {
                return 0;
            }

            if (sortingState) {
                return valueA > valueB ? -1 : 1;
            } else {
                return valueA > valueB ? 1 : -1;
            }
        });

        rows.forEach((row) => row.remove());
        rows.forEach((row) => tbody.appendChild(row));

        sortingState = !sortingState;
    });
};

const getValueFromColumn = (row, columnIndex, dataType) => {
    const value = row.getElementsByTagName("td")[columnIndex].textContent;
    if (dataType === "numeric") {
        return parseInt(value);
    }
    return value.toLowerCase();
};

let nameSorting, surnameSorting, ageSorting, emailSorting, studentNumberSorting;
nameSorting = surnameSorting = ageSorting = emailSorting = studentNumberSorting = false;

const headers = [
    { element: document.getElementById("name-th"), sortingState: nameSorting, dataType: "string", columnIndex: 0 },
    { element: document.getElementById("surname-th"), sortingState: surnameSorting, dataType: "string", columnIndex: 1 },
    { element: document.getElementById("age-th"), sortingState: ageSorting, dataType: "numeric", columnIndex: 2 },
    { element: document.getElementById("email-th"), sortingState: emailSorting, dataType: "string", columnIndex: 3 },
    { element: document.getElementById("student-number-th"), sortingState: studentNumberSorting, dataType: "string", columnIndex: 4 }
];

headers.forEach(header => {
    addSortingEventListener(header.element, header.columnIndex, header.sortingState, header.dataType);
});