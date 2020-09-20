localforage.clear();

Invoices = new Mongo.Collection('invoices', {connection: null});
new PersistentMinimongo2(Invoices, 'calero');