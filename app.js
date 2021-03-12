const express = require("express");
const https = require("https");
// const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
require("dotenv").config();
const app = express();

app.set('view engine', 'ejs');

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:true}));

const header = {
    "Etrackings-Api-Key": process.env.API_KEY,
    "Etrackings-Key-Secret": process.env.KEY_SECRET,
    "Accept-Language":"th",
    "Content-Type": "application/json"
}

let carriers =[];
let trackingData =[];

app.get("/",function(req,res){
    const url = "https://fast.etrackings.com/api/v3/couriers"
    const options = {
        port: 443,
        method: 'GET',
        headers : header
    };
    carriers =[];
    trackingData =[];
    const reqtest = https.request(url,options,function(respond){
            console.log(respond.statusCode);
            let chunks = [];
        respond.on("data",function(data){
            chunks.push(data);
        }).on('end', function() {
            let data   = Buffer.concat(chunks);
            const carrierData = JSON.parse(data);
            carriers = carrierData.data;
            res.render("home",{carriers:carriers});
          }).on("error",function(err){
            console.log(err);
        });
    })
    reqtest.end();
});

app.get("/:carrier_name",function(req,res){
let carriername = req.params.carrier_name;
    console.log(carriername);
    carriers.forEach(carrier => {
        if (carrier.key === carriername) {
            res.render("find",{thecarrier:carrier,data:trackingData})
        }
    });
});

app.post("/tracks/:carrier_name",function(req,res){
    const carriername = req.params.carrier_name;
    const tracking  = {"trackingNo":(_.upperCase(req.body.trackingNo)).replace(/\s/g, '')};
    
    console.log(carriername);
    // console.log(trackingdata);
    const url = "https://fast.etrackings.com/api/v3/tracks/"+carriername
    const options = {
        method: 'POST',
        headers : header,
    }
    console.log(url);
    const request = https.request(url,options,function(response){
        console.log(response.statusCode);
        console.log(response.statusMessage);
        let chunks = [];
        response.on("data",function(receivedata){
            chunks.push(receivedata);
        }).on("end",function(){
            let data   = Buffer.concat(chunks);
            let postData = JSON.parse(data);
            trackingData = postData.data;
            console.log(trackingData);
            res.redirect("/"+carriername);
        }).on("error",function(err){
            console.log(err);
        })
    });
    request.write(JSON.stringify(tracking));
    request.end();
});



app.listen(process.env.PORT || 3000,()=>{
    console.log("server running on port 3000");
});