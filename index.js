'use strict';
// Imports dependencies and set up http server
const
  express = require('express'),
  bodyParser = require('body-parser'),
  app = express().use(bodyParser.json()); // creates express http server
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');
const fs = require('fs');
const average = arr => arr.reduce( ( p, c ) => p + c, 0 ) / arr.length;
// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));
let date_ob = new Date();

app.post('/webhook', (req, res) => { 
    // Parse the request body from the POST
    let body = req.body;  
    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {  
      // Iterate over each entry - there may be multiple if batched
      body.entry.forEach(function(entry) {  
        // Get the webhook event. entry.messaging is an array, but 
        // will only ever contain one event, so we get index 0
        let webhook_event = entry.messaging[0];
        if (webhook_event.sender.id=='103651104958877') {
          console.log('Server Replied!')
        } else {
        try {
          let mess = webhook_event.message.text;
          console.log(webhook_event);
          console.log('Text: ' + mess);
          // console.log(webhook_event.message.nlp.entities);
          let sender_psid = webhook_event.sender.id;
          console.log('Sender PSID: ' + sender_psid);      
          const data = JSON.stringify({
            '1': mess,
            '2':sender_psid
          })
          console.log('Data ready to send: ' + data); 
          const axios = require('axios')
          axios.post('http://18.139.38.64:80', data)
          .then((res) => {
            console.log(res.data);            
            try {              
              fs.readFile(sender_psid+'.json', 'utf-8', function(err, data) {
                if (err) {
                  let writedata = { users:[] }
                  fs.writeFile(sender_psid+'.json',  JSON.stringify(writedata), 'utf-8', function(err) {
                    if (err) throw err;
                  })
                } else {                
                try {
                  var arrayOfObjects = JSON.parse(data);
                  arrayOfObjects.users.push({
                    id: sender_psid,
                    message: mess,
                    status: res.data,
                    day: date_ob.getDate(),
                    month: date_ob.getMonth()
                  });
                  fs.writeFile(sender_psid+'.json', JSON.stringify(arrayOfObjects), 'utf-8', function(err) {
                    if (err) throw err
                    console.log('Done!')
                  })
                } catch (error) {
                  let writedata = { users:[]}
                  fs.writeFile(sender_psid+'.json',  JSON.stringify(writedata), 'utf-8', function(err) {
                    if (err) throw err;
                  })
                  // arrayOfObjects.users.push({
                  //   id: sender_psid,
                  //   message: mess,
                  //   status: res.data,
                  //   day: date_ob.getDate(),
                  //   month: date_ob.getMonth()
                  // });
                }
              }
              })            
              fs.readFile('users.json', 'utf-8', function(err, data) {
                if (err) throw err;
                var users = JSON.parse(data);
                
                var checkvar = 0;
                for (let index = 0; index < users.all.length; index++) {
                  const element = users.all[index].id;    
                  
                    if (sender_psid==element) {
                      checkvar = checkvar + 1;
                    }
                }
                if (checkvar == 0) {
                  users.all.push({
                    id: sender_psid
                  })
                }
                fs.writeFile('users.json', JSON.stringify(users), 'utf-8', function(err) {
                  if (err) throw err
                  console.log('Users ID Done!')
                })              
              })            
            } catch (error) {
              console.log(error);
            }            
          })
          .catch((error) => {
            console.error(error);
            console.log('Server error!');
          })
        } catch (error) {
          // console.log(error);
        }
      }        
      });
      // Return a '200 OK' response to all events
      res.status(200).send('EVENT_RECEIVED');
  
    } else {
      // Return a '404 Not Found' if event is not from a page subscription
      res.sendStatus(404);
    }  
  });
  app.get('/webhook', (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "verify"
    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];      
    // Checks if a token and mode is in the query string of the request
    if (mode && token) {    
      // Checks the mode and token sent is correct
      if (mode === 'subscribe' && token === VERIFY_TOKEN) {        
        // Responds with the challenge token from the request
        console.log('WEBHOOK_VERIFIED');
        res.status(200).send(challenge);      
      } else {
        // Responds with '403 Forbidden' if verify tokens do not match
        res.sendStatus(403);      
      }
    }
  });
