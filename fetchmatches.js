require('dotenv').config();
const soap = require('soap');
const url = 'http://api.fixionline.com/CalendarService.svc?wsdl';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday'];

function fetchRoster(day, date, isToday = false) {
    soap.createClient(url, (err, client) => {
        if (err) {
            console.error(`Error creating SOAP client for ${day}:`, err);
            return;
        }

        const params = {
            apiKey: process.env.API_KEY,
            username: process.env.USERNAME,
            password: process.env.PASSWORD,
            applicationId: process.env.APPLICATION_ID, // Include the application ID
            request: {
                date: date, // Specific date for the day
            }
        };

        client.GetCompetitionMatches(params, (err, result) => {
            if (err) {
                console.error(`Error fetching data for ${day}:`, err);
                return;
            }

            console.log(`API response for ${day}:`, result);

            const matches = result.CompetitionMatches; // Adjust based on the actual response structure
            if (matches) {
                updateRoster(day, matches, isToday);
            } else {
                console.warn(`No matches found for ${day}`);
            }
        });
    });
}

function updateRoster(day, matches, isToday) {
    const rosterBody = document.getElementById(isToday ? 'todayRosterBody' : `${day.toLowerCase()}RosterBody`);
    rosterBody.innerHTML = ''; // Clear existing rows

    matches.forEach(match => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${match.time}</td>
            <td>${match.matchType}</td>
            <td>${match.division}</td>
            <td>${match.court}</td>
            <td class="team">${match.team1} vs ${match.team2}</td>
        `;
        rosterBody.appendChild(row);
    });
}

function getNextDayOfWeek(dayName, date = new Date()) {
    const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].indexOf(dayName);
    const resultDate = new Date(date.getTime());
    resultDate.setDate(date.getDate() + (dayOfWeek + 7 - date.getDay()) % 7);
    return resultDate.toISOString().split('T')[0];
}

// Fetch today's roster
const currentDate = new Date().toISOString().split('T')[0];
fetchRoster('Today', currentDate, true);

// Fetch rosters for Monday, Tuesday, Wednesday, and Thursday
days.forEach(day => {
    const date = getNextDayOfWeek(day);
    fetchRoster(day, date);
});

// Update every hour
setInterval(() => {
    fetchRoster('Today', currentDate, true);
    days.forEach(day => {
        const date = getNextDayOfWeek(day);
        fetchRoster(day, date);
    });
}, 3600000);