//
// Portions of this code came originally from Matt Kruse's 
// (matt@mattkruse.com) most excellent date.js. Specifically 
// the guts of the DateFormatter, DateParser, and DateLocationzation.
//


//
// Converts Date objects to strings
//
class DateFormatter {
    // ------------------------------------------------------------------
    // formatDate (date_object, format)
    // Returns a date in the output format specified.
    // The format string uses the same abbreviations as in getDateFromFormat()
    // ------------------------------------------------------------------
    public formatDate(date: Date, format: string): string {
        var result: string = "",
            i_format: number = 0,
            c: string = "",
            token: string = "",
            y: number = date.getFullYear(),
            M: number = date.getMonth() + 1,
            d: number = date.getDate(),
            E: number = date.getDay(),
            H: number = date.getHours(),
            m: number = date.getMinutes(),
            s: number = date.getSeconds(),
            value: Object = {};

        format = format + "";



        value = {
            "y": "" + y,
            "yyyy": y,
            "yy": (y.toString()).substring(2, 4),
            "M": M,
            "MM": this.LZ(M),
            "MMM": DateLocalization.MONTH_NAMES[M - 1],
            "NNN": DateLocalization.MONTH_NAMES[M + 11],
            "d": d,
            "dd": this.LZ(d),
            "E": DateLocalization.DAY_NAMES[E + 7],
            "EE": DateLocalization.DAY_NAMES[E],
            "H": H,
            "HH": this.LZ(H),
            "h": (H === 0) ? 12 : (H > 12) ? H - 12 : H,
            "hh": this.LZ((H === 0) ? 12 : (H > 12) ? H - 12 : H),
            "K": (H > 11) ? H - 12 : H,
            "k": H + 1,
            "KK": this.LZ((H > 11) ? H - 12 : H),
            "kk": this.LZ((H > 11) ? H - 12 : H),
            "a": (H > 11) ? "PM" : "AM",
            "m": m,
            "mm": this.LZ(m),
            "s": s,
            "ss": this.LZ(s)
        };


        while (i_format < format.length) {
            c = format.charAt(i_format);
            token = "";
            while ((format.charAt(i_format) === c) && (i_format < format.length)) {
                token += format.charAt(i_format);
                i_format += 1;
            }

            if (value[token] !== undefined) {
                result = result + value[token];
            }
            else {
                result = result + token;
            }
        }
        return result;
    }


    // ------------------------------------------------------------------
    // LZ(number)
    // Returns a leading zero for use when formatting a number to 2 digits
    // ------------------------------------------------------------------
    private LZ(x: number): string {
        return (x < 0 || x > 9 ? "" : "0") + x;
    }
}


//
// Parses strings into Date objects
//
class DateParser {

    // 
    // isDate 
    //  - Returns true if date string matches the specified format and is a valid date. 
    //  - Whitespace is not ignored
    //
    public isDate(val, format): boolean {
        var date = this.getDateFromFormat(val, format);
        if (date === null) {
            return false;
        }
        return true;
    }

