let images = [
    "Images/PUP1.png",
    "Images/PUP2.png",
    "Images/PUP3.png"
];

let currentIndex = 0;

function changeImage(newIndex) {
    const img = document.getElementById("slide");
    img.style.opacity = 0;

    setTimeout(() => {
        currentIndex = newIndex;
        img.src = images[currentIndex];
        img.style.opacity = 1;
    }, 300);
}

function nextImage() {
    let newIndex = currentIndex + 1;
    if (newIndex >= images.length) {
        newIndex = 0;
    }
    changeImage(newIndex);
}

function prevImage() {
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
        newIndex = images.length - 1;
    }
    changeImage(newIndex);
}

document.addEventListener("DOMContentLoaded", function () {

    const reserveBtn = document.getElementById("reserveBtn");
    const list = document.getElementById("list");

    if (!reserveBtn) return;

    function loadReservations() {
        const reservations = JSON.parse(localStorage.getItem("reservations")) || [];
        list.innerHTML = "";

        reservations.forEach(res => {
            let li = document.createElement("li");
            li.innerText = `${res.name} - ${res.room} - ${res.date} ${res.time}`;
            list.appendChild(li);
        });
    }

    function reserveRoom() {
        let name = document.getElementById("name").value;
        let date = document.getElementById("date").value;
        let time = document.getElementById("time").value;
        let room = document.getElementById("room").value;

        if(name === "" || date === "" || time === "") {
            alert("Please fill all fields");
            return;
        }

        const reservations = JSON.parse(localStorage.getItem("reservations")) || [];

        reservations.push({ name, date, time, room });

        localStorage.setItem("reservations", JSON.stringify(reservations));

        loadReservations();

       const notification = document.getElementById("notification");

        notification.textContent = "Room successfully reserved!";
        notification.classList.add("show");

        notification.offsetHeight;

setTimeout(function() {
    notification.classList.remove("show");
}, 3000);

        document.getElementById("name").value = "";
        document.getElementById("date").value = "";
        document.getElementById("time").value = "";
    }

    reserveBtn.addEventListener("click", reserveRoom);

    loadReservations();
});

const roomSelect = document.getElementById("roomSelect");
const form = document.getElementById("reservationForm");
const reservationList = document.getElementById("reservationList");
const availableRoomsList = document.getElementById("availableRooms");
const notification = document.getElementById("notification");
const dateInput = document.getElementById("date");

let reservations = [];
let allRooms = [];

function generateRooms() {
    const specialRooms = ["01","03","07","11","13","14"];

    for (let floor = 1; floor <= 4; floor++) {
        for (let room = 1; room <= 14; room++) {

            let roomNumber = room.toString().padStart(2, "0");
            let fullRoom = `${floor}${roomNumber}`;

            if (specialRooms.includes(roomNumber)) {
                addRoom(fullRoom + "A");
                addRoom(fullRoom + "B");
            } else {
                addRoom(fullRoom);
            }
        }
    }
}

function addRoom(room) {
    allRooms.push(room);

    const option = document.createElement("option");
    option.value = room;
    option.textContent = room;
    roomSelect.appendChild(option);
}

generateRooms();

function isOverlapping(room, date, start, end) {
    return reservations.some(res => {
        return (
            res.room === room &&
            res.date === date &&
            (
                (start >= res.start && start < res.end) ||
                (end > res.start && end <= res.end) ||
                (start <= res.start && end >= res.end)
            )
        );
    });
}

form.addEventListener("submit", function(e) {
    e.preventDefault();

    const reservedBy = document.getElementById("reservedBy").value;
    const room = roomSelect.value;
    const date = dateInput.value;
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;

    if (start >= end) {
        showNotification("End time must be after start time.", "error");
        return;
    }

    if (isOverlapping(room, date, start, end)) {
        showNotification("Room already reserved during that time.", "error");
        return;
    }

    reservations.push({ room, date, start, end, reservedBy });

    showNotification("Room reserved successfully!", "success");

    displayReservations();
    displayAvailableRooms(date);
    form.reset();
});

function displayReservations() {
    reservationList.innerHTML = "";

    reservations.forEach((res, index) => {
        const li = document.createElement("li");
    li.innerHTML = `
    ${res.room} | ${res.date} | ${res.start} - ${res.end} | Reserved By: ${res.reservedBy}
            <button class="small-btn" onclick="deleteReservation(${index})">Delete</button>
        `;
        reservationList.appendChild(li);
    });
}

function deleteReservation(index) {
    reservations.splice(index, 1);
    displayReservations();
    displayAvailableRooms(dateInput.value);
    showNotification("Reservation deleted.", "success");
}

function displayAvailableRooms(date) {
    availableRoomsList.innerHTML = "";

    if (!date) return;

    const reservedToday = reservations
        .filter(res => res.date === date)
        .map(res => res.room);

    const available = allRooms.filter(room => !reservedToday.includes(room));

    available.forEach(room => {
        const li = document.createElement("li");
        li.textContent = room;
        availableRoomsList.appendChild(li);
    });
}

dateInput.addEventListener("change", function() {
    displayAvailableRooms(this.value);
});

function showNotification(message, type = "info") {

    notification.textContent = message;

    // Remove old types
    notification.classList.remove("success", "error", "info");

    // Add new type
    notification.classList.add(type);

    // Show with animation
    notification.classList.add("show");

    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove("show");

        // Small delay before clearing text
        setTimeout(() => {
            notification.textContent = "";
        }, 400);

    }, 3000);
}