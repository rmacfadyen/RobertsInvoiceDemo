//
// InvoiceTable
//  - This is demo code to show the look and feel of the new table/grid
//    editing design.
//

class InvoiceTable {

    //
    // Bind the necesary events
    //
    constructor(public invTable: HTMLTableElement) {
        $(invTable).on('change', 'SELECT', (e) => this.ChangeProduct($(e.target).closest('TR')));
        $(invTable).on('change', 'INPUT', (e) => this.ChangeQtyOrOverride($(e.target).closest('TR')));
        $(invTable).on('keypress', 'INPUT', (e) => this.RestrictToNumber(e));
        $(invTable).on('paste', 'INPUT', (e) => this.RestrictPasteToNumber(e));
        $(invTable).on('rowdeleted', (e) => this.UpdateInvoiceTotal());
    }


    //
    // Don't allow exponent style of numbers
    //
    private RestrictPasteToNumber(e) {
        //
        // What was pasted
        //
        var p = (e.originalEvent as any).clipboardData.getData('text') as string;

        //
        // Check for invalid characters. The browser itself will drop invalid
        // characters from the paste... except for e/E.
        //
        if (p.indexOf('e') || p.indexOf('E')) {
            e.preventDefault();
        }
    }


    //
    // Don't allow exponent style of numbers (1.65e23) 
    //
    private RestrictToNumber(e: JQuery.KeyPressEvent) {
        if (e.key === 'e') {
            e.preventDefault();
        }
    }


    //
    // When a product has been selected
    //  - Could be blank
    //
    private ChangeProduct(Row: JQuery) {
        var Product = Row.find('SELECT').val() as string;

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
    }


    //
    // When ether the qty or price override amount has changed
    //
    private ChangeQtyOrOverride(Row: JQuery) {

        var Product = $(Row).find('SELECT').val() as string;

        var ProductDetails = this.LookupProduct(Product);

        this.UpdateRowTotal(Row, ProductDetails);
        this.UpdateInvoiceTotal();
    }


    //
    // Fake product database/lookup
    //
    private LookupProduct(ProductCode: string) {
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
    }


    //
    // Update the row total
    //
    private UpdateRowTotal(Row, ProductDetails) {
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
    }


    //
    // Add up all the invoice rows and update the total
    //
    private UpdateInvoiceTotal() {
        var Total = 0;
        $('tbody tr td:last-child', this.invTable).each(function (_, elm) {
            var Value = $(elm).html();
            if (Value !== '') {
                Total += parseFloat(Value);
            }
        });

        $('#Total').html(Total.toFixed(2));
    }
}


//
// Connect to all tables with a data-invoice attribute
//
$(function () {
    $('table[data-invoice]').each((idx, elm) => {
        new InvoiceTable(elm as HTMLTableElement);
    });
})