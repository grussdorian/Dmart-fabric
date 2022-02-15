const express = require('express')
const app = express();
const port = process.env.PORT || 3000
const bodyParser = require("body-parser");
app.use(require('body-parser').urlencoded({ extended: true }))
const caActions = require('./caActions')
const ledgerActions = require('./ledgerActions');
var cors = require('cors');
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/',(req,res)=>{
    res.send(`
<!DOCTYPE html>
<html>
<body>

<h2>ADD New User</h2>

<form action="/addUser">
  <label for="userName">User Name:</label><br>
  <input type="text" id="userName" name="userName" placeholder="John"><br>
  <label for="userId">User Id:</label><br>
  <input type="text" id="userId" name="userId" placeholder="JonDoe123"><br><br>
  <input type="submit" value="Submit">
</form> 

<h2>Get all assets</h2>
<form action="/getAssets">
  <input type="submit" value="Submit query">
</form>

<h2>Read asset</h2>
<form action="/readAsset">
  <label for="assetID">Enter Asset Id:</label><br>
  <input type="text" id="assetID" name="assetID" placeholder="asset id"><br><br>
  <input type="submit" value="Submit query">
</form>

<h2>Create asset</h2>
<form action="/createAsset" method="POST">
  <label for="assetID">Enter Asset Id:</label><br>
  <input type="text" id="assetID" name="assetID" placeholder="asset id"><br><br>

  <label for="AppraisedValue">EnterAppraised Value:</label><br>
  Rs. <input type="number" min=0 step=0.01 id="AppraisedValue" name="AppraisedValue" placeholder="amount"><br><br>

  <label for="Color">Enter Colour:</label><br>
  <input type="text" id="Color" name="Color" placeholder="Colour"><br><br>

  <label for="Owner">Enter Owner Id:</label><br>
  <input type="text" id="Owner" name="Owner" placeholder="owner id"><br><br>

  <label for="Size">Enter Size:</label><br>
  <input type="number" id="Size" name="Size" placeholder="Size"><br><br>

  <input type="submit" value="Submit query">
</form>

</body>
</html>
`)
})



app.post('/addUser',(req,res)=>{
   // console.log(req.body)
    const userName = req.body.userName
    const org1UserId = req.body.userId
   // console.log("User name = " , userName, org1UserId); 
    caActions.getUser(org1UserId)
    res.send(`<h2>hello ${userName}. You are now registered`)
})

app.get('/getAssets',async (req,res)=>{
    try{
        result = await ledgerActions.getAssets()
	res.json(result)
    }catch(error){
        console.error(error)
    }
})

app.get('/readAsset',async (req,res)=>{
    try{
        const assetId = req.query.assetID
        result = await ledgerActions.readAsset(assetId)
        res.json(result)
    }catch(error){
        console.error(error)
        res.json({error:error})
    }
})

app.post('/createAsset',async (req,res)=>{
    try{
        const asset = {
            "AppraisedValue": parseInt(req.body.AppraisedValue),
            "Color": req.body.Color,
            "ID": req.body.assetID,
            "Owner": req.body.Owner,
            "Size": parseInt(req.body.Size)
        }
        result = await ledgerActions.createAsset(asset)
        res.json(result)
    }catch(error){
        console.error(error)
        res.json({error:error})
    }
})

// if (args[2] === 'admin') { 
//     getAdmin(); 
// } else if (args[2] === 'user') { 
//     let org1UserId = args[3]; 
//     //getUser("org1UserId"); 
//     getUser(org1UserId); 
// } else { 
//     console.log("Invalid command");
// }

app.listen(port,()=>console.log('server up'))
