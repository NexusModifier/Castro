const daysContainer = document.getElementById('days');
const monthYearDisplay = document.getElementById('month-year');
const prevMonthBtn = document.getElementById('prev-month');
const nextMonthBtn = document.getElementById('next-month');

const currentDate = new Date();
let displayedMonth = currentDate.getMonth();
let displayedYear = currentDate.getFullYear();

const eventData = {};  // Placeholder for event data (this will hold events for specific dates)

// Fetch Astronomical Events from the Astronomy API
async function fetchAstronomicalEvents(month, year) {
  const apiKey = 'YOUR_API_KEY';  // Replace with your API key from Astronomy API or other services
  const apiUrl = `https://api.astronomyapi.com/v2/astronomy/events?date=${year}-${month + 1}&apiKey=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    // Example response structure based on the API
    // You may need to adjust based on the actual API response
    const events = data.data.events;
    
    events.forEach(event => {
      const eventDate = event.date;  // Format: YYYY-MM-DD
      const eventDescription = event.name;  // Event name or description

      eventData[eventDate] = eventDescription;
    });
    
  } catch (error) {
    console.error('Error fetching events:', error);
  }
}

// Render the calendar and display events for each day
function renderCalendar(month, year) {
  // Clear previous days
  daysContainer.innerHTML = '';

  // Get month and year details
  const monthName = new Date(year, month).toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Update the header
  monthYearDisplay.textContent = `${monthName} ${year}`;

  // Add empty slots for days of the previous month
  for (let i = 0; i < firstDay; i++) {
    const emptyDiv = document.createElement('div');
    daysContainer.appendChild(emptyDiv);
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    
    // Create a span for the day number
    const dayNumber = document.createElement('span');
    dayNumber.textContent = day;

    // Check for any event on this day and display it on the day div
    const eventKey = `${year}-${month + 1}-${day}`;
    if (eventData[eventKey]) {
      const eventText = document.createElement('div');
      eventText.classList.add('event-text');
      eventText.textContent = eventData[eventKey];
      dayDiv.appendChild(eventText);
    }

    // Add the day number to the day div
    dayDiv.appendChild(dayNumber);

    // Highlight today
    if (
      day === currentDate.getDate() &&
      month === currentDate.getMonth() &&
      year === currentDate.getFullYear()
    ) {
      dayDiv.classList.add('today');
    }

    daysContainer.appendChild(dayDiv);
  }
}

// Change the month when user clicks prev/next buttons
function changeMonth(direction) {
  displayedMonth += direction;

  if (displayedMonth < 0) {
    displayedMonth = 11;
    displayedYear--;
  } else if (displayedMonth > 11) {
    displayedMonth = 0;
    displayedYear++;
  }

  initializeCalendar();  // Re-render with the new month
}

// Initialize the calendar by fetching events and rendering the calendar
async function initializeCalendar() {
  await fetchAstronomicalEvents(displayedMonth, displayedYear);  // Fetch events before rendering
  renderCalendar(displayedMonth, displayedYear);  // Then render the calendar
}

// Event listeners for navigation
prevMonthBtn.addEventListener('click', () => {
  changeMonth(-1);
});

nextMonthBtn.addEventListener('click', () => {
  changeMonth(1);
});

// Initial render
initializeCalendar();

// Real-time update for today's date (auto updates every minute)
setInterval(() => {
  const newCurrentDate = new Date();
  if (newCurrentDate.getDate() !== currentDate.getDate()) {
    // Update the current date to the new one
    currentDate.setDate(newCurrentDate.getDate());
    currentDate.setMonth(newCurrentDate.getMonth());
    currentDate.setFullYear(newCurrentDate.getFullYear());

    // Re-render the calendar
    initializeCalendar();
  }
}, 60000);  // Update every minute
