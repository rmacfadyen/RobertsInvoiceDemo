//
// Portions of this code came originally from Matt Kruse's 
// (matt@mattkruse.com) most excellent date.js. Specifically 
// the guts of the DateFormatter, DateParser, and DateLocationzation.
//
//
// Converts Date objects to strings
//
var DateFormatter = /** @class */ (function () {
    function DateFormatter() {
    }
    // ------------------------------------------------------------------
    // formatDate (date_object, format)
    // Returns a date in the output format specified.
    // The format string uses the same abbreviations as in getDateFromFormat()
    // ------------------------------------------------------------------
    DateFormatter.prototype.formatDate = function (date, format) {
        var result = "", i_format = 0, c = "", token = "", y = date.getFullYear(), M = date.getMonth() + 1, d = date.getDate(), E = date.getDay(), H = date.getHours(), m = date.getMinutes(), s = date.getSeconds(), value = {};
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
    };
    // ------------------------------------------------------------------
    // LZ(number)
    // Returns a leading zero for use when formatting a number to 2 digits
    // ------------------------------------------------------------------
    DateFormatter.prototype.LZ = function (x) {
        return (x < 0 || x > 9 ? "" : "0") + x;
    };
    return DateFormatter;
}());
//
// Parses strings into Date objects
//
var DateParser = /** @class */ (function () {
    function DateParser() {
    }
    // 
    // isDate 
    //  - Returns true if date string matches the specified format and is a valid date. 
    //  - Whitespace is not ignored
    //
    DateParser.prototype.isDate = function (val, format) {
        var date = this.getDateFromFormat(val, format);
        if (date === null) {
            return false;
        }
        return true;
    };
    // 
    // getDateFromFormat
    //  - Parses the string into a date using the specified format. Invalid
    //    dates are returned as NULL
    //
    DateParser.prototype.getDateFromFormat = function (val, format) {
        var i_val = 0, i_format = 0, c = "", token = "", x, y, now = new Date(), year = (now.getFullYear() - 2000), month = now.getMonth() + 1, date = 1, hh = now.getHours(), mm = now.getMinutes(), ss = now.getSeconds(), ampm = "", day_name, newdate, month_name, i;
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
                i_val += this.getIntSize(val, i_val, token.length, 2);
                ;
            }
            else if (token === "ss" || token === "s") {
                ss = this.getInt(val, i_val, token.length, 2);
                if (ss === null || (ss < 0) || (ss > 59)) {
                    return null;
                }
                i_val += this.getIntSize(val, i_val, token.length, 2);
                ;
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
    };
    DateParser.prototype.isInteger = function (val) {
        var i, digits = "1234567890";
        for (i = 0; i < val.length; i += 1) {
            if (digits.indexOf(val.charAt(i)) === -1) {
                return false;
            }
        }
        return true;
    };
    DateParser.prototype.getInt = function (str, i, minlength, maxlength) {
        var x, token;
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
    };
    DateParser.prototype.getIntSize = function (str, i, minlength, maxlength) {
        var x, token;
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
    };
    return DateParser;
}());
//
// Localized version of months, days, etc
//  - Default is en_US. Any other language has to be setup
//    by calling SetLocalizedValues(..) with the appropriate 
//    values.
//  - Somewhere I have C# code that will build a JSON object
//    with the localized values based on the current thread's
//    culture. Ask if you want it.
//
var DateLocalization = /** @class */ (function () {
    function DateLocalization() {
    }
    Object.defineProperty(DateLocalization, "MONTH_NAMES", {
        get: function () {
            return DateLocalization._MONTH_NAMES;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateLocalization, "DAY_NAMES", {
        get: function () {
            return DateLocalization._DAY_NAMES;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateLocalization, "TODAY_TEXT", {
        get: function () {
            return DateLocalization._TODAY_TEXT;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateLocalization, "WEEKDAY_START", {
        get: function () {
            return DateLocalization._WEEKDAY_START;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateLocalization, "MONTH_ABBREVIATIONS", {
        //
        // Pull out the month abreviations from the months array. Not
        // very performant... be warned.
        //
        get: function () {
            return $.grep(DateLocalization.MONTH_NAMES, function (_, idx) { return idx >= 12; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateLocalization, "DAY_ABBREVIATIONS", {
        //
        // Pull out the day abreviations from the days array. Not
        // very performant... be warned.
        //
        get: function () {
            return $.grep(DateLocalization.DAY_NAMES, function (_, idx) { return idx >= 7; });
        },
        enumerable: false,
        configurable: true
    });
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
    DateLocalization.SetLocalizedValues = function (Values) {
        DateLocalization._MONTH_NAMES = Values.LocalizedMonthNames;
        DateLocalization._DAY_NAMES = Values.LocalizedDayNames;
        DateLocalization._TODAY_TEXT = Values.LocalizedToday || DateLocalization._TODAY_TEXT;
        DateLocalization._WEEKDAY_START = Values.LocalizedWeekDayStart || DateLocalization._WEEKDAY_START;
    };
    DateLocalization._MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    DateLocalization._DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    DateLocalization._TODAY_TEXT = "Today";
    DateLocalization._WEEKDAY_START = 7;
    return DateLocalization;
}());
var EditableTable = /** @class */ (function () {
    //
    // Constructor
    //
    function EditableTable(table) {
        var _this = this;
        this.table = table;
        //
        // Use a "deleting" flag to avoid deleting the final row due
        // to the delay from the slideup function
        //
        this.Deleting = false;
        //
        // Use a "moving" flag to avoid doubled up interactions due
        // to fast typeing
        //
        this.Moving = false;
        //
        // List of id/names of the input elements of a row
        //
        this.FieldNames = [];
        //
        // Ensure styling is connected
        //
        $(table).addClass('EditableTable');
        //
        // Tuck away the body
        //
        this.tbody = $('>tbody', this.table);
        //
        // Bind events
        //
        $(this.table).on('click', '.addrow', function (e) { return _this.OnClickAddRow(e); });
        $(this.table).on('click', '.removerow', function (e) { return _this.OnClickDeleteRow(e); });
        $(this.table).on('click dblclick', '.moverow', function (e) { return _this.OnClickRowMove(e); });
        $(this.table).on('keydown', '.moverow', function (e) { return _this.OnKeyDownMoveRow(e); });
        //
        // Make the table sortable (have to use tbody)
        //
        var NumColumns = $('tr:first > td ', this.tbody).length;
        this.tbody.sortable({
            //
            // Use an explicit handle otherwise the input controls may interfere
            //
            handle: '.moverow',
            //
            // Rows only move up and down
            //
            axis: 'y',
            //
            // Make sure the placeholder is a blank row of the right height and no border
            //
            start: function (e, ui) {
                ui.placeholder.height(ui.item.height());
                ui.placeholder.html("<td class='border-0' colspan=\"" + NumColumns + "\">&nbsp;</td>");
            },
            //
            // Once a sort has stopped revert the explicit sizing
            //
            stop: function (e, ui) {
                $('>TD', ui).css({ 'width': '' });
                $(ui).css({ 'height': '' });
                ui.placeholder.html('');
                _this.RenumberElements();
            },
            //
            // Adjust the helper to use explicit sizes for column widths
            //
            helper: function (e, ui) {
                $('>TD', ui).each(function (idx, elm) {
                    var $elm = $(elm);
                    $elm.width($elm.width());
                });
                //
                // Make sure the row's hieght is the same
                //
                $(ui).height($(ui).height());
                return ui[0];
            }
        });
        //
        // Populate the initial number of rows
        //
        var InitialLines = $(this.table).data('editable-initial-lines');
        if (InitialLines) {
            //
            // Add the required number of initial rows
            //
            for (var i = 1; i < InitialLines; i += 1) {
                this.tbody.append(this.CreateRow().show());
            }
            //
            // Name all the input elements
            //
            this.RenumberElements();
        }
        //
        // Initialize the state of the UI
        //
        this.SetUi();
    }
    //
    // Initialize the state of the UI
    //
    EditableTable.prototype.SetUi = function () {
        if ($('TR', this.tbody).length === 1) {
            this.tbody.find('button.removerow').prop('disabled', true);
            this.tbody.find('a.moverow').addClass('disabled').attr('tabindex', '-1');
            this.tbody.sortable('disable');
        }
        else {
            this.tbody.find('button.removerow').prop('disabled', false);
            this.tbody.find('a.moverow').removeClass('disabled').removeAttr('tabindex');
            this.tbody.sortable('enable');
        }
    };
    //
    // On click of row move anchor set focus to the anchor
    //
    EditableTable.prototype.OnClickRowMove = function (e) {
        e.preventDefault();
        if ($(e.target).hasClass('.rowmove')) {
            $(e.target).focus();
        }
        else {
            $(e.target).closest('A').focus();
        }
    };
    //
    // Accessibility support for up arrow/dn arrow to move rows
    //
    EditableTable.prototype.OnKeyDownMoveRow = function (event) {
        var _this = this;
        var RowToSwapWith;
        var MoveFunction;
        //
        // If we're already moving we're done
        //
        if (this.Moving) {
            event.preventDefault();
            return;
        }
        //
        // Only handle up/dn arrows
        // 
        if (event.which !== 38 && event.which !== 40) {
            return;
        }
        //
        // Flag that a move is occurring
        //
        this.Moving = true;
        //
        // Don't do anything else with the event
        //
        event.preventDefault();
        //
        // The row currently with focus
        //
        var RowWithFocus = $(event.target).closest('TR');
        //
        // Figure the details of the move
        //
        if (event.which == 38) { // up
            RowToSwapWith = RowWithFocus.prev();
            MoveFunction = function (r) { return RowWithFocus.insertBefore(r); };
        }
        else if (event.which == 40) { // down
            RowToSwapWith = RowWithFocus.next();
            MoveFunction = function (r) { return RowWithFocus.insertAfter(r); };
        }
        //
        // Prepare the rows being swaped for animation
        //  - Basically copy each row to a new table with the
        //    exact same dimensions, position the new tables
        //    over their respective rows, hide the original 
        //    rows, show the new tables and animate moving
        //    to their new position
        //
        var t1 = this.CloneRowToTable(RowWithFocus);
        var t2 = this.CloneRowToTable(RowToSwapWith);
        //
        // Hide the rows being swaped (don't hide, just set
        // the visibility to none to keep the space reserved)
        //
        RowWithFocus.css({ 'visibility': 'hidden' });
        RowToSwapWith.css({ 'visibility': 'hidden' });
        //
        // The fake table that's a copy of the row with focus should appear on top
        //
        t1.css('z-index', '200');
        t2.css('z-index', '100');
        //
        // Animate each row's top to be the other row's top
        //
        t1.show().animate({ 'top': RowToSwapWith.offset().top + 'px' }, { queue: false });
        t2.show().animate({ 'top': RowWithFocus.offset().top + 'px' }, {
            queue: false,
            complete: function () {
                //
                // Do the actual swap
                //
                MoveFunction(RowToSwapWith);
                //
                // Show the swapped rows
                //
                RowWithFocus.css({ 'visibility': '' });
                RowToSwapWith.css({ 'visibility': '' });
                //
                // Get rid of the fake tables
                //
                t1.remove();
                t2.remove();
                //
                // Make sure things are properly numbered
                //
                _this.RenumberElements();
                //
                // Keep focus on the same anchor
                //
                $('A.moverow', RowWithFocus).focus();
                //
                // Flag the move as complete
                //
                _this.Moving = false;
            }
        });
    };
    EditableTable.prototype.CloneRowToTable = function (RowToClone) {
        var SourceTable = RowToClone.closest('TABLE');
        var ClonedTable = $('<table></table>').hide().addClass('EditableTable').width(SourceTable.outerWidth()).css({
            'background-color': 'white',
            'position': 'absolute',
            'top': RowToClone.offset().top,
            'left': RowToClone.offset().left,
        });
        var width = [];
        RowToClone.children().each(function (idx, elm) {
            width[idx] = Math.ceil($(elm).outerWidth());
        });
        var Clone = RowToClone.clone();
        Clone.children().each(function (idx, elm) {
            $(elm).width(width[idx]);
            //$(elm).css('border', '1px solid #ced4da');
        });
        ClonedTable.height(RowToClone.height());
        Clone.appendTo(ClonedTable);
        ClonedTable.appendTo('BODY');
        return ClonedTable;
    };
    //
    // Remove a row
    //
    EditableTable.prototype.OnClickDeleteRow = function (e) {
        var _this = this;
        var RowToDelete = $(e.target).closest('TR');
        if (this.Deleting) {
            return;
        }
        this.Deleting = true;
        $(RowToDelete)
            .children('td, th')
            .animate({ padding: 0 })
            .wrapInner('<div />')
            .children()
            .slideUp(function () {
            //
            // Remove the row
            //
            RowToDelete.remove();
            _this.Deleting = false;
            //
            // Name all the input elements
            //
            _this.RenumberElements();
            _this.SetUi();
            //
            // Let interested parties know a row was deleted
            //
            $(_this.table).trigger('rowdeleted');
        });
    };
    //
    // Add a new empty row
    //
    EditableTable.prototype.OnClickAddRow = function (e) {
        e.preventDefault();
        //
        // Add a new row at the end
        //
        this.tbody.append(this.CreateRow().fadeIn());
        //
        // Name all the input elements
        //
        this.RenumberElements();
        this.SetUi();
    };
    //
    // Create an empty row, initialize contents to blanks
    // 
    EditableTable.prototype.CreateRow = function () {
        var NewCells = [];
        //
        // Use the first row as a model
        //
        var FirstRow = this.tbody.children().first();
        FirstRow.children().each(function (_, el) {
            //
            // Copy the TD
            //
            var td = el.cloneNode(true);
            //
            // Reset the input fields to defaults
            //
            $(td).find('INPUT[type=text]').val('');
            $(td).find('INPUT[type=number]').val('');
            $(td).find('INPUT[type=checkbox]').prop('checked', false);
            //
            // SELECT's that use a placeholder (a disabled option) need care
            //
            if ($(td).find('SELECT OPTION[disabled]').length === 0) {
                $(td).find('SELECT OPTION:first').attr('selected', 'selected');
            }
            else {
                $(td).find('SELECT OPTION[disabled]').attr('selected', 'selected');
            }
            //
            // Remove any validation error marker that may have been copied
            //
            $(td).find('.input-validation-error').removeClass('input-validation-error');
            //
            // Check if there's text that needs to be removed
            //  - A cell with an input control is not empty, a cell with
            //    just text is empty but has no first child
            //  - This is very fragile. A span or div content will cause
            //    problems.
            //
            if (!$(td).is(':empty') && $(':first-child', td).length == -0) {
                $(td).empty();
            }
            //
            // Add it to the list
            //
            NewCells.push(td);
        });
        return $('<TR></TR>').hide().append(NewCells);
    };
    //
    // Don't really need to renumber the ID's but might
    // as well be consistent
    //  - Razor format for names of elements in a repeating 
    //    area is "Changes.ListProperty[Index].Field", where
    //    index is a number.
    //  - To renumber replace the [Index] value with an updated
    //    value that reflects the row position.
    //  - The format for an element's id is the same except
    //    periods and square brackets are replace with underscores.
    //
    EditableTable.prototype.RenumberElements = function () {
        var i = 0;
        this.tbody.children().each(function (idx, elm) {
            $('input,select', elm).each(function (j, inp) {
                var name = inp.getAttribute('name');
                if (name) {
                    var n = name.replace(/[(\d+)]/, i.toString());
                    var id = n.replace(/\./g, '_').replace(/\[/g, '_').replace(/\]/g, '_');
                    inp.setAttribute('name', n);
                    inp.setAttribute('id', id);
                }
            });
            i += 1;
        });
    };
    return EditableTable;
}());
$(function () {
    $('table[data-editable]').each(function (idx, elm) {
        new EditableTable(elm);
    });
});
//
// InvoiceTable
//  - This is demo code to show the look and feel of the new table/grid
//    editing design.
//
var InvoiceTable = /** @class */ (function () {
    //
    // Bind the necesary events
    //
    function InvoiceTable(invTable) {
        var _this = this;
        this.invTable = invTable;
        $(invTable).on('change', 'SELECT', function (e) { return _this.ChangeProduct($(e.target).closest('TR')); });
        $(invTable).on('change', 'INPUT', function (e) { return _this.ChangeQtyOrOverride($(e.target).closest('TR')); });
        $(invTable).on('keypress', 'INPUT', function (e) { return _this.RestrictToNumber(e); });
        $(invTable).on('paste', 'INPUT', function (e) { return _this.RestrictPasteToNumber(e); });
        $(invTable).on('rowdeleted', function (e) { return _this.UpdateInvoiceTotal(); });
    }
    //
    // Don't allow exponent style of numbers
    //
    InvoiceTable.prototype.RestrictPasteToNumber = function (e) {
        //
        // What was pasted
        //
        var p = e.originalEvent.clipboardData.getData('text');
        //
        // Check for invalid characters. The browser itself will drop invalid
        // characters from the paste... except for e/E.
        //
        if (p.indexOf('e') || p.indexOf('E')) {
            e.preventDefault();
        }
    };
    //
    // Don't allow exponent style of numbers (1.65e23) 
    //
    InvoiceTable.prototype.RestrictToNumber = function (e) {
        if (e.key === 'e') {
            e.preventDefault();
        }
    };
    //
    // When a product has been selected
    //  - Could be blank
    //
    InvoiceTable.prototype.ChangeProduct = function (Row) {
        var Product = Row.find('SELECT').val();
        var ProductDetails = this.LookupProduct(Product);
        if (!ProductDetails) {
            Row.find('TD:nth-child(3)').html('');
            Row.find('TD:nth-child(5)').html('');
            Row.find('TD:last-child').html('');
            Row.find('INPUT').val('');
        }
        else {
            Row.find('TD:nth-child(3)').html(ProductDetails.ItemDescription);
            Row.find('TD:nth-child(5)').html(ProductDetails.UnitCost.toFixed(2));
        }
        this.UpdateRowTotal(Row, ProductDetails);
        this.UpdateInvoiceTotal();
    };
    //
    // When ether the qty or price override amount has changed
    //
    InvoiceTable.prototype.ChangeQtyOrOverride = function (Row) {
        var Product = $(Row).find('SELECT').val();
        var ProductDetails = this.LookupProduct(Product);
        this.UpdateRowTotal(Row, ProductDetails);
        this.UpdateInvoiceTotal();
    };
    //
    // Fake product database/lookup
    //
    InvoiceTable.prototype.LookupProduct = function (ProductCode) {
        var ProductsDb = {
            "c1": {
                ItemDescription: "Programming/testing",
                UnitCost: 150.00
            },
            "c2": {
                ItemDescription: "General consulting/advice",
                UnitCost: 250.00
            },
            "m1": {
                ItemDescription: "Miscellaneous work",
                UnitCost: 1.00
            },
        };
        return ProductsDb[ProductCode];
    };
    //
    // Update the row total
    //
    InvoiceTable.prototype.UpdateRowTotal = function (Row, ProductDetails) {
        //
        // Ignore blank product
        //
        if (!ProductDetails) {
            return;
        }
        //
        // Get the controls for the qty, override and row total
        //
        var Qty = Row.find('td:nth-child(4) input').val();
        var PriceOverride = Row.find('td:nth-child(6) input').val();
        var Total = Row.find('td:last-child');
        //
        // Get the amounts as numbers
        //
        var QtyAmt = (Qty === '' ? 0 : parseFloat(Qty));
        var PriceOverrideAmt = (PriceOverride === '' ? 0 : parseFloat(PriceOverride));
        var PriceAmt = ProductDetails.UnitCost;
        //
        // Calculate the total
        //
        if (QtyAmt <= 0 || PriceOverrideAmt < 0) {
            Total.html('');
        }
        else {
            var TotalAmt;
            if (PriceOverrideAmt !== 0) {
                TotalAmt = Qty * PriceOverrideAmt;
            }
            else {
                TotalAmt = Qty * PriceAmt;
            }
            Total.html(TotalAmt.toFixed(2));
        }
    };
    //
    // Add up all the invoice rows and update the total
    //
    InvoiceTable.prototype.UpdateInvoiceTotal = function () {
        var Total = 0;
        $('tbody tr td:last-child', this.invTable).each(function (_, elm) {
            var Value = $(elm).html();
            if (Value !== '') {
                Total += parseFloat(Value);
            }
        });
        $('#Total').html(Total.toFixed(2));
    };
    return InvoiceTable;
}());
//
// Connect to all tables with a data-invoice attribute
//
$(function () {
    $('table[data-invoice]').each(function (idx, elm) {
        new InvoiceTable(elm);
    });
});
//
// RobertsDateTimePicker
//  - This is a bootstrap5 based datetime picker that relies on jquery
//    and popper.js.
//  - The most interesting thing about this picker is that users can
//    manually enter the date and the time (eg. type "01-may-2020 22:31")
//    in the text field. If the user then clicks the dropdown button
//    and changes the date, the time remains untouched. 
//  - For parsing, formatting, and localization the picker relies on the
//    DateRoutine.js classes DateFormatter, DateParser and DateLocalization.
//  - Note that the formatting strings are very close, but not quite, the 
//    same as .NET formatting string. Somewhere I have a C# conversion 
//    routine (just ask if you want it).
//  - The date picker is attached to an INPUT element via a data attribute:
//    data-datetimepicker="true". Right now the automatic attaching does
//    not support localization and formatting. The automatic attaching
//    is probably only useful for demos.
//
var RobertsDateTimePicker = /** @class */ (function () {
    //
    // Setup the plugin for the specified table
    //
    function RobertsDateTimePicker($this, options) {
        var _this = this;
        this.$this = $this;
        this.options = options;
        this.parser = new DateParser();
        this.formatter = new DateFormatter();
        this.calendar = null;
        $this
            .on('keydown', function (e) { return _this.HandleKeyboardInTextbox(e); })
            .parent().find('button').click(function (e) { return _this.DropdownButtonClickHandler(e); });
    }
    //
    // Setup the plugin for the specified table
    //
    RobertsDateTimePicker.prototype.getDate = function () {
        return this.parser.getDateFromFormat(this.$this.val(), this.options.Format);
    };
    //
    // Alt-Down in the text box opens the dropdown
    //
    RobertsDateTimePicker.prototype.HandleKeyboardInTextbox = function (e) {
        if (e.keyCode === 40 && e.altKey) {
            this.DropdownButtonClickHandler(e);
        }
    };
    //
    // On click of the date dropdown button display the calendar
    //  - Or if the calendar is already shown for this field hide the dropdown
    //
    RobertsDateTimePicker.prototype.DropdownButtonClickHandler = function (e) {
        var _this = this;
        //
        // Stop this event from propegating so the clickoutside/focusoutside events
        // don't pick it up and immediatly close the dropdown
        //
        e.stopImmediatePropagation();
        //
        // If the dropdown is already shown, and shown for this field, hide and destroy the dropdown
        //
        if ($('.RobertsDatePickerDropdown').length !== 0 && $('.RobertsDatePickerDropdown').data('for') === this.$this.attr('id')) {
            this.HideCalendarDropdown();
            this.$this.focus();
        }
        else {
            //
            // Create the dropdown (or destroy the existing one and create a new one)
            //
            this.CreateCalendarDropdown();
            //
            // Bind the events, position the dropdown and finally show it
            //
            this.calendar
                //
                // Ignore any clicks that aren't from links for days etc
                //  - Need this so our $(document).one('click' ...) works
                //
                .on('click', function (e) { return e.stopPropagation(); })
                //
                // Focus outside close the dropdown
                //
                .on('focusoutside', function () { return _this.HideCalendarDropdown(); })
                //
                // Click on a next/prev month button
                //
                .on('click', 'DIV.RobertsDatePickerSelectMonth BUTTON', function (e) {
                e.stopImmediatePropagation();
                var Year = $(e.currentTarget).data('year');
                var Month = $(e.currentTarget).data('month');
                var SelectedDate = _this.parser.getDateFromFormat(_this.$this.val(), _this.options.Format);
                _this.ReplaceCalendarDropdownContent(Year, Month, SelectedDate);
            })
                //
                // ESC closes the dropdown
                //
                .on('keydown', 'A,BUTTON', function (e) {
                if (e.which === 27) {
                    e.stopImmediatePropagation();
                    _this.HideCalendarDropdown();
                    _this.$this.focus();
                }
            })
                //
                // Selection of a date
                //
                .on('click', 'A.RobertsDatePickerSelection', function (e) {
                e.preventDefault();
                _this.UpdateValue($(e.target).data('year'), $(e.target).data('month'), $(e.target).data('date'));
            });
            //
            // Use popper.js to show the dropdown
            //
            this.ActivePopper = new window.Popper.createPopper(this.$this.closest('.input-group')[0], this.calendar[0], {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'flip',
                        enabled: true,
                    },
                    {
                        enabled: true,
                        order: 849,
                        fn: function (data) {
                            var _a = data.offsets.reference, width = _a.width, left = _a.left, right = _a.right;
                            data.styles.width = width;
                            data.offsets.popper.width = width;
                            data.offsets.popper.left = left;
                            data.offsets.popper.right = right;
                            return data;
                        }
                    }
                ]
            });
            //
            // Show the dropdown calendar
            //
            this.calendar[0].style.removeProperty('display');
            //
            // Focus on the current date
            //
            $('.RobertsDatePickerCurrentDate > A', this.calendar).focus();
            // 
            // Hide on a click outside the dropdown
            // 
            $(document).one('click', function () { return _this.HideCalendarDropdown(); });
        }
    };
    //
    // Set the field to the specified value
    // 
    RobertsDateTimePicker.prototype.UpdateValue = function (Year, Month, DateInMonth) {
        //
        // The selected date
        //
        var SelectedDate = new Date(Year, Month, DateInMonth);
        //
        // Handle the time portion
        //
        if (this.options.IncludeTime) {
            //
            // Get the current value so we can copy the time portion
            //
            var CurrentDate = this.parser.getDateFromFormat(this.$this.val(), this.options.Format);
            //
            // If there isn't a current value default to the current time
            //
            if (CurrentDate === null) {
                CurrentDate = new Date();
            }
            //
            // Copy the time over
            //
            SelectedDate.setHours(CurrentDate.getHours());
            SelectedDate.setMinutes(CurrentDate.getMinutes());
            //
            // Copy the seconds if necesary
            //
            if (this.options.IncludeSeconds) {
                SelectedDate.setSeconds(CurrentDate.getSeconds());
            }
        }
        //
        // Update the field
        //
        this.$this.val(this.formatter.formatDate(SelectedDate, this.options.Format));
        this.$this.trigger('change');
        this.$this.attr('readonly', 'readonly');
        this.$this.focus();
        this.$this.removeAttr('readonly');
        //
        // Done with the dropdown
        //
        this.HideCalendarDropdown();
    };
    //
    // Hide and destroy the dropdown
    //
    RobertsDateTimePicker.prototype.HideCalendarDropdown = function () {
        if (this.calendar) {
            this.calendar.hide().remove();
        }
        if (this.ActivePopper) {
            this.ActivePopper.destroy();
        }
    };
    //
    // Create a new calendar dropdown (hidden)
    //
    RobertsDateTimePicker.prototype.CreateCalendarDropdown = function () {
        var SelectedDate = this.parser.getDateFromFormat(this.$this.val(), this.options.Format);
        var ForElement = this.$this.attr('id');
        //
        // If one already exists destroy it
        //
        $('.RobertsDatePickerDropdown').remove();
        //
        // Add it to the document
        //
        this.calendar =
            $('<DIV id="RobertsDatePickerDropdown" CLASS="RobertsDatePickerDropdown" role="dialog" aria-modal="true" aria-label="Choose date"></DIV>')
                .outerWidth($('#' + ForElement).parent().outerWidth())
                .hide()
                .append(this.BuildCalendar(SelectedDate, SelectedDate, false));
        this.$this.closest('DIV').append(this.calendar);
    };
    //
    // Swap in a new calendar month/year
    //
    RobertsDateTimePicker.prototype.ReplaceCalendarDropdownContent = function (Year, Month, SelectedDate) {
        //
        // A fake date for the calendar
        //
        var CurrentDate = new Date(Year, Month, 1);
        //
        // Replace the calendar with a new one
        //
        $('.RobertsDatePickerCalendar').empty().append(this.BuildCalendar(CurrentDate, SelectedDate, true));
        var CurrentMonth = CurrentDate.getMonth();
        var CurrentYear = CurrentDate.getFullYear();
        var LastMonth = CurrentMonth - 1;
        var LastYear = CurrentYear;
        if (LastMonth < 0) {
            LastMonth = 11;
            LastYear -= 1;
        }
        var NextMonth = CurrentMonth + 1;
        var NextYear = CurrentYear;
        if (NextMonth > 11) {
            NextMonth = 0;
            NextYear += 1;
        }
        $('.RobertsDatePickerSelectPrevMonth BUTTON').data('year', LastYear).data('month', LastMonth);
        $('.RobertsDatePickerSelectNextMonth BUTTON').data('year', NextYear).data('month', NextMonth);
        $('.RobertsDatePickerCurrentMonth SPAN').text(this.getCalendarTitle(DateLocalization.MONTH_ABBREVIATIONS, CurrentYear, CurrentMonth + 1));
    };
    //
    // Get the actual calendar content
    //
    RobertsDateTimePicker.prototype.BuildCalendar = function (CurrentDate, SelectedDate, calendarPortionOnly) {
        return this.DoBuildCalendar(CurrentDate, SelectedDate, calendarPortionOnly, DateLocalization.WEEKDAY_START, DateLocalization.MONTH_ABBREVIATIONS, DateLocalization.DAY_ABBREVIATIONS, DateLocalization.TODAY_TEXT);
    };
    //
    // BuildCalendar
    //  - Build a DIV containing a calendar based on a supplied date.
    //  - A.RobertsDatePickerSelection anchors allow the user to select a specific date. The
    //    anchor provides data-year, data-month, data-date values to indicate the date.
    //  - This heavily modified routine is all that remains of an ancient jquery plugin
    //    called CalendaPopup.js by Matt Kruse (matt@mattkruse.com) 
    //
    RobertsDateTimePicker.prototype.DoBuildCalendar = function (currentDate, // The month/year of the calendar 
    selectedDate, // the current day is highlighted with .RobertsDatePickerCurrentDate
    calendarPortionOnly, weekStartDay, // Localized start of week
    monthNames, // Localized abbreviations for months
    dayNames, // Localized abbreviations for days
    todayText // Localized text for the word "Today"
    ) {
        //        
        // if a date wasn't supplied use the current date as the default
        //
        if (currentDate == null) {
            currentDate = new Date();
        }
        if (selectedDate == null) {
            selectedDate = new Date();
        }
        //
        // Determine the starting month/year and determine the number of days in each month
        //
        var month = currentDate.getMonth() + 1;
        var year = currentDate.getFullYear();
        var daysinmonth = new Array(0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);
        if (((year % 4 == 0) && (year % 100 != 0)) || (year % 400 == 0)) {
            daysinmonth[2] = 29;
        }
        var current_month = new Date(year, month - 1, 1);
        //
        // Where the calendar starts at
        //
        var display_year = year;
        var display_month = month;
        var display_date = 1;
        //
        // Adjust the year/month/date backwards such that the calendar shows a full row of days
        //
        var weekday = current_month.getDay();
        var offset = (weekday >= weekStartDay) ? weekday - weekStartDay : 7 - weekStartDay + weekday;
        if (offset > 0) {
            display_month--;
            if (display_month < 1) {
                display_month = 12;
                display_year--;
            }
            display_date = daysinmonth[display_month] - offset + 1;
        }
        //
        // Figure out the next month/year for navigation
        //
        var next_month = month + 1;
        var next_month_year = year;
        if (next_month > 12) {
            next_month = 1;
            next_month_year++;
        }
        //
        // Figure our the previous month/year for navigation
        //
        var last_month = month - 1;
        var last_month_year = year;
        if (last_month < 1) {
            last_month = 12;
            last_month_year--;
        }
        //
        // Build the calendar
        //
        var result = '';
        //
        // Header showing prev/next navigation and the current month/year
        //
        if (!calendarPortionOnly) {
            result += '<DIV CLASS="RobertsDatePickerHeader">';
            result += '<DIV CLASS="RobertsDatePickerSelectMonth RobertsDatePickerSelectPrevMonth"><BUTTON type="button" class="btn btn-link" role="option" data-year="' + last_month_year + '" data-month="' + (last_month - 1) + '"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-caret-left-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M3.86 8.753l5.482 4.796c.646.566 1.658.106 1.658-.753V3.204a1 1 0 0 0-1.659-.753l-5.48 4.796a1 1 0 0 0 0 1.506z"/></svg></BUTTON></DIV>';
            result += '<DIV CLASS="RobertsDatePickerCurrentMonth"><SPAN>' + this.getCalendarTitle(monthNames, year, month) + '</SPAN></DIV>';
            result += '<DIV CLASS="RobertsDatePickerSelectMonth RobertsDatePickerSelectNextMonth"><BUTTON type="button" class="btn btn-link" role="option" data-year="' + next_month_year + '" data-month="' + (next_month - 1) + '"><svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-caret-right-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12.14 8.753l-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"/></svg></BUTTON></DIV>';
            result += '</DIV>'; // header
            //
            // The calendar itself
            //
            result += '<DIV CLASS="RobertsDatePickerCalendar">';
        }
        //
        // The day name header
        //
        result += '<DIV CLASS="RobertsDatePickerCalendarDayNames">\n';
        for (var j = 0; j < 7; j++) {
            result += '<DIV><SPAN>' + dayNames[(weekStartDay + j) % 7] + '</SPAN></DIV>';
        }
        result += '</DIV>\n';
        //
        // The rows of individual days
        //
        for (var row = 1; row <= 6; row++) {
            result += '<DIV CLASS="RobertsDatePickerWeekRow">\n';
            for (var col = 1; col <= 7; col++) {
                var dateClass = "";
                if ((display_month == selectedDate.getMonth() + 1) && (display_date == selectedDate.getDate()) && (display_year == selectedDate.getFullYear())) {
                    dateClass = ' CLASS="RobertsDatePickerCurrentDate"';
                }
                else if (display_month !== current_month.getMonth() + 1) {
                    dateClass = ' CLASS="RobertsDatePickerAnotherMonth"';
                }
                result += '	<DIV' + dateClass + '><A href="#" class="RobertsDatePickerSelection" role="option" data-year="' + display_year + '" data-month="' + (display_month - 1) + '" data-date="' + display_date + '">' + display_date + '</A></DIV>\n';
                display_date++;
                if (display_date > daysinmonth[display_month]) {
                    display_date = 1;
                    display_month++;
                }
                if (display_month > 12) {
                    display_month = 1;
                    display_year++;
                }
            }
            result += '</DIV>'; // end of week
        }
        if (!calendarPortionOnly) {
            result += "</DIV>"; // end of calendar
            //
            // The footer provide the option to select 'today'
            //
            result += '<DIV class="RobertsDatePickerTodaySelection">';
            var now = new Date();
            var today_year = now.getFullYear();
            var today_month = now.getMonth() + 1;
            var today_date = now.getDate();
            result += '<A HREF="#" CLASS="RobertsDatePickerToday RobertsDatePickerSelection" class="link-primary" role="option" data-year="' + today_year + '" data-month="' + (today_month - 1) + '" data-date="' + today_date + '">' + todayText + '</A>\n';
            result += '</DIV>';
        }
        return result;
    };
    //
    // Returns the title (month name and year) for the calendar
    //
    RobertsDateTimePicker.prototype.getCalendarTitle = function (monthNames, year, month) {
        return monthNames[month - 1] + ' ' + year;
    };
    return RobertsDateTimePicker;
}());
//
// Automatically attach a datetime picker to input fields
//
$(function () {
    $('input[data-datetimepicker]').each(function (_, elm) {
        new RobertsDateTimePicker($(elm), { Format: "dd-NNN-yyyy" });
    });
});
//# sourceMappingURL=site.js.map