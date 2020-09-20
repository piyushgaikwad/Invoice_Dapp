Template['views_receivable'].onCreated(function () {

    var template = this;

    this.invoices = new ReactiveVar([]);
    this.pendingInvoices = new ReactiveVar([]);
    this.onSaleInvoices = new ReactiveVar([]);
    this.closedInvoices = new ReactiveVar([]);

    Invoices.find().observe({
        added: (e) => {
            var invoices = lodash.remove(template.invoices.get(), (i) => i.invoiceId != e.invoiceId)
            invoices.push(e)
            template.invoices.set(invoices)

            template.pendingInvoices.set(lodash.filter(invoices, (i) => {
                return i.state == "0" && i.owner == Meteor.settings.public.contracts.ReceivableCompany.address
            }))

            template.onSaleInvoices.set(lodash.filter(invoices, (i) => {
                return i.state == "1" && i.owner == Meteor.settings.public.contracts.ReceivableCompany.address
            }))
            template.closedInvoices.set(lodash.filter(invoices, (i) => {
                return i.state == "2" || i.owner !== Meteor.settings.public.contracts.ReceivableCompany.address
            }))
        },
        changed: (e) => {
            var invoices = lodash.remove(template.invoices.get(), (i) => i.invoiceId != e.invoiceId)
            invoices.push(e)
            template.invoices.set(invoices)

            template.pendingInvoices.set(lodash.filter(invoices, (i) => {
                return i.state == "0" && i.owner == Meteor.settings.public.contracts.ReceivableCompany.address
            }))
            template.onSaleInvoices.set(lodash.filter(invoices, (i) => {
                return i.state == "1" && i.owner == Meteor.settings.public.contracts.ReceivableCompany.address
            }))
            template.closedInvoices.set(lodash.filter(invoices, (i) => {
                return i.state == "2" || i.owner !== Meteor.settings.public.contracts.ReceivableCompany.address
            }))
        }
    })
})

Template['views_receivable'].helpers({
    pendingInvoices: () => Template.instance().pendingInvoices.get(),
    onSaleInvoices: () => Template.instance().onSaleInvoices.get(),
    closedInvoices: () => Template.instance().closedInvoices.get(),
    investmentAccount: () => Meteor.settings.public.contracts.ReceivableCompany.address,
    awaitingPayments: () => _.reduce(Template.instance().pendingInvoices.get(), (result, i) => result += parseFloat(i.amount), 0).toFixed(2),
    receivedPayments: () => _.reduce(Template.instance().closedInvoices.get(), (result, i) => result += parseFloat(i.amount), 0).toFixed(2),
})

Template['views_receivable'].events({
    'click .add-invoice': (e, template) => _addInvoice(),
    'click .sell-invoice': (e, template) => _sellInvoice(e, template),
    'click .cancel-invoice': (e, template) => _cancelInvoiceSell(e, template)
})

Template['views_modals_sell_invoice'].events({
    'submit .sell-invoice'(event) {
        event.preventDefault();
        const target = event.target;

        var expirationDate = target.expiration_date.value;
        var takeoverAmount = target.takeover_amount.value;
        var address = target.address.value;

        // PoC: better UX when web3 request is not chained with minimongo request
        Contracts.InvoiceContract.at(address)
            .markAsOnSale(
                Meteor.settings.public.contracts.ReceivableCompany.address,
                moment(expirationDate, "MM-DD-YYYY").unix(),
                takeoverAmount,
                {from: Meteor.settings.public.contracts.ReceivableCompany.owner, gas: 4712388}
            )

        Invoices.update({invoiceAddress: address}, {
            $set: {
                expirationDate: target.expiration_date.value,
                takeoverAmount: target.takeover_amount.value,
                state: "1",
                waitingForBlockchain: 3
            }
        }, () => EthElements.Modal.hide())
    },
    'click .cancel'(event) {
        EthElements.Modal.hide()
    }
})

Template['views_modals_add_invoice'].events({
    'submit .add-invoice'(event) {
        event.preventDefault();
        const target = event.target;

        // PoC: better UX when web3 request is not chained with minimongo request
        Contracts.ReceivableCompanyContract.createInvoice(
            Meteor.settings.public.contracts.PayableCompany.address,
            target.invoice_id.value,
            moment(target.due_date.value, "MM-DD-YYYY").unix(),
            target.itemName.value,
            target.quantity.value,
            target.pricePerUnit.value,
            target.amount.value,
            target.currency.value,
            target.messageToRecipient.value,
            {
                from: Meteor.settings.public.contracts.ReceivableCompany.owner, gas: 6712388
            },
            (error, result) => {
                if (!error) {
                    console.log(result);
                } else {
                    console.error(error);
                }
            }
        );


        Invoices.insert({
            customer: target.customer.value,
            owner: Meteor.settings.public.contracts.ReceivableCompany.address,
            invoiceId: target.invoice_id.value,
            dueDate: target.due_date.value,
            item: target.itemName.value,
            quantity: target.quantity.value,
            pricePerUnit: target.pricePerUnit.value,
            amountForPay: target.amount.value,
            currency: target.currency.value,
            messageToRecipient: target.messageToRecipient.value,
            confirmed: false,
            state: "0",
            waitingForBlockchain: 3
        }, () => EthElements.Modal.hide())
    },
    'click .cancel'(event) {
        EthElements.Modal.hide()
    }
})

var _addInvoice = () => {
    event.preventDefault();
    EthElements.Modal.show({
        template: 'views_modals_add_invoice'
    })
}

var _sellInvoice = (e, template) => {
    EthElements.Modal.show({
        template: 'views_modals_sell_invoice',
        data: {
            address: e.target.dataset.address
        }
    })
}

var _cancelInvoiceSell = (e, template) => {
    // PoC: better UX when web3 request is not chained with minimongo request
    Contracts.InvoiceContract.at(e.target.dataset.address)
        .markAsPending(Meteor.settings.public.contracts.ReceivableCompany.address, {
            from: Meteor.settings.public.contracts.ReceivableCompany.owner,
            gas: 4712388
        })

    Invoices.update({invoiceAddress: e.target.dataset.address}, {
        $set: {
            state: "0",
            waitingForBlockchain: 3
        }
    }, () => EthElements.Modal.hide())
}
