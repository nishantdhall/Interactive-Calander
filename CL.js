const monthNames = {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
};

// Global variables
let selectedDate = null;
let currentDisplayedDate = new Date();
let currentViewMode = 'month';

// Global helper functions - accessible from all scopes
function checkEvents(dateStr) {
    const events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
    return events[dateStr] && events[dateStr].length > 0;
}

function attachDateClickEvents() {
    const datescontainer = document.getElementById('strdata');
    const dateDivs = datescontainer.getElementsByTagName('div');
    Array.from(dateDivs).forEach(div => {
        const dateStr = div.getAttribute('data-date');
        if (dateStr) {
            div.addEventListener('click', () => {
                selectedDate = dateStr;
                showEventsForDate(dateStr);
            });
        }
    });
}

function showEventsForDate(dateStr) {
    const modal = document.getElementById('eventModal');
    const events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
    const dateEvents = events[dateStr] || [];
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Events for ${dateStr}</h2>
            ${dateEvents.length > 0 ? dateEvents.map((event, index) => 
                `<div class="event-item">
                    <div class="event-header">
                        <div>
                            <h3>${event.title}</h3>
                            <p>${event.description}</p>
                        </div>
                        <button class="delete-event-btn" onclick="deleteEvent('${dateStr}', ${index})">Delete</button>
                    </div>
                </div>`
            ).join('') : '<p>No events for this date</p>'}
            <button id="addEventBtn">Add New Event</button>
        </div>`;
    
    modal.style.display = 'block';
    
    modal.querySelector('.close').onclick = () => modal.style.display = 'none';
    modal.querySelector('#addEventBtn').onclick = showAddEventForm;
}

function showAddEventForm() {
    const modal = document.getElementById('eventModal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add Event for ${selectedDate}</h2>
            <form id="eventForm">
                <input type="text" id="eventTitle" placeholder="Event Title" required>
                <textarea id="eventDescription" placeholder="Event Description"></textarea>
                <button type="submit">Save Event</button>
            </form>
        </div>`;
    
    modal.querySelector('.close').onclick = () => modal.style.display = 'none';
    const form = modal.querySelector('#eventForm');
    form.addEventListener('submit', saveEvent);
}

function saveEvent(e) {
    e.preventDefault();
    const modal = document.getElementById('eventModal');
    const notification = document.getElementById('notification');
    
    const title = document.getElementById('eventTitle').value;
    const description = document.getElementById('eventDescription').value;
    
    if (!title.trim()) {
        alert('Please enter an event title');
        return;
    }
    
    // Get existing events
    const events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
    
    // Add new event
    if (!events[selectedDate]) {
        events[selectedDate] = [];
    }
    
    events[selectedDate].push({ title, description });
    
    // Save to localStorage
    localStorage.setItem('calendarEvents', JSON.stringify(events));
    
    // Close modal
    modal.style.display = 'none';
    
    // Show notification
    notification.textContent = 'Event saved successfully!';
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
    
    // Refresh calendar
    generateCalendarView();
}

document.addEventListener("DOMContentLoaded", function () {
    // Initialize variables
    const datescontainer = document.getElementById('strdata');
    const modal = document.getElementById('eventModal');
    const notification = document.getElementById('notification');

    // Set document title
    document.title = new Date().toLocaleDateString('en-GB', {
        weekday: 'long',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
    }).replace(',', '');

    // Make generatecalendar function globally accessible
    window.generatecalendar = function() {
        const daysInMonth = new Date(currentDisplayedDate.getFullYear(), 
            currentDisplayedDate.getMonth() + 1, 0).getDate();
        const firstday = new Date(currentDisplayedDate.getFullYear(), 
            currentDisplayedDate.getMonth(), 1).getDay();
        
        datescontainer.innerHTML = '';
        const Mntname = monthNames[currentDisplayedDate.getMonth()];
        const FYear = currentDisplayedDate.getFullYear();
        document.getElementById("todaydt").innerHTML = Mntname + " " + FYear;

        // Add empty cells for days before first day of month
        for (let i = 0; i < firstday; i++) {
            datescontainer.innerHTML += `<div><span></span></div>`;
        }

        // Add days of the month
        const today = new Date();
        for (let j = 1; j <= daysInMonth; j++) {
            const dateStr = `${currentDisplayedDate.getFullYear()}-${(currentDisplayedDate.getMonth() + 1)
                .toString().padStart(2, '0')}-${j.toString().padStart(2, '0')}`;
            const hasEvent = checkEvents(dateStr);
            const eventClass = hasEvent ? 'has-event' : '';
            const isToday = currentDisplayedDate.getFullYear() === today.getFullYear() &&
                           currentDisplayedDate.getMonth() === today.getMonth() &&
                           j === today.getDate();
            
            datescontainer.innerHTML += `<div class='${isToday ? 'tday' : ''} ${eventClass}' 
                data-date="${dateStr}"><span>${j}</span></div>`;
        }

        // Add click events to dates
        attachDateClickEvents();
    };

    // Close modal when clicking outside
    window.onclick = (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };

    // Initialize calendar
    generatecalendar();
});

