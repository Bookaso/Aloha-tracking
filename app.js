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
    "Cache-Control": "public, max-age=604800",
    "Content-Type": "application/json"
}

let carriers =[];
let trackingData =[];

function fetchData() {
    const url = "https://fast.etrackings.com/api/v3/couriers"
    const options = {
        port: 443,
        method: 'GET',
        headers : header
    };
    carriers =[];
    trackingData =[];
    const resData = https.request(url,options,function(respond){
            console.log(respond.statusCode);
            let chunks = [];
        respond.on("data",function(data){
            chunks.push(data);
        }).on('end', function() {
            let data   = Buffer.concat(chunks);
            const carrierData = JSON.parse(data);
            carriers = carrierData.data;
          }).on("error",function(err){
            console.log(err);
        });
    })
    resData.end();
}
fetchData();
app.get("/", function(req,res){
    res.render("home",{carriers:carriers});
});

app.get("/:carrier_name",function(req,res){
let carriername = req.params.carrier_name;
    carriers.forEach(carrier => {
        if (carrier.key === carriername) {
            res.render("find",{thecarrier:carrier,data:trackingData})
        }
    });
});

app.post("/tracks/:carrier_name",function(req,res){
    const carriername = req.params.carrier_name;
    const tracking  = {"trackingNo":(_.upperCase(req.body.trackingNo)).replace(/\s/g, '')};
    
    const url = "https://fast.etrackings.com/api/v3/tracks/"+carriername
    const options = {
        method: 'POST',
        headers : header,
    }
    const request = https.request(url,options,function(response){
        let chunks = [];
        response.on("data",function(receivedata){
            chunks.push(receivedata);
        }).on("end",function(){
            let data   = Buffer.concat(chunks);
            let postData = JSON.parse(data);
            trackingData = postData.data;
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