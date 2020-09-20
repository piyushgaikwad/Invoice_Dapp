import * as CaleroMain from "../../smartContracts/build/contracts/CaleroMain";

Contracts['CaleroMain'] = web3.eth.contract(CaleroMain.abi).at(Meteor.settings.public.contracts.CaleroMain.address);