    // 
    // getDateFromFormat
    //  - Parses the string into a date using the specified format. Invalid
    //    dates are returned as NULL
    //
    public getDateFromFormat(val: string, format: string): Date {
        var i_val = 0,
            i_format: number = 0,
            c: string = "",
            token: string = "",
            x: number, y: number,
            now: Date = new Date(),
            year: number = (now.getFullYear() - 2000),
            month: number = now.getMonth() + 1,
            date: number = 1,
            hh: number = now.getHours(),
            mm: number = now.getMinutes(),
            ss: number = now.getSeconds(),
            ampm: string = "",
            day_name: string,
            newdate: Date,
            month_name: string,
            i: number;

        val = val + "";
        format = format + "";

        while (i_format < format.length) {
            // Get next token from format string
            c = format.charAt(i_format);
            token = "";
            while ((format.charAt(i_format) === c) && (i_format < format.length)) {
                token += format.charAt(i_format);
                i_format += 1;
            }

            // Extract contents of value based on format token
            if (token === "yyyy" || token === "yy" || token === "y") {
                if (token === "yyyy") {
                    x = 4;
                    y = 4;
                }
                if (token === "yy") {
                    x = 2;
                    y = 2;
                }
                if (token === "y") {
                    x = 2;
                    y = 4;
                }
                year = this.getInt(val, i_val, x, y);
                if (year === null) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, x, y);
                if (year < 100) {
                    if (year > 70) {
                        year = (1900 + year);
                    }
                    else {
                        year = (2000 + year);
                    }
                }
            }
            else if (token === "MMM" || token === "NNN") {
                month = 0;
                for (i = 0; i < DateLocalization.MONTH_NAMES.length; i += 1) {
                    month_name = DateLocalization.MONTH_NAMES[i];
                    if (val.substring(i_val, i_val + month_name.length).toLowerCase() === month_name.toLowerCase()) {
                        if (token === "MMM" || (token === "NNN" && i > 11)) {
                            month = i + 1;
                            if (month > 12) {
                                month -= 12;
                            }
                            i_val += month_name.length;
                            break;
                        }
                    }
                }
                if ((month < 1) || (month > 12)) {
                    return null;
                }
            }
            else if (token === "EE" || token === "E") {
                for (i = 0; i < DateLocalization.DAY_NAMES.length; i += 1) {
                    day_name = DateLocalization.DAY_NAMES[i];
                    if (val.substring(i_val, i_val + day_name.length).toLowerCase() === day_name.toLowerCase()) {
                        i_val += day_name.length;
                        break;
                    }
                }
            }
            else if (token === "MM" || token === "M") {
                month = this.getInt(val, i_val, token.length, 2);
                if (month === null || (month < 1) || (month > 12)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);
            }
            else if (token === "dd" || token === "d") {
                date = this.getInt(val, i_val, token.length, 2);
                if (date === null || (date < 1) || (date > 31)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);
            }
            else if (token === "hh" || token === "h") {
                hh = this.getInt(val, i_val, token.length, 2);
                if (hh === null || (hh < 1) || (hh > 12)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);
            }
            else if (token === "HH" || token === "H") {
                hh = this.getInt(val, i_val, token.length, 2);
                if (hh === null || (hh < 0) || (hh > 23)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);
            }
            else if (token === "KK" || token === "K") {
                hh = this.getInt(val, i_val, token.length, 2);
                if (hh === null || (hh < 0) || (hh > 11)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);
            }
            else if (token === "kk" || token === "k") {
                hh = this.getInt(val, i_val, token.length, 2);
                if (hh === null || (hh < 1) || (hh > 24)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);
                hh -= 1;
            }
            else if (token === "mm" || token === "m") {
                mm = this.getInt(val, i_val, token.length, 2);
                if (mm === null || (mm < 0) || (mm > 59)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);;
            }
            else if (token === "ss" || token === "s") {
                ss = this.getInt(val, i_val, token.length, 2);
                if (ss === null || (ss < 0) || (ss > 59)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);;
            }
            else if (token === "a") {
                if (val.substring(i_val, i_val + 2).toLowerCase() === "am") {
                    ampm = "AM";
                }
                else if (val.substring(i_val, i_val + 2).toLowerCase() === "pm") {
                    ampm = "PM";
                }
                else {
                    return null;
                }
                i_val += 2;
            }
            else {
                if (val.substring(i_val, i_val + token.length) !== token) {
                    return null;
                }
                else {
                    i_val += token.length;
                }
            }
        }
        // If there are any trailing characters left in the value, it doesn't match
        if (i_val !== val.length) {
            return null;
        }

