const nameInput = document.getElementById("name");
const surnameInput = document.getElementById("surname");
const ageInput = document.getElementById("age");
const emailInput = document.getElementById("email");
const studentNumberInput = document.getElementById("student-number");
const saveButton = document.getElementById("save-btn");
const tbody = document.getElementById("tbody");
const pagination = document.getElementById("pagination");

const itemsPerPage = 20;
let currentPage = 1;
let students = [];

// add tooltip 
const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

// ID generator
const generateID = () => {
    let id = '';
    for (let i = 0; i < 6; i++) {
        let randomNumber = Math.floor(Math.random() * 10);
        id += randomNumber;
    }
    return id;
}

const retrieveDataFromLocalStorage = () => {
    const storedData = localStorage.getItem("students");
    if (storedData) {
        const parsedData = JSON.parse(storedData);
        students.push(...parsedData);
        renderTable();
    }
};

const saveDataToLocalStorage = () => {
    localStorage.setItem("students", JSON.stringify(students));
};

const renderTable = () => {
    tbody.innerHTML = "";
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentStudents = students.slice(startIndex, endIndex);

    currentStudents.forEach((student) => {

        const tr = document.createElement("tr");
        const rows = Array.from(tbody.getElementsByTagName("tr"));

        rows.forEach((row, index) => {
            if (index % 2 !== 0) {
                row.style.backgroundColor = "#eff4f3";
            }
        });

        Object.values(student).forEach((value, index) => {
            if (index === 0) {
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
                alert("Öğrenci Bilgisi başarıyla silindi.");
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

// edit button
const addEditEventListeners = () => {
    const editButtons = document.getElementsByClassName("btn-warning");

    Array.from(editButtons).forEach((editButton, index) => {
        const tr = editButton.parentElement.parentElement;
        const tdList = tr.querySelectorAll("td:not(:last-child)");
        const student = students[index];

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
            const inputs = tr.querySelectorAll("input");

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
            alert("Öğrenci bilgileri başarıyla güncellendi!");
        };

        const validateInputs = (inputs) => {
            let isValid = true;

            inputs.forEach((input) => {
                if (input.value === "") {
                    alert("Formu boşluk olmadan doldurun.");
                    isValid = false;
                }
            });

            const ageValue = inputs[2].value;
            if (!/^\d+$/.test(ageValue)) {
                alert("Lütfen geçerli bir yaş girin.");
                isValid = false;
            }

            const studentNumberValue = inputs[4].value;
            if (!/^\d+$/.test(studentNumberValue)) {
                alert("Lütfen geçerli bir öğrenci numarası girin.");
                isValid = false;
            }

            const emailValue = inputs[3].value;
            if (!emailValue.includes("@")) {
                alert(`E-postada "@" sembolü kullanılmalıdır.`);
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

// save student information
saveButton.addEventListener("click", () => {
    const inputs = [nameInput, surnameInput, ageInput, emailInput, studentNumberInput];

    if (inputs.some(input => input.value === "")) {
        alert("Formu boşluk olmadan doldurun.");
        return;
    }

    if (!emailInput.value.includes("@")) {
        alert(`E-postada "@" sembolü kullanılmalıdır.`);
        return;
    }

    const isDuplicate = students.some(student => student.studentNumber === studentNumberInput.value);
    if (isDuplicate) {
        alert("Bu öğrenci numarası zaten sisteme eklenmiş.");
        return;
    }

    const student = {
        ID: generateID(),
        name: nameInput.value.trim(),
        surname: surnameInput.value.trim(),
        age: ageInput.value.trim(),
        email: emailInput.value.trim(),
        studentNumber: studentNumberInput.value.trim()
    };

    students.unshift(student);

    renderTable();

    [nameInput, surnameInput, ageInput, emailInput, studentNumberInput].forEach(input => {
        input.value = "";
    });

    saveDataToLocalStorage();
    alert("Öğrenci bilgileri başarıyla kaydedildi!");
});

window.addEventListener("load", () => {
    retrieveDataFromLocalStorage();
});

ageInput.addEventListener("keydown", (event) => {
    const key = event.key;
    const isNumber = /^\d$/.test(key);
    const isDeletion = key === "Backspace" || key === "Delete" || key === "Tab";
    if (!isNumber && !isDeletion) {
        event.preventDefault();
        ageInput.setAttribute("data-bs-original-title", "Lütfen geçerli bir yaş girin.");
        ageInput.classList.add("is-invalid");
    } else {
        ageInput.removeAttribute("data-bs-original-title");
        ageInput.classList.remove("is-invalid");
    }
});

studentNumberInput.addEventListener("keydown", (event) => {
    const key = event.key;
    const isNumber = /^\d$/.test(key);
    const isDeletion = key === "Backspace" || key === "Delete" || key === "Tab" || (event.ctrlKey && key === "v");
    if (!isNumber && !isDeletion) {
        event.preventDefault();
        studentNumberInput.setAttribute("data-bs-original-title", "Lütfen geçerli bir öğrenci numarası girin.");
        studentNumberInput.classList.add("is-invalid");
    } else {
        studentNumberInput.removeAttribute("data-bs-original-title");
        studentNumberInput.classList.remove("is-invalid");
    }
});

// ------------------- sorting ----------------- //

// name sorting
let nameSorting = false;
const nameTh = document.getElementById("name-th");
nameTh.addEventListener("click", () => {
    const rows = Array.from(tbody.getElementsByTagName("tr"));

    rows.sort((a, b) => {
        const nameA = a.getElementsByTagName("td")[0].textContent.toLowerCase();
        const nameB = b.getElementsByTagName("td")[0].textContent.toLowerCase();
        if (nameSorting) {
            return nameB.localeCompare(nameA);
        } else {
            return nameA.localeCompare(nameB);
        }
    });

    rows.forEach((row) => row.remove());
    rows.forEach((row) => tbody.appendChild(row));

    nameSorting = !nameSorting;
});

// surname sorting
let surnameSorting = false;
const surnameTh = document.getElementById("surname-th");
surnameTh.addEventListener("click", () => {
    const rows = Array.from(tbody.getElementsByTagName("tr"));

    rows.sort((a, b) => {
        const surnameA = a.getElementsByTagName("td")[1].textContent.toLowerCase();
        const surnameB = b.getElementsByTagName("td")[1].textContent.toLowerCase();
        if (surnameSorting) {
            return surnameB.localeCompare(surnameA);
        } else {
            return surnameA.localeCompare(surnameB);
        }
    });

    rows.forEach((row) => row.remove());
    rows.forEach((row) => tbody.appendChild(row));

    surnameSorting = !surnameSorting;
});

// age sorting
let ageSorting = false;
const ageTh = document.getElementById("age-th");
ageTh.addEventListener("click", () => {
    const rows = Array.from(tbody.getElementsByTagName("tr"));

    rows.sort((a, b) => {
        const ageA = parseInt(a.getElementsByTagName("td")[2].textContent);
        const ageB = parseInt(b.getElementsByTagName("td")[2].textContent);
        if (ageA === ageB) {
            return 0;
        }
        if (ageSorting) {
            return ageA > ageB ? -1 : 1;
        } else {
            return ageA > ageB ? 1 : -1;
        }
    });

    rows.forEach((row) => row.remove());
    rows.forEach((row) => tbody.appendChild(row));

    ageSorting = !ageSorting;
});


// email sorting
let emailSorting = false;
const emailTh = document.getElementById("email-th");
emailTh.addEventListener("click", () => {
    const rows = Array.from(tbody.getElementsByTagName("tr"));

    rows.sort((a, b) => {
        const emailA = a.getElementsByTagName("td")[3].textContent.toLowerCase();
        const emailB = b.getElementsByTagName("td")[3].textContent.toLowerCase();
        if (emailSorting) {
            return emailB.localeCompare(emailA);
        } else {
            return emailA.localeCompare(emailB);
        }
    });

    rows.forEach((row) => row.remove());
    rows.forEach((row) => tbody.appendChild(row));

    emailSorting = !emailSorting;

});

// student number sorting
let studentNumberSorting = false;
const studentNumberTh = document.getElementById("student-number-th");
studentNumberTh.addEventListener("click", () => {
    const rows = Array.from(tbody.getElementsByTagName("tr"));

    rows.sort((a, b) => {
        const numA = a.getElementsByTagName("td")[4].textContent;
        const numB = b.getElementsByTagName("td")[4].textContent;
        if (numA === numB) {
            return 0;
        }
        if (studentNumberSorting) {
            return numA > numB ? -1 : 1;
        } else {
            return numA > numB ? 1 : -1;
        }
    });

    rows.forEach((row) => row.remove());
    rows.forEach((row) => tbody.appendChild(row));

    studentNumberSorting = !studentNumberSorting;
});

