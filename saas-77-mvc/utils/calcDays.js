// simple function to calculate the days number between two dates

module.exports = (today, past) => Math.round(Math.abs(today - past) / (1000 * 60 * 60 * 24)) + 1;