        // Is date valid for month?
        if (month === 2) {
            // Check for leap year
            if (((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0)) { // leap year
                if (date > 29) {
                    return null;
                }
            }
            else {
                if (date > 28) {
                    return null;
                }
            }
        }
        if ((month === 4) || (month === 6) || (month === 9) || (month === 11)) {
            if (date > 30) {
                return null;
            }
        }

        // Correct hours value
        if (hh < 12 && ampm === "PM") {
            hh = hh - 0 + 12;
        }
        else if (hh > 11 && ampm === "AM") {
            hh -= 12;
        }

        return new Date(year, month - 1, date, hh, mm, ss);
    }



    private isInteger(val: string): boolean {
        var i: number,
            digits: string = "1234567890";
        for (i = 0; i < val.length; i += 1) {
            if (digits.indexOf(val.charAt(i)) === -1) {
                return false;
            }
        }
        return true;
    }


    private getInt(str: string, i: number, minlength: number, maxlength: number): number {
        var x: number, token: string;

        for (x = maxlength; x >= minlength; x -= 1) {
            token = str.substring(i, i + x);
            if (token.length < minlength) {
                return null;
            }
            if (this.isInteger(token)) {
                return parseInt(token, 10);
            }
        }
        return null;
    }


    private getIntSize(str: string, i: number, minlength: number, maxlength: number): number {
        var x: number, token: string;

        for (x = maxlength; x >= minlength; x -= 1) {
            token = str.substring(i, i + x);
            if (token.length < minlength) {
                return 0;
            }
            if (this.isInteger(token)) {
                return x;
            }
        }
        return 0;
    }
}


//
// Localized version of months, days, etc
//  - Default is en_US. Any other language has to be setup
//    by calling SetLocalizedValues(..) with the appropriate 
//    values.
//  - Somewhere I have C# code that will build a JSON object
//    with the localized values based on the current thread's
//    culture. Ask if you want it.
//
class DateLocalization {
    public static get MONTH_NAMES() {
        return DateLocalization._MONTH_NAMES;
    }
    public static _MONTH_NAMES: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    public static get DAY_NAMES() {
        return DateLocalization._DAY_NAMES;
    }
    public static _DAY_NAMES: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    public static get TODAY_TEXT() {
        return DateLocalization._TODAY_TEXT;
    }
    public static _TODAY_TEXT: string = "Today";

    public static get WEEKDAY_START() {
        return DateLocalization._WEEKDAY_START;
    }
    public static _WEEKDAY_START: number = 7;

    //
    // Pull out the month abreviations from the months array. Not
    // very performant... be warned.
    //
    public static get MONTH_ABBREVIATIONS() {
        return $.grep(DateLocalization.MONTH_NAMES, function (_, idx) { return idx >= 12; });
    }

    //
    // Pull out the day abreviations from the days array. Not
    // very performant... be warned.
    //
    public static get DAY_ABBREVIATIONS() {
        return $.grep(DateLocalization.DAY_NAMES, function (_, idx) { return idx >= 7; });
    }


    //
    // Allows for changing the default (en-US) localizations
    //  - Only needs be called once, though multiple times won't hurt
    //  - The month names array should have 24 entries. The first 12 are the full
    //    month names, the second 12 are the abbreviations.
    //  - The day names array should have 14 entries. the first 7 are the full
    //    day names, the second 7 are the abbreviations
    //  - The weekday start and today text are only used by the date time picker's
    //    DoBuildCalendar routine and are not required for formatting or parsing.
    //  
    static SetLocalizedValues(Values: {
        LocalizedMonthNames: string[];
        LocalizedDayNames: string[];
        LocalizedToday?: string;
        LocalizedWeekDayStart?: number;
    }): void {
        DateLocalization._MONTH_NAMES = Values.LocalizedMonthNames;
        DateLocalization._DAY_NAMES = Values.LocalizedDayNames;
        DateLocalization._TODAY_TEXT = Values.LocalizedToday || DateLocalization._TODAY_TEXT;
        DateLocalization._WEEKDAY_START = Values.LocalizedWeekDayStart || DateLocalization._WEEKDAY_START;
    }
}

