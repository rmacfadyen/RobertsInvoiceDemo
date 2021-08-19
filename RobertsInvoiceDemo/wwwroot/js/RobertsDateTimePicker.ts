
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
class RobertsDateTimePicker {

    private ActivePopper: any;
    private parser = new DateParser();
    private formatter = new DateFormatter();
    private calendar = null;


    //
    // Setup the plugin for the specified table
    //
    constructor(
        public $this: JQuery,
        public options: {
            IncludeTime?: boolean;
            IncludeSeconds?: boolean;
            Format: string;
        }
    ) {
        $this
            .on('keydown', (e) => this.HandleKeyboardInTextbox(e))
            .parent().find('button').click((e) => this.DropdownButtonClickHandler(e))
            ;
    }

    //
    // Setup the plugin for the specified table
    //
    public getDate(): Date {
        return this.parser.getDateFromFormat(this.$this.val() as string, this.options.Format);
    }

    //
    // Alt-Down in the text box opens the dropdown
    //
    HandleKeyboardInTextbox(e: JQuery.Event) {
        if (e.keyCode === 40 && e.altKey) {
            this.DropdownButtonClickHandler(e);
        }
    }

    //
    // On click of the date dropdown button display the calendar
    //  - Or if the calendar is already shown for this field hide the dropdown
    //
    DropdownButtonClickHandler(e: JQuery.Event) {

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
                .on('click', (e) => e.stopPropagation())

                //
                // Focus outside close the dropdown
                //
                .on('focusoutside', () => this.HideCalendarDropdown())

                //
                // Click on a next/prev month button
                //
                .on('click', 'DIV.RobertsDatePickerSelectMonth BUTTON', (e) => {
                    e.stopImmediatePropagation();
                    var Year = $(e.currentTarget).data('year');
                    var Month = $(e.currentTarget).data('month')
                    var SelectedDate = this.parser.getDateFromFormat(this.$this.val() as string, this.options.Format);
                    this.ReplaceCalendarDropdownContent(Year, Month, SelectedDate);
                })

                //
                // ESC closes the dropdown
                //
                .on('keydown', 'A,BUTTON', (e) => {
                    if (e.which === 27) {
                        e.stopImmediatePropagation();
                        this.HideCalendarDropdown();
                        this.$this.focus();
                    }
                })

                //
                // Selection of a date
                //
                .on('click', 'A.RobertsDatePickerSelection', (e) => {
                    e.preventDefault();
                    this.UpdateValue($(e.target).data('year'), $(e.target).data('month'), $(e.target).data('date'));
                })
                ;

            //
            // Use popper.js to show the dropdown
            //
            this.ActivePopper = new (window as any).Popper.createPopper(this.$this.closest('.input-group')[0], this.calendar[0], {
                placement: 'bottom-start',
                modifiers: [
                    {
                        name: 'flip',
                        enabled: true,
                    },
                    {
                        enabled: true,
                        order: 849,
                        fn: (data) => {

                            const { width, left, right } = data.offsets.reference;

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
            $(document).one('click', () => this.HideCalendarDropdown());
        }
    }


    //
    // Set the field to the specified value
    // 
    UpdateValue(Year: number, Month: number, DateInMonth: number) {
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
            var CurrentDate = this.parser.getDateFromFormat(this.$this.val() as string, this.options.Format);

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
    }


    //
    // Hide and destroy the dropdown
    //
    HideCalendarDropdown() {
        if (this.calendar) {
            this.calendar.hide().remove();
        }
        if (this.ActivePopper) {
            this.ActivePopper.destroy();
        }
    }


    //
    // Create a new calendar dropdown (hidden)
    //
    CreateCalendarDropdown() {
        var SelectedDate = this.parser.getDateFromFormat(this.$this.val() as string, this.options.Format);
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
    }


    //
    // Swap in a new calendar month/year
    //
    ReplaceCalendarDropdownContent(Year: number, Month: number, SelectedDate: Date) {
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
    }


    //
    // Get the actual calendar content
    //
    BuildCalendar(CurrentDate: Date, SelectedDate: Date, calendarPortionOnly: boolean) {
        return this.DoBuildCalendar(CurrentDate, SelectedDate, calendarPortionOnly, DateLocalization.WEEKDAY_START, DateLocalization.MONTH_ABBREVIATIONS, DateLocalization.DAY_ABBREVIATIONS, DateLocalization.TODAY_TEXT);
    }

    //
    // BuildCalendar
    //  - Build a DIV containing a calendar based on a supplied date.
    //  - A.RobertsDatePickerSelection anchors allow the user to select a specific date. The
    //    anchor provides data-year, data-month, data-date values to indicate the date.
    //  - This heavily modified routine is all that remains of an ancient jquery plugin
    //    called CalendaPopup.js by Matt Kruse (matt@mattkruse.com) 
    //
    DoBuildCalendar(
        currentDate: Date,      // The month/year of the calendar 
        selectedDate: Date,     // the current day is highlighted with .RobertsDatePickerCurrentDate
        calendarPortionOnly: boolean,
        weekStartDay: number,   // Localized start of week
        monthNames: string[],   // Localized abbreviations for months
        dayNames: string[],     // Localized abbreviations for days
        todayText: string       // Localized text for the word "Today"
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
                display_month = 12; display_year--;
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
        var result: string = '';

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
    }

    //
    // Returns the title (month name and year) for the calendar
    //
    getCalendarTitle(monthNames: string[], year: number, month: number): string {
        return monthNames[month - 1] + ' ' + year;
    }
}


//
// Automatically attach a datetime picker to input fields
//
$(function () {
    $('input[data-datetimepicker]').each((_, elm) => {
        new RobertsDateTimePicker($(elm), { Format: "dd-NNN-yyyy" });
    });
})