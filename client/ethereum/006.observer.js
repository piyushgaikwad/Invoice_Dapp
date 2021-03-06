var toUtf8 = web3.toUtf8;

let _updateDb = () => {
    Contracts.CaleroMain.listInvoices((e, r) => {
        if (!r) return;

        r.forEach((invoiceAddress) => {
            invoice = Contracts.InvoiceContract.at(invoiceAddress)

            Invoices.findOne({
                invoiceId: invoice.getInvoiceId((e, r) => {
                        if (r) {
                            // poc: workaround for showing the spinner until a particular change was confirmed by the network
                            // real world: when a change occur watch the transaction that does it being confirmed
                            if (r.waitingForBlockchain > 0) {
                                Invoices.update({invoiceId: r.invoiceId}, {
                                    $set: {
                                        waitingForBlockchain: r.waitingForBlockchain - 1
                                    }
                                })
                            } else {
                                Invoices.update({invoiceId: r.invoiceId}, {
                                    $set: {
                                        expirationDate: moment.unix(invoice.getPayDueDate((e, r) => { if(!e) { return r.valueOf()} else {return console.error(e)}})).format('MM-DD-YYYY'),
                                        owner: invoice.getOwner((e, r) => { if(!e) { return r.valueOf()} else {return console.error(e)}}),
                                        customer: invoice.getCustomer((e, r) => { if(!e) { return r.valueOf()} else {return console.error(e)}}),
                                        owners: invoice.listOwners((e, r) => { if(!e) { return r} else {return console.error(e)}}),
                                        waitingForBlockchain: 0
                                    }
                                })
                            }
                        } else {
                            Invoices.insert({
                                invoiceAddress: invoiceAddress,
                                issueDate: moment.unix(invoice.getIssueDate().valueOf()).format('MM-DD-YYYY'),
                                dueDate: moment.unix(invoice.getDueDate().valueOf()).format('MM-DD-YYYY'),
                                expirationDate: moment.unix(invoice.getPayDueDate().valueOf()).format('MM-DD-YYYY'),
                                invoiceId: invoice.getInvoiceId().valueOf(),
                                amount: invoice.getAmount().valueOf(),
                                takeoverAmount: invoice.getTakeOverPrice().valueOf(),
                                owner: invoice.getOwner().valueOf(),
                                currency: toUtf8(invoice.getCurrency().valueOf()),
                                country: toUtf8(invoice.getCountry().valueOf()),
                                maxDiscount: invoice.getMaxDiscount().valueOf(),
                                customer: invoice.getCustomer().valueOf(),
                                state: invoice.getState().valueOf(),
                                isConfirmed: invoice.isConfirmed().valueOf(),
                                owners: invoice.listOwners(),
                                waitingForBlockchain: 0
                            })
                        }
                    }
                )
            })

        })
    })
}

// Filters polling take a lot of resources, interval suits PoC needs
var interval = setInterval(_updateDb, 5000)
_updateDb()
