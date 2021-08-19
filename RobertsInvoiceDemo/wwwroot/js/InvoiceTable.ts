//
// InvoiceTable
//  - This is demo code to show the look and feel of the new table/grid
//    editing design.
//

class InvoiceTable {
    constructor(public invTable: HTMLTableElement) {
        $(invTable).on('change', 'SELECT', (e) => this.ChangeProduct($(e.target).closest('TR')));
        $(invTable).on('change', 'INPUT', (e) => this.ChangeQtyOrCharge($(e.target).closest('TR')));
    }

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
        this.UpdateOrderTotal();
    }


    private ChangeQtyOrCharge(Row: JQuery) {

        var Product = $(Row).find('SELECT').val() as string;

        var ProductDetails = this.LookupProduct(Product);

        this.UpdateRowTotal(Row, ProductDetails);
        this.UpdateOrderTotal();
    }


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


    private UpdateRowTotal(Row, ProductDetails) {
        var Qty = Row.find('td:nth-child(4) input').val();
        var Charge = Row.find('td:nth-child(6) input').val();
        var Total = Row.find('td:last-child');

        var QtyAmt = (Qty === '' ? 0 : parseFloat(Qty));
        var ChargeAmt = (Charge === '' ? 0 : parseFloat(Charge));
        var PriceAmt = ProductDetails.UnitCost;

        if (QtyAmt <= 0 || ChargeAmt < 0) {
            Total.html('');
        }
        else {
            var TotalAmt;
            if (ChargeAmt !== 0) {
                TotalAmt = Qty * ChargeAmt;
            }
            else {
                TotalAmt = Qty * PriceAmt;
            }

            Total.html(TotalAmt.toFixed(2));
        }
    }

    private UpdateOrderTotal() {
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