// Delete event function
window.deleteEvent = function(dateStr, eventIndex) {
    if (confirm('Are you sure you want to delete this event?')) {
        const events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
        if (events[dateStr]) {
            events[dateStr].splice(eventIndex, 1);
            
            if (events[dateStr].length === 0) {
                delete events[dateStr];
            }
            
            localStorage.setItem('calendarEvents', JSON.stringify(events));
            
            // Get notification element from current scope
            const notification = document.getElementById('notification');
            notification.textContent = 'Event deleted successfully!';
            notification.style.display = 'block';
            
            setTimeout(() => {
                notification.style.display = 'none';
            }, 3000);
            
            // Refresh modal to show updated events
            selectedDate = dateStr;
            const modal = document.getElementById('eventModal');
            const dateEvents = events[dateStr] || [];
            
            if (dateEvents.length > 0) {
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Events for ${dateStr}</h2>
                        ${dateEvents.map((event, index) => 
                            `<div class="event-item">
                                <div class="event-header">
                                    <div>
                                        <h3>${event.title}</h3>
                                        <p>${event.description}</p>
                                    </div>
                                    <button class="delete-event-btn" onclick="deleteEvent('${dateStr}', ${index})">Delete</button>
                                </div>
                            </div>`
                        ).join('')}
                        <button id="addEventBtn">Add New Event</button>
                    </div>`;
                modal.querySelector('#addEventBtn').onclick = () => showAddEventFormGlobal();
            } else {
                modal.innerHTML = `
                    <div class="modal-content">
                        <span class="close">&times;</span>
                        <h2>Events for ${dateStr}</h2>
                        <p>No events for this date</p>
                        <button id="addEventBtn">Add New Event</button>
                    </div>`;
                modal.querySelector('#addEventBtn').onclick = () => showAddEventFormGlobal();
            }
            
            modal.querySelector('.close').onclick = () => modal.style.display = 'none';
            generatecalendar();
        }
    }
};

// Switch view mode function
window.switchView = function(viewMode) {
    currentViewMode = viewMode;
    const inBox = document.querySelector('.in_box');
    
    // Update button states
    document.getElementById('monthView').classList.remove('active');
    document.getElementById('weekView').classList.remove('active');
    document.getElementById('yearView').classList.remove('active');
    document.getElementById(viewMode + 'View').classList.add('active');
    
    // Update in_box width based on view mode
    if (viewMode === 'year') {
        inBox.classList.add('year-mode');
    } else {
        inBox.classList.remove('year-mode');
    }
    
    // Generate appropriate view
    if (viewMode === 'month') {
        generateMonthView();
    } else if (viewMode === 'week') {
        generateWeekView();
    } else if (viewMode === 'year') {
        generateYearView();
    }
};

// Generate month view (default)
function generateMonthView() {
    const datescontainer = document.getElementById('strdata');
    const daysInMonth = new Date(currentDisplayedDate.getFullYear(), 
        currentDisplayedDate.getMonth() + 1, 0).getDate();
    const firstday = new Date(currentDisplayedDate.getFullYear(), 
        currentDisplayedDate.getMonth(), 1).getDay();
    
    datescontainer.innerHTML = '';
    const Mntname = monthNames[currentDisplayedDate.getMonth()];
    const FYear = currentDisplayedDate.getFullYear();
    document.getElementById("todaydt").innerHTML = Mntname + " " + FYear;

    // Add empty cells for days before first day of month
    for (let i = 0; i < firstday; i++) {
        datescontainer.innerHTML += `<div><span></span></div>`;
    }

    // Add days of the month
    const today = new Date();
    for (let j = 1; j <= daysInMonth; j++) {
        const dateStr = `${currentDisplayedDate.getFullYear()}-${(currentDisplayedDate.getMonth() + 1)
            .toString().padStart(2, '0')}-${j.toString().padStart(2, '0')}`;
        const hasEvent = checkEvents(dateStr);
        const eventClass = hasEvent ? 'has-event' : '';
        const isToday = currentDisplayedDate.getFullYear() === today.getFullYear() &&
                       currentDisplayedDate.getMonth() === today.getMonth() &&
                       j === today.getDate();
        
        datescontainer.innerHTML += `<div class='${isToday ? 'tday' : ''} ${eventClass}' 
            data-date="${dateStr}"><span>${j}</span></div>`;
    }

    attachDateClickEvents();
}

// Generate week view
function generateWeekView() {
    const datescontainer = document.getElementById('strdata');
    datescontainer.innerHTML = '';
    datescontainer.classList.add('week-view');
    
    const today = new Date(currentDisplayedDate);
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    
    const weekStart = startOfWeek.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    const weekEnd = new Date(startOfWeek.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    document.getElementById("todaydt").innerHTML = `Week: ${weekStart} - ${weekEnd}`;

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        
        const dateStr = `${currentDay.getFullYear()}-${(currentDay.getMonth() + 1)
            .toString().padStart(2, '0')}-${currentDay.getDate().toString().padStart(2, '0')}`;
        const hasEvent = checkEvents(dateStr);
        const eventClass = hasEvent ? 'has-event' : '';
        const isToday = currentDay.toDateString() === new Date().toDateString();
        
        datescontainer.innerHTML += `
            <div class="week-day">
                <div class="day-label">${dayNames[i]}</div>
                <div class='${isToday ? 'tday' : ''} ${eventClass} week-date' data-date="${dateStr}">
                    <span>${currentDay.getDate()}</span>
                </div>
            </div>`;
    }

    attachDateClickEvents();
}

// Generate year view
function generateYearView() {
    const datescontainer = document.getElementById('strdata');
    datescontainer.innerHTML = '';
    datescontainer.classList.add('year-view');
    
    const year = currentDisplayedDate.getFullYear();
    document.getElementById("todaydt").innerHTML = `Year: ${year}`;

    for (let month = 0; month < 12; month++) {
        const monthName = monthNames[month];
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        
        let monthDays = `<div class="month-block">
            <div class="month-name">${monthName}</div>
            <div class="month-grid">`;
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const hasEvent = checkEvents(dateStr);
            const eventClass = hasEvent ? 'has-event' : '';
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            
            monthDays += `<div class='year-date ${isToday ? 'tday' : ''} ${eventClass}' data-date="${dateStr}">
                <span>${day}</span>
            </div>`;
        }
        
        monthDays += `</div></div>`;
        datescontainer.innerHTML += monthDays;
    }

    attachDateClickEvents();
}

// Check events function
function checkEvents(dateStr) {
    const events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
    return events[dateStr] && events[dateStr].length > 0;
}

// Show add event form global
function showAddEventFormGlobal() {
    const modal = document.getElementById('eventModal');
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Add Event for ${selectedDate}</h2>
            <form id="eventForm">
                <input type="text" id="eventTitle" placeholder="Event Title" required>
                <textarea id="eventDescription" placeholder="Event Description"></textarea>
                <button type="submit">Save Event</button>
            </form>
        </div>`;
    
    modal.querySelector('.close').onclick = () => modal.style.display = 'none';
    const form = modal.querySelector('#eventForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        const title = document.getElementById('eventTitle').value;
        const description = document.getElementById('eventDescription').value;
        
        if (!title.trim()) {
            alert('Please enter an event title');
            return;
        }
        
        const events = JSON.parse(localStorage.getItem('calendarEvents') || '{}');
        
        if (!events[selectedDate]) {
            events[selectedDate] = [];
        }
        
        events[selectedDate].push({ title, description });
        localStorage.setItem('calendarEvents', JSON.stringify(events));
        
        modal.style.display = 'none';
        
        const notification = document.getElementById('notification');
        notification.textContent = 'Event saved successfully!';
        notification.style.display = 'block';
        
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
        
        generateCalendarView();
    };
}

// Generate calendar based on current view mode
function generateCalendarView() {
    if (currentViewMode === 'month') {
        generateMonthView();
    } else if (currentViewMode === 'week') {
        generateWeekView();
    } else if (currentViewMode === 'year') {
        generateYearView();
    }
}

// Previous month function
window.PrevMNTcalendar = function() {
    if (currentViewMode === 'month') {
        currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() - 1);
    } else if (currentViewMode === 'week') {
        currentDisplayedDate.setDate(currentDisplayedDate.getDate() - 7);
    } else if (currentViewMode === 'year') {
        currentDisplayedDate.setFullYear(currentDisplayedDate.getFullYear() - 1);
    }
    generateCalendarView();
}

// Next month function
window.NxtMNTcalendar = function() {
    if (currentViewMode === 'month') {
        currentDisplayedDate.setMonth(currentDisplayedDate.getMonth() + 1);
    } else if (currentViewMode === 'week') {
        currentDisplayedDate.setDate(currentDisplayedDate.getDate() + 7);
    } else if (currentViewMode === 'year') {
        currentDisplayedDate.setFullYear(currentDisplayedDate.getFullYear() + 1);
    }
    generateCalendarView();
}