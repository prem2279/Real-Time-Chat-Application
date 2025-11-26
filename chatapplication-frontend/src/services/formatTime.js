


const formatTime = (timestamp) => {
    let timeInput = timestamp;

    // Check if the string is missing a time zone identifier (like 'Z' or '+/-')
    // and if it contains the time/date separator 'T'.
    if (typeof timeInput === 'string' &&
        !timeInput.endsWith('Z') &&
        !timeInput.includes('+') &&
        timeInput.includes('T')) {

        // Append 'Z' to explicitly tell JavaScript this time is UTC.
        // This forces the correct 5-hour conversion for EST users.
        timeInput += 'Z';
    }

    // Now the Date object knows the time is UTC and converts it to the user's local time zone for display.
    return new Date(timeInput).toLocaleTimeString('en-US', {
        hour12: true,
        hour: "numeric",
        minute: "2-digit",
    });
};

export default formatTime();