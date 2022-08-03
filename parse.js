const MILLISECONDS_TO_SECOND = 1000;
const SECONDS_TO_MINUTE = 60;
const MINUTES_TO_HOUR = 60;
const HOURS_TO_DAY = 24;
const DAYS_TO_WEEK = 7;
const DAY = MILLISECONDS_TO_SECOND * SECONDS_TO_MINUTE * MINUTES_TO_HOUR * HOURS_TO_DAY;
const WEEK = DAY * DAYS_TO_WEEK;

const WEEK_START = Object.freeze({
    SUNDAY: 4,
    MONDAY: 3,
    TUESDAY: 2,
    WEDNESDAY: 1,
    THURSDAY: 0,
    FRIDAY: 6,
    SATURDAY: 5
});

const CUTOFF_DATE = new Date('1/1/22');

function parse(text) {
    // Split by time
    const [tokens, numbers, dateWeekArray] = splitMessage(text);
    // Split by part
    // Reduce to {date: {person}}
    const table = summarize(tokens, numbers);
    const tableString = stringifyTable(table, numbers, dateWeekArray);
    return tableString;
}

function stringifyTable(table, numbers, dateWeekArray) {
    const header = '\t' + numbers.map(num => `'${num}'`).join('\t');
    const rows = dateWeekArray.map(dateWeek => {
        const data = numbers.map(number => table[dateWeek][number]);
        return [dateWeek, ...data].join('\t');
    });
    return [header, ...rows].join('\n');
}

function summarize(tokens, numbers) {
    // Split by part
    // Reduce to {date: {person}}
    const table = tokens.reduce((tbl, [dateWeek, number]) => {
        tbl[dateWeek] = tbl[dateWeek] || arrayToRow(numbers);
        tbl[dateWeek][number] += 1;
        return tbl;
    }, {});
    return table;
}

function arrayToRow(array) {
    return array.reduce((row, item) => {
        row[item] = 0;
        return row;
    }, {});
}

function dateStringToDateWeek(datestring, weekStart) {
    const date = new Date(datestring);
    // const dateWeek = new Date(Math.floor(date / week) * week - weekStart * day);
    const dateweek = new Date(Math.floor(date / WEEK) * WEEK);
    return dateweek.toLocaleDateString();
}

function splitMessage(text) {
    // 3/13/18, 7:06 AM - +1 (123) 456-7890
    const expression = /\d\d?\/\d\d?\/\d\d, \d\d?:\d\d [AP]M - (?:\+(?:[\(\) -]{0,2}\d+)+|Ali)/g;
    const matches = text.match(expression);
    const numbersSet = new Set();
    const dateWeekSet = new Set();
    const dateWeekArray = [];
    const tokensAndNull = matches.map(token => {
        const [dateString, number] = token.split(' - ');
        numbersSet.add(number);
        const date = new Date(dateString);
        if (date < CUTOFF_DATE) return null;
        const dateWeek = dateStringToDateWeek(date);
        if (!dateWeekSet.has(dateWeek)) {
            dateWeekSet.add(dateWeek);
            dateWeekArray.push(dateWeek);
        }
        return [dateWeek, number];
    });
    const tokens = tokensAndNull.filter(token => token !== null);
    const numbers = [...numbersSet].sort()
    return [tokens, numbers, dateWeekArray];
}
