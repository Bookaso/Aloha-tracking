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

const sample = {
"trackingNo": "SHP5054369172",
"courier": "เคอรี่ เอ็กซ์เพรส",
"courierKey": "kerry-express",
"color": "#FB8523",
"status": "ON_DELIVERED",
"currentStatus": "13:59 เคอรี่จัดส่งพัสดุของคุณเรียบร้อยแล้ว - คานหาม, พระนครศรีอยุธยา",
"timelines": [
    {
      "date": "2021-02-10",
      "details": [
        {
          "dateTime": "2021-02-10T13:59:56+07:00",
          "date": "2021-02-10",
          "time": "13:59",
          "status": "ON_DELIVERED",
          "description": "13:59 เคอรี่จัดส่งพัสดุของคุณเรียบร้อยแล้ว - คานหาม, พระนครศรีอยุธยา"
        },
        {
          "dateTime": "2021-02-10T08:57:06+07:00",
          "date": "2021-02-10",
          "time": "08:57",
          "status": "ON_SHIPPING",
          "description": "08:57 พนักงานกำลังจัดส่งพัสดุของคุณ - คานหาม, พระนครศรีอยุธยา"
        }
      ]
    },
    {
      "date": "2021-02-09",
      "details": [
        {
          "dateTime": "2021-02-09T08:10:59+07:00",
          "date": "2021-02-09",
          "time": "08:10",
          "status": "ON_OTHER_STATUS",
          "description": "08:10 พัสดุของคุณถึงสาขาปลายทางแล้ว เตรียมจัดส่ง - คานหาม, พระนครศรีอยุธยา"
        },
        {
          "dateTime": "2021-02-09T03:09:31+07:00",
          "date": "2021-02-09",
          "time": "03:09",
          "status": "ON_OTHER_STATUS",
          "description": "03:09 พัสดุของคุณอยู่ระหว่างขนส่ง - ตลิ่งชั่น, พระนครศรีอยุธยา"
        }
      ]
    },
    {
      "date": "2021-02-08",
      "details": [
        {
          "dateTime": "2021-02-08T22:03:55+07:00",
          "date": "2021-02-08",
          "time": "22:03",
          "status": "ON_OTHER_STATUS",
          "description": "22:03 พัสดุของคุณอยู่ระหว่างขนส่ง - ศูนย์คัดแยกสินค้าสมุทรสาคร, กรุงเทพมหานคร"
        },
        {
          "dateTime": "2021-02-08T13:35:59+07:00",
          "date": "2021-02-08",
          "time": "13:35",
          "status": "ON_PICKED_UP",
          "description": "13:35 เคอรี่เข้ารับพัสดุแล้ว"
        }
      ]
    }
]
};

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
            res.render("find",{thecarrier:carrier,data:sample})
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