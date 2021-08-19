class EditableTable {
    //
    // The tbody of the table
    //
    private tbody: JQuery;

    //
    // Use a "deleting" flag to avoid deleting the final row due
    // to the delay from the slideup function
    //
    Deleting = false;

    //
    // Use a "moving" flag to avoid doubled up interactions due
    // to fast typeing
    //
    Moving = false;

    //
    // List of id/names of the input elements of a row
    //
    FieldNames = [];

    //
    // Constructor
    //
    constructor(public table) {
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
        $(this.table).on('click', '.addrow', (e) => this.OnClickAddRow(e));
        $(this.table).on('click', '.removerow', (e) => this.OnClickDeleteRow(e));
        $(this.table).on('click dblclick', '.moverow', (e) => this.OnClickRowMove(e));
        $(this.table).on('keydown', '.moverow', (e) => this.OnKeyDownMoveRow(e));

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
            start: (e, ui) => {
                ui.placeholder.height(ui.item.height());
                ui.placeholder.html("<td class='border-0' colspan=\"" + NumColumns + "\">&nbsp;</td>");
            },

            //
            // Once a sort has stopped revert the explicit sizing
            //
            stop: (e, ui) => {
                $('>TD', ui).css({ 'width': '' });
                $(ui).css({ 'height': '' });
                ui.placeholder.html('');
                this.RenumberElements();
            },

            //
            // Adjust the helper to use explicit sizes for column widths
            //
            helper: (e, ui) => {
                $('>TD', ui).each((idx, elm) => {
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
    SetUi() {
        if ($('TR', this.tbody).length === 1) {
            this.tbody.find('button.removerow').prop('disabled', true);
            this.tbody.find('a.moverow').addClass('disabled').attr('tabindex', '-1');
            this.tbody.sortable('disable');
        } else {
            this.tbody.find('button.removerow').prop('disabled', false);
            this.tbody.find('a.moverow').removeClass('disabled').removeAttr('tabindex');
            this.tbody.sortable('enable');
        }
    }


    //
    // On click of row move anchor set focus to the anchor
    //
    OnClickRowMove(e) {
        e.preventDefault();

        if ($(e.target).hasClass('.rowmove')) {
            $(e.target).focus();
        }
        else {
            $(e.target).closest('A').focus();
        }
    }

    //
    // Accessibility support for up arrow/dn arrow to move rows
    //
    OnKeyDownMoveRow(event: JQuery.KeyDownEvent) {
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
            MoveFunction = (r) => RowWithFocus.insertBefore(r);
        }
        else if (event.which == 40) { // down
            RowToSwapWith = RowWithFocus.next();
            MoveFunction = (r) => RowWithFocus.insertAfter(r);
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
            complete: () => {
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
                this.RenumberElements();

                //
                // Keep focus on the same anchor
                //
                $('A.moverow', RowWithFocus).focus();

                //
                // Flag the move as complete
                //
                this.Moving = false;
            }
        });
    }


    CloneRowToTable(RowToClone: JQuery<HTMLElement>) {
        var SourceTable = RowToClone.closest('TABLE');
        var ClonedTable = $('<table></table>').hide().addClass('EditableTable').width(SourceTable.outerWidth()).css({
            'background-color': 'white',
            'position': 'absolute',
            'top': RowToClone.offset().top,
            'left': RowToClone.offset().left,
        });

        var width = [];
        RowToClone.children().each((idx, elm) => {
            width[idx] = Math.ceil($(elm).outerWidth());
        });

        var Clone = RowToClone.clone();

        Clone.children().each((idx, elm) => {
            $(elm).width(width[idx]);
            //$(elm).css('border', '1px solid #ced4da');
        });
        ClonedTable.height(RowToClone.height());

        Clone.appendTo(ClonedTable);

        ClonedTable.appendTo('BODY');

        return ClonedTable;
    }

    //
    // Remove a row
    //
    OnClickDeleteRow(e) {
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
            .slideUp(() => {
                //
                // Remove the row
                //
                RowToDelete.remove();
                this.Deleting = false;

                //
                // Name all the input elements
                //
                this.RenumberElements();
                this.SetUi();
            });
    }


    //
    // Add a new empty row
    //
    OnClickAddRow(e) {
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
    }


    //
    // Create an empty row, initialize contents to blanks
    // 
    CreateRow() {
        var NewCells = [];

        //
        // Use the first row as a model
        //
        var FirstRow = this.tbody.children().first();
        FirstRow.children().each((_, el) => {
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
            if (!$(td).is(':empty') && $(':first-child', td).length ==- 0) {
                $(td).empty();
            }

            //
            // Add it to the list
            //
            NewCells.push(td);
        });

        return $('<TR></TR>').hide().append(NewCells);
    }


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
    RenumberElements() {
        var i = 0;
        this.tbody.children().each(function (idx, elm) {
            $('input,select', elm).each((j, inp) => {
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
    }
}

$(function () {
    $('table[data-editable]').each((idx, elm) => {
        new EditableTable(elm);
    });
}) 