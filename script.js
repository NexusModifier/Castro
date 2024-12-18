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
  const token = await authenticate();  // Get authentication token

  const apiUrl = `https://api.astronomyapi.com/v2/astronomy/events?date=${year}-${month + 1}-01`;  // Modify to fetch for the entire month
  
  try {
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch astronomical events');
    }

    const data = await response.json();
    const events = data.data.events;
    
    // Populate eventData with events for each date
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


// Authenticate and fetch the access token
async function authenticate() {
  const appId = '889a5049-4095-4bdb-8f86-b83b526e01fa'; // Replace with your actual app ID
  const appSecret = '660cae464c0524e3fe7c04a995aa793d2661acbff8927149f1e8946c540a918d09fb12e8957c3f79c79f9defc06787786a238ff69426f145f4280a867ee92e9b7584ed64778ab13861cb51fdde761ad9d1211fa27656ea767c43b69069009ce3d895b323f2de413558a64b4d811cd2a7'; // Replace with your actual app secret

  const response = await fetch('https://api.astronomyapi.com/v2/authenticate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      app_id: appId,
      app_secret: appSecret,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to authenticate');
  }

  const data = await response.json();
  return data.access_token;  // Return the token
}
