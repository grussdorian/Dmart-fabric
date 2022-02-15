const helper = require('./helper'); 
const path = require('path');
const { Gateway, Wallets } = require('fabric-network');

const walletPath = path.join(__dirname, 'wallet');

const channelName = 'channel1';
const chaincodeName = 'basic';
const default_id = 'org1UserId';
var org1UserId = default_id;


async function main(args) {
    try {
        // build an in memory object with the network configuration (also known as a connection profile)
        const ccp = helper.buildCCPOrg1();
	if(args.item) org1UserId = args.item.Owner;
	console.log('Interacting with ledger as user ' + org1UserId); 
        // setup the wallet to hold the credentials of the application user
        const wallet = await helper.buildWallet(Wallets, walletPath);

        const gateway = new Gateway();

    
        // setup the gateway instance
        // The user will now be able to create connections to the fabric network and be able to
        // submit transactions and query. All transactions submitted by this gateway will be
        // signed by this user using the credentials stored in the wallet.
        await gateway.connect(ccp, {
            wallet,
            identity: org1UserId,
            discovery: { enabled: true, asLocalhost: true } // using asLocalhost as this gateway is using a fabric network deployed locally
        });
	org1UserId =  'org1UserId';
        // Build a network instance based on the channel where the smart contract is deployed
        const network = await gateway.getNetwork(channelName);


        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of asset data on the channel using the chaincode 'InitLedger' function.
        // This type of transaction would only be run once by an application the first time it was started after it
        // deployed the first time. Any updates to the chaincode deployed later would likely not need to run
        // an "init" type function.
        console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of assets on the ledger');
        // await contract.submitTransaction('InitLedger');  // we've already done this 
        console.log('*** Result: committed');

        //let args = process.argv 

        if (args.type === 'GetAllAssets') { 
            let result = await contract.evaluateTransaction('GetAllAssets');
            //console.log(helper.prettyJSONString(result.toString()));
	    
		//gateway.disconnect();

            return {res:helper.prettyJSONString(result.toString()),error:undefined}
            // evaluateTransaction only sends the transaction to the peer you are connected to
        } else if (args.type === 'ReadAsset') { 
            let asset = args.asset;
            let result = await contract.evaluateTransaction('ReadAsset', asset); 
            //console.log(helper.prettyJSONString(result.toString()));
            
	//	gateway.disconnect();

	    return {res:helper.prettyJSONString(result.toString()),error:undefined}
        } else if (args.type === 'CreateAsset') {
	    console.log(args.item); 
            let r = await contract.submitTransaction('CreateAsset' ,args.item.ID, args.item.Color, args.item.Size, args.item.Owner, args.item.AppraisedValue); 
            console.log(" -> Committed: ", r.toString());
            const result = {message:"Asset added successfully"}

          //  gateway.disconnect();

	    return {res:result,error:undefined}
	    // submitTransaction sends the transaction to the orderer, which makes sense here 
            // you can do submitTransaction for ReadAsset too but it will be slow as it will go to different peers 
        } else {
	   // gateway.disconnect(); 
            console.error("Bad command: ", args);
	    gateway.disconnect(); 
        }
	console.log("disconnecting gateway");
        gateway.disconnect(); 

    } catch (error) {
	//gateway.disconnect();
	console.log("GOT HERE TO CATCH BLOCK");
	org1UserId = default_id;
        return {res:undefined,error:error}
    }
}; 


exports.getAssets = async function getAssets(){
    const args = {
        type : "GetAllAssets"
    }
    try{
        const res = await main(args)
        if(!res.error)
        return res.res

        res.error.msg = res.error.message
        console.log('\n\n',res.error)
        return res.error
    }catch(error){
        console.log(error); 
    }
}
exports.createAsset = async function createAsset(asset){
    try{
        const args = {
            item: asset,
            type : "CreateAsset",
        }
        const res = await main(args)
        if(!res.error)
        return res.res
        
        res.error.msg = res.error.message
        console.log('\n\n',res.error)
        return res.error
    }catch(error){
        console.log(error); 
    }
}
exports.readAsset = async function readAsset(assetId){
    try{
        const args = {
            type : "ReadAsset",
            asset: assetId
        }
        const res = await main(args)
        if(!res.error)
        return res.res

        res.error.msg = res.error.message
        console.log('\n\n',res.error)
        return res.error
    }catch(error){
        console.log(error); 
    }
}
//getAssets();
// createAsset({
//     "AppraisedValue": 120,
//     "Color": "dark red",
//     "ID": "asset102",
//     "Owner": "RamK123",
//     "Size": 7,
//   });