app.set('views', './views');
app.set('view engine', 'pug');

var path = require('path');
app.use("/public", express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {  
  var udata = fs.readFileSync('users.json', 'utf-8');
  var userId = JSON.parse(udata)
  var arr = {
    users:[],
    kq:[],
    day:[],
    month:[],
    dmonth:[],
    graph:[]
  }  
    // var te;
  let i = 0;
  var numberofdata = 0;
  for (let q = 0; q < userId.all.length; q++) {
    const el = userId.all[q].id;
    var printfile = fs.readFileSync(el+'.json','utf-8');     
    var showFile = JSON.parse(printfile);
    var arrayofthings = [];
    var dayRes = showFile.users[0].day;
    var dayArr = [dayRes];
    var monthRes = showFile.users[0].month;
    var dmonthRes = String(showFile.users[0].day) + '/' + String(showFile.users[0].month+1);
    arr.users.push(el);
    var tempKq = [];
    var tempDay = [];
    var tempMonth = [];
    var tempDMonth = [];
    for (let cou = 0; cou < showFile.users.length; cou++) {
      if (dayRes==showFile.users[cou].day) {
        const stats = showFile.users[cou].status;
        arrayofthings.push(stats); 
        // tempDay.push(dayRes); 
        dayRes = showFile.users[cou].day;
        monthRes = showFile.users[cou].month;
        dmonthRes = String(showFile.users[cou].day) + '/' + String(showFile.users[cou].month+1);
      } else {
        arrayofthings.push(average(arrayofthings)); 
        console.log(arrayofthings);
        // if (numberofdata<arrayofthings.length) { numberofdata = arrayofthings.length; }
        tempKq.push(average(arrayofthings));
        tempDay.push(dayRes);
        tempMonth.push(monthRes);
        tempDMonth.push(dmonthRes);
        console.log(arr);
        var arrayofthings = [];
        dayRes = showFile.users[cou].day;
        monthRes = showFile.users[cou].month;
        dmonthRes = String(showFile.users[cou].day) + '/' + String(showFile.users[cou].month+1);
      }   
    }
    // arrayofthings.push(average(arrayofthings)); 
    console.log(arrayofthings);
    tempKq.push(average(arrayofthings));
    tempDay.push(dayRes);
    tempMonth.push(monthRes);
    tempDMonth.push(dmonthRes);
    console.log(arr);
    arr.kq.push(tempKq);
    arr.day.push(tempDay);
    arr.month.push(tempMonth);
    arr.dmonth.push(tempDMonth);

    const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

    const width = 1000; //px
    const height = 400; //px
    const chartCallback = (ChartJS) => {

      // Global config example: https://www.chartjs.org/docs/latest/configuration/
      ChartJS.defaults.global.elements.rectangle.borderWidth = 2;
      ChartJS.defaults.global.legend.display = false;
      // Global plugin example: https://www.chartjs.org/docs/latest/developers/plugins.html
      ChartJS.plugins.register({
          // plugin implementation
      });
      // New chart type example: https://www.chartjs.org/docs/latest/developers/charts.html
      ChartJS.controllers.MyType = ChartJS.DatasetController.extend({
          // chart implementation
      });
    };
    
    const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, chartCallback });
    (async () => {
      const configuration = {
        type: 'line',
        data: {
            labels: tempDMonth,
            datasets: [{
                label: null,
                data: tempKq,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    };
      const stream = chartJSNodeCanvas.renderToStream(configuration);
      
      const image = await chartJSNodeCanvas.renderToBuffer(configuration);
      await arr.graph.push(image);
      fs.writeFileSync("public/images/" + el + "_graph.png", image);
      console.log(image);
      const dataUrl = await chartJSNodeCanvas.renderToDataURL(configuration);
      // return image;
      
      // console.log(stream);
    })();
  
        // var arrayofthings = [];
        // dayRes = showFile.users[cou].day;             

    var number = arr.users.length;
    // console.log(allData);  
  } 
  console.log(numberofdata);
  res.render('index', {lmao: arr, number: number});
  // console.log('Data: ' + allData);
})
app.get('/demo', function(req, res) {  
  res.sendFile('views/index.html', {root: __dirname });
})