var builder = require("botbuilder");
//var botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');
//var stringTable = require('string-table');
var GlideRecord = require('servicenow-rest').gliderecord;
var gr = new GlideRecord('dev23926', 'u_chat_bot_import_set', 'kgs.bot', 'kgs.bot', 'v1')
var user = {};
var users = [];
var name = "";
var howAreYou = ["fine", "Everything is going extremely well", "I am fine , Thank you", "My logic and cognitive functions are normal", "I am doing fine", "Everything is running smoothly"]
var obj = {};
var LuisModelUrl = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2cf06f11-b527-4c08-9362-ef6c1b9929e6?subscription-key=9327da1f01de40889960a183403ff7c4&verbose=true&q=";

var connector =new builder.ChatConnector() ;
var bot = new builder.UniversalBot(connector);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(server.name + 'listening to' + server.url);
});

server.post('/api/messages', connector.listen()); // for emulator

//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
//var LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/54db5457-dd33-4dcd-9b64-32d9ccdc596b?subscription-key=9327da1f01de40889960a183403ff7c4&verbose=true&q=';

//var LuisModelUrl  = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2cf06f11-b527-4c08-9362-ef6c1b9929e6?subscription-key=9327da1f01de40889960a183403ff7c4&verbose=true&q=";
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var dialog = new builder.IntentDialog({
    recognizers: [recognizer],
    intentThreshold: 0.67
})

bot.dialog('/', dialog);




dialog.matches('Help', [
    function(session, args, next) {
        var help = ['Incident', 'Request', 'Status of Request'];
        builder.Prompts.choice(session, 'I can help you with the following', help);
        session.endDialog();
    }

]);

dialog.matches('Greeting', [
    function(session) {
        builder.Prompts.text(session, 'Hi. My name is Adam. May I know your name ?');
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
        builder.Prompts.text(session, 'Hello ' + session.dialogData.name + ' Can I have your Employee id?');
    },
    function(session, results) {
        session.send("Thanks. How can I help you " + session.dialogData.name)
        session.dialogData.email = results.response;
        obj.u_name = session.dialogData.name;
        obj.u_emp_id = results.response.toLowerCase();
        var gr = new GlideRecord('dev23926', 'sys_user', 'kgs.bot', 'kgs.bot', 'v1')
        gr.addEncodedQuery('^user_name=' + obj.u_emp_id)

        gr.query().then(function(result) {
            obj.userId = result[0].sys_id;
            
        })


        //gr.insert(obj).then(function(response){ 
        //your code 
        //console.log(util.inspect(response,false,null)); 
        // )
        session.endDialog();
    }

]);


dialog.matches('Incident', [
    function(session) {
        builder.Prompts.text(session, 'Can you please elaborate the issue?');
    },
    function(session, results) {
        obj.u_short_description = results.response;
        obj.u_asset_id = 'P1000479';
        obj.u_worknotes = 'test work note'

        gr.insert(obj).then(function(response) {
            //session.send("Incident created")
            //console.log("responce :"+util.inspect(response,false,null));
            //console.log(JSON.stringify(response));
            // session.send(JSON.stringify(response));
            // session.send("sys_id "+response.sys_target_sys_id.value);
            var sys_id = response.sys_target_sys_id.value;

            var gr1 = new GlideRecord('dev23926', 'incident', 'kgs.bot', 'kgs.bot', 'v1');
            gr1.addEncodedQuery('sys_id=' + sys_id);
            gr1.setReturnFields('number,short_description,assigned_to,state');
            gr1.query().then(function(result) {
                var state = ""
                if (result[0].state == 1) {
                    state = "New";
                } else if (result[0].state == 2) {
                    state = "Active";
                } else if (result[0].state == 3) {
                    state = "Awaiting Problem";
                } else if (result[0].state == 4) {
                    state = "Awaiting User";
                } else if (result[0].state == 5) {
                    state = "Awaiting Evidence";
                } else if (result[0].state == 6) {
                       state = "Resolved ";
                } else if (result[0].state == 7) {
                    state = "Closed ";
                }
                session.send(`An Incident has been created for this.

Incident Number is : ` + JSON.stringify(result[0].number)

                    +
                    ` Short Description : ` + result[0].short_description +

                    ` Your Incident is assigned_to : David Loo (davidloo@example.com)` + `

Incident State : ` + state);
                session.send('You will be contacted by the incident assignee in a short while');
            })

            //})


        })

    }

]);


dialog.matches('Request', [
    function(session) {
        //builder.Prompts.text(session, 'Can you Please ellaborate the issue?');
    },
    function(session, results) {
        obj.u_short_description = results.response;
        gr.insert(obj).then(function(response) {

            //console.log("responce :"+util.inspect(response,false,null));
            console.log(JSON.stringify(response));
            session.send(JSON.stringify(response));

        })

    }

]);

dialog.matches('Incident Status', [

    function(session) {
        var gr2 = new GlideRecord('dev23926', 'incident', 'kgs.bot', 'kgs.bot', 'v1');
        gr2.setReturnFields('number,short_description,assigned_to,state');
       // gr2.addEncodedQuery('^ORDERBYDESCsys_created_on^caller_id=' + obj.userId);
         gr2.addEncodedQuery('^caller_id=' + obj.userId);
        gr2.addEncodedQuery('^ORDERBYDESCsys_created_on');
        gr2.setLimit(1);
        gr2.query().then(function(result) { //returns promise 
            session.send('test')
                //console.log("Result : "+JSON.stringify(result));
            var state = ""
            if (result[0].state == 1) {
                state = "New";
            } else if (result[0].state == 2) {
                state = "Active";
            } else if (result[0].state == 3) {
                state = "Awaiting Problem";
            } else if (result[0].state == 4) {
                state = "Awaiting User";
            } else if (result[0].state == 5) {
                state = "Awaiting Evidence";
            } else if (result[0].state == 6) {
                state = "Resolved ";
            } else if (result[0].state == 7) {
                state = "Closed ";
            }
            session.send(`Your Incident Number is : ` + JSON.stringify(result[0].number)

                +
                ` Short Description : ` + result[0].short_description +

                ` Your Incident is assigned_to : David Loo (davidloo@example.com)` + `

Incident State : ` + state);
        })


    }

]);

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
// dialog.matches('None', (session, args) => {
//     session.send('Hi! This is the None intent handler. You said: \'%s\'.', session.message.text);
// })


dialog.onDefault(

    builder.DialogAction.send("Sorry, I did not understand. Please rephrase your question")

);

