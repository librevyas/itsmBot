/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
//"use strict";
var builder = require("botbuilder"); 
var botbuilder_azure = require("botbuilder-azure");
 var instance = require('servicenow-rest').gliderecord;
 //var gr = new instance('dev23926', 'incident', 'kgs.bot', 'kgs.bot', 'v1');
 obj = {}; 
var useEmulator = (process.env.NODE_ENV == 'development'); 

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
     appId: process.env['MicrosoftAppId'],

    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'api.projectoxford.ai';
var LuisModelUrl  = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2cf06f11-b527-4c08-9362-ef6c1b9929e6?subscription-key=9327da1f01de40889960a183403ff7c4&verbose=true&q=";
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer],intentThreshold: 0.7 })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
.matches('Incident', [
    function(session) {
        builder.Prompts.text(session, 'Can you Please ellaborate the issue?');
    },
    function(session, results) {  
    obj.u_short_description = results.response;


    var gr = new instance('dev23926', 'incident', 'kgs.bot', 'kgs.bot', 'v1');
    gr.insert(obj).then(function(response){ 

//console.log("responce :"+util.inspect(response,false,null));
console.log(JSON.stringify(response));
session.send(JSON.stringify(response));

    }

}); 

    ]);

    
    

.matches('Request', (session, args) => {
    //methods options 
   // session.send('New request raised for Laptop');
})

/*
.matches('Incident Status',(session, args) => {
 var gr1 = new instance('dev23926', 'incident', 'kgs.bot', 'kgs.bot', 'v1');
gr1.setReturnFields('number,short_description,assigned_to,status');
gr1.addEncodedQuery('^ORDERBYDESCsys_created_on');
gr1.setLimit(1);
gr1.query().then(function(result){ //returns promise 

console.log("Result : "+JSON.stringify(result));
session.send(`Your Incident Number is : `+JSON.stringify(result[0].number)


+` Your Incident is assigned_to : David Loo (davidloo@example.com)`+`

Incident Status : `+result[0].state);   
})    
  
})

*/
.matches('Greeting', [
    function(session) {
        builder.Prompts.text(session, 'Hi.My name is Adam. May I know your name ?');
    },
    function(session, results) {
        results.response = results.response.replace(/\./g, " ");
         results.response = results.response.replace(/yes/g, " ");
         results.response = results.response.replace(/\,/g, " ");
        results.response = results.response.replace(/i am/gi, "");
        results.response = results.response.replace(/sure/gi, "");
        results.response = results.response.replace(/sure,/gi, "");
        results.response = results.response.replace(/i'm/gi, "");
         results.response = results.response.replace(/its/gi, "");
         results.response = results.response.replace(/it is/gi, "");
         results.response = results.response.replace(/thanks. it is/gi, "");
          results.response = results.response.replace(/it's/gi, "");
           results.response = results.response.replace(/hello/gi, "");
            results.response = results.response.replace(/^hi/i, "");
             results.response = results.response.replace(/here/gi, "");
              results.response = results.response.replace(/this is/gi, "");
        session.dialogData.name = results.response.replace(/My name is/gi, "");        
        builder.Prompts.text(session, 'Hello ' + session.dialogData.name + ' Can i have your Employee id?');
    },
    function(session, results) {
        session.send("Thanks. How can i help you " + session.dialogData.name)
        session.dialogData.email = results.response;
        obj.u_name =  session.dialogData.name;
        obj.u_emp_id = results.response;
        
        //your code 
        //console.log(util.inspect(response,false,null)); 
        //obj = {};
        })
        session.endDialog();       
    }

])

.matches('None', (session, args) => {
    session.send('Hi! This is the None intent handler. You said: \'%s\'.', session.message.text);
})

.onDefault((session) => {
    //session.send(session);
    session.send('Sorry, I did not understand \'%s\'.', session.message.text); 
    
});





bot.dialog('/', intents);    


if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
} 


