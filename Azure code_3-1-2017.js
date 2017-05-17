/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
//"use strict" ;
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var restify = require('restify');
var stringTable = require('string-table');
 var GlideRecord = require('servicenow-rest').gliderecord;
  var gr = new GlideRecord('dev12129', 'u_sectorize', 'admin', 'Password@123', 'v1')
var user = {};
var users = [];
var name ="";
var howAreYou = ["fine", "Everything is going extremely well", "I am fine , Thank you", "My logic and cognitive functions are normal", "I am doing fine", "Everything is running smoothly"]
 var obj = {};

var useEmulator = (process.env.NODE_ENV == 'development'); 

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
     appId: process.env['MicrosoftAppId'],

    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
/*
// Setup Restify Server
var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(server.name + 'listening to' + server.url);
});

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD,
    groupWelcomeMessage: 'Group Welcome Message Works!',
    userWelcomeMessage: 'User Welcome Message Works!',
    goodbyeMessage: 'Goodbye Message Works!'
});
var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen()); // for emulator
// Make sure you add code to validate these fields
*/
var bot = new builder.UniversalBot(connector);
//const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;
//var LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/54db5457-dd33-4dcd-9b64-32d9ccdc596b?subscription-key=9327da1f01de40889960a183403ff7c4&verbose=true&q=';
var LuisModelUrl = 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/1b1099a8-8401-4834-8c5b-4f942a2c484c?subscription-key=9327da1f01de40889960a183403ff7c4&timezoneOffset=0.0&verbose=true&q='
//var LuisModelUrl  = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/2cf06f11-b527-4c08-9362-ef6c1b9929e6?subscription-key=9327da1f01de40889960a183403ff7c4&verbose=true&q=";
// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var dialog = new builder.IntentDialog({
    recognizers: [recognizer],
    intentThreshold: 0.67
})
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/
bot.dialog('/', dialog);

/*
setTimeout(function () {

}, 2000); 
*/

dialog.matches('createAccount', [
    function(session, args, next) {
        var accounts = ['Savings Account', 'Current Account'];;
        var ca = builder.EntityRecognizer.findEntity(args.entities, 'currentAccount');
        var sd = builder.EntityRecognizer.findEntity(args.entities, 'savingsDeposit');

        if (ca && ca.score > 0.68) {
            session.beginDialog('/currentAccount');
        } else if (sd && sd.score > 0.68) {
            session.beginDialog('/savingsAccount');
        } else {
            builder.Prompts.choice(session, 'Which account do you want to start?', accounts);
            next();
        }
    },
    function(session, results) {
        session.endDialog();
    }
]);


dialog.matches(/how are you/g, function(session) {
    var random = Math.floor(Math.random() * (5 - 1 + 1) + 1);
    session.send(howAreYou[random] + ". How can i help you?");
    session.endDialog();
});

bot.dialog('/recurringDeposit', [
    function(session, args, next) {
        session.send('Please note, you need a savings account with us to open a Recurring Deposit. Please select from the following:');
 /*      var users = [
  {  Tenure: 'Upto 1 yr', Normal: '6.50% ', SeniorCitizen: '7.00%' },
  {  Tenure: '2 yrs', Normal: '6.75%', SeniorCitizen: '7.25%'},
  { Tenure: '3+ yrs', Normal: '7.00%', SeniorCitizen: '7.50%' }
];
var table = stringTable.create(users);
session.send =(table);
*/
        session.send(`Here are the available options for Recurring Deposit. Please select from the following:
        
------------Normal     Sr. Citz
            
Upto 1 yr:  6.50%      7.00%

2 yrs       :  6.75%      7.25%

3 yrs       :  7.00%      7.50%

3+ yrs     :  7.50%      8.00%
        `);
        builder.Prompts.confirm(session, 'Do you want to proceed?');
    },
    function(session, results) {
        if (results.response) {
             session.send("Great, let me mail you the list of documents required and link where you can apply online.")
        } else {
            session.send("Thank you for your interest, let me know if you need additional information.");
            session.endDialog();
        }

    }
]);


bot.dialog('/savingsAccount', [
    function(session, args, next) {
        var savings = ['Basic', 'Kids', 'Women', 'Senior Citizen'];
       // session.send('We offer 4 types of savings account. I can provide you further details on each of these, which one are you interested in?');
        builder.Prompts.choice(session, "We offer 4 types of savings account. I can provide you further details on each of these, which one are you interested in?", savings);
    },
    function(session, results) {
        if (results.response.entity == "Basic") {
           session.beginDialog('/basicAccount');
        } else if (results.response.entity == "Kids") {
            session.beginDialog('/kidsAccount');
        } else if (results.response.entity == "Women") {
            session.beginDialog('/womenAccount');
        } else if (results.response.entity == "Senior Citizen") {
            session.beginDialog('/seniorAccount');
        } else {
            session.send('Thank you for banking with us :)');
            session.endDialog();
        }
    }
]);

bot.dialog('/basicAccount', [
    function(session, args, next) {
 session.send(`A zero balance Savings Account with a free ATM card

Features and benefits of Basic Account

—	4% interest rate 

—	Free IVR based PhoneBanking

—	Four Free Cash withdrawal per month

—	No Initial Payment required 

Eligibility

—	Any resident individual (sole or joint) or HUF 
`);
            builder.Prompts.confirm(session,"Do you want to proceed?");
    }, function(session, results) {
        if (results.response) {
            session.send('Okay, let me mail you the list of documents required and link where you can apply online. Is there anything else that i can help you with? ');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);


bot.dialog('/kidsAccount', [
    function(session, args, next) {
  session.send(`Features and benefits of Kids Account

Kids

    -4% interest rate 
    
    -Debit Card issued to children between 7-18 years of age
     
    -ATM withdrawal limit: Rs.2,500 

Parents 

    -Free Education Insurance cover of Rs.1,00,000 

Eligibility 

    -Kid’s Advantage Account for minors 
    
    -Pre-commissioned savings bank account
`);
            builder.Prompts.confirm(session,"Do you want to proceed?");
    }, function(session, results) {
        if (results.response) {
            session.send('Okay, let me mail you the list of documents required and link where you can apply online. Is there anything else that i can help you with?');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);


bot.dialog('/womenAccount', [
    function(session, args, next) {
 session.send(`Features and benefits of Women Account

—	Sweep-out facility

—	Personal Accident Death Cover of Rs.10 lac

—	Accidental Hospitalisation cover of Rs 1 lac per annum cover

—	Advantage Debit Card with CashBack offer

Eligibility

—	The first account holder should be a woman

—	A resident individual 

—	A foreign national

—	Rs.10,000 minimum balance requirement

`);
            builder.Prompts.confirm(session,"Do you want to proceed?");
    }, function(session, results) {
        if (results.response) {
            session.send('Okay, let me mail you the list of documents required and link where you can apply online. Is there anything else that i can help you with?');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);


bot.dialog('/seniorAccount', [
    function(session, args, next) {
  session.send(`Features and benefits of Senior Account

—	Accidental Hospitalisation Cover of Rs 50,000 per annum

—	Debit Card free for life (for the first applicant)

Eligibility

—	All resident individuals (sole or joint) in the age group of 60 years

—	The first applicant has to be a senior citizen

—	Rs.5,000 minimum balance requirement

`);
            builder.Prompts.confirm(session,"Do you want to proceed?");
    }, function(session, results) {
        if (results.response) {
            session.send('Okay, let me mail you the list of documents required and link where you can apply online. Is there anything else that i can help you with?');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);

bot.dialog('/currentAccount', [
    function(session, args, next) {
 session.send(`Features and benefits of Current Account
 
—	Cash Deposits up to Rs. 200 lakhs pm

—	Cash Withdrawal facility up to  Rs.75 lacs pm

—	Free local/ intercity cheque collection & payment 

—	Free Pay Orders (PO) & Demand Draft (DD) 

Eligibility

—	Resident Individual

—	Hindu Undivided Family

—	Sole Proprietorship Firms

—	Partnership Firms

—	Private and Public Limited Companies
 
`);
            builder.Prompts.confirm(session,"Do you want to proceed?");
    }, function(session, results) {
        if (results.response) {
            session.send('Okay, let me mail you the list of documents required and link where you can apply online. Is there anything else that i can help you with?');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);


dialog.matches('createDeposit', [
    function(session, args, next) {
        var deposit = ['Fixed Deposit', 'Recurring Deposit'];
        var fd = builder.EntityRecognizer.findEntity(args.entities, 'fixedDeposit');
        var rd = builder.EntityRecognizer.findEntity(args.entities, 'recurringDeposit');

        if (fd && fd.score > 0.7) {
            session.beginDialog('/fixedDeposit');
        } else if (rd && rd.score > 0.7) {
            session.beginDialog('/recurringDeposit');
        } else {
            builder.Prompts.choice(session, 'we offer two categories of account. Which one are you looking for?', deposit);
            next();
        }
    },
    function(session, results) {
        session.endDialog();
    }
]);

bot.dialog('/fixedDeposit', [
    function(session, args, next) {
        session.send('Please note, you need a savings account with us to open a Fixed Deposit. Please select from the following:');
                session.send(`Here are the available options for Fixed Deposit. Please select from the following:
        
------------Normal     Sr. Citz
            
Upto 1 yr:  6.50%      7.00%

2 yrs       :  6.75%      7.25%

3 yrs       :  7.00%      7.50%

3+ yrs     :  7.50%      8.00%
        `);
        builder.Prompts.confirm(session, 'Do you want to proceed?');
    },
    function(session, results) {
        if (results.response) {
             session.send("Great, let me mail you the list of documents required and link where you can apply online.");
             session.endDialog();
            
        } else {
            session.send("Thank you for your interest, let me know if you need additional information.");
            session.endDialog();
        }

    }
]);


bot.dialog('/fixedInterest', [
    function(session, args, next) {
        session.send('Our Fixed deposit scheme provides you an interest rate of 7.5% (8% for senior citizen) for a tenure of 1 year');
        session.beginDialog('/fixedCustomer');
    }
]);
bot.dialog('/fixedCustomer', [
    function(session, args, next) {
        builder.Prompts.confirm(session, 'If you are interested click yes');
    },
    function(session, results) {
        if (results.response) {
            session.send('Okay, let me mail you the list of documents required and link where you can apply online. Is there anything else that i can help you with?');
            session.endDialog();
        } else {
            session.send('Thank you for banking with us. Have a great day');
            session.endDialog();
        }
    }
]);
bot.dialog('/savingsInterest', [
    function(session, args, next) {
        session.send('Our Savings deposit scheme provides you an interest rate of 4% (4.5% for senior citizen)');
        session.endDialog();
    }
]);
bot.dialog('/recurringInterest', [
    function(session, args, next) {
        session.send('Recurring deposit scheme provides you an interest rate of 7% (8% for senior citizen) for a tenure of 1 year');
        session.endDialog();
    }
]);

dialog.matches('newCard', [
    function(session, args, next) {
        var cards = ['Credit card', 'Debit Card'];
        var cd = builder.EntityRecognizer.findEntity(args.entities, 'creditCard');
        var dd = builder.EntityRecognizer.findEntity(args.entities, 'debitCard');
        if (cd && cd.score > 0.7) {
            session.beginDialog('/creditCard');
        } else if (dd && dd.score > 0.7) {
            session.beginDialog('/debitCard');
        } else {
            builder.Prompts.choice(session, 'Choose a type of card', cards);
            next();
        }
    },
    function(session, results) {
        session.endDialog();
    }
]);
bot.dialog('/creditCard', [
    function(session, args, next) {
        builder.Prompts.confirm(session, 'To apply for a credit card your annual income should be more than 2.5 lak. Do you wish to continue ?');
    },
    function(session, results) {
        if (results.response) {
            session.send('Thats Great! Our customer service representative will contact you within 2 days and you have to provide 2 Passport size photo and xerox of Pan card and Aadhar card. Thank you for banking with us :)');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);
bot.dialog('/debitCard', [
    function(session, args, next) {
        builder.Prompts.confirm(session, 'Applying a new debit card is absolutly free. Do you wish to submit a request ?');
    },
    function(session, results) {
        if (results.response) {
            session.send('Cool! Your request for new debit card has been submitted succesfully ! Thank you for banking with us');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);


dialog.matches('resetPin', [
    function(session, args, next) {
        builder.Prompts.confirm(session, "Do you wish to change your pin?");
    },
    function(session, results, next) {
        if (results.response) {
            session.beginDialog('/otpVerification');
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }

    }
]);

bot.dialog('/otpVerification', [
    function(session, args, next) {
        builder.Prompts.text(session, 'OTP has been send to your registered mobile.Please confirm it to verify ');
    },
    function(session, results) {
        if (results.response == 112233) {
            builder.Prompts.text(session, 'OTP verified ! please enter the new PIN');
        } else {
            session.send('Wrong OTP.Please try again');
            session.endDialog();
        }
    },
    function(session, results, next) {
        session.send("Pin Changed to " + results.response+" !");
        session.endDialog();
    }
]);

dialog.matches('interestRate', [
    function(session, args, next) {
        var accounts = ['Deposit', 'Account', 'Loan'];
        var fd = builder.EntityRecognizer.findEntity(args.entities, 'fixedDeposit');
        var rd = builder.EntityRecognizer.findEntity(args.entities, 'recurringDeposit');
        var sd = builder.EntityRecognizer.findEntity(args.entities, 'savingsDeposit');
        if (fd && fd.score > 0.7) {
            session.beginDialog('/fixedInterest');
        } else if (rd && rd.score > 0.7) {
            session.beginDialog('/recurringInterest');
        } else if (sd && sd.score > 0.7) {
            session.beginDialog('/savingsInterest');
        } else {
            builder.Prompts.choice(session, 'To know the interest rate select a category from below', accounts);
            next();
        }
    },
    function(session, results) {

        if (results.response == "Fixed Deposit") {
            session.beginDialog('/fixedInterest');
        } else if (results.response == "Recurring Deposit") {
            session.beginDialog('/recurringInterest');
        } else if (results.response == "Savings Deposit") {
            session.beginDialog('/savingsInterest');
        } else {

            session.endDialog();
        }
    }
]);
//-------------------------- LOANs-----------------------------------------
dialog.matches('loan', [
    function(session, args, next) {
        var loan = ['Home Loan', 'Personal Loan','Educational Loan','Car Loan'];
        var hl = builder.EntityRecognizer.findEntity(args.entities, 'homeLoan'); 
        var pl = builder.EntityRecognizer.findEntity(args.entities, 'personalLoan');
        var el = builder.EntityRecognizer.findEntity(args.entities, 'educationalLoan');
        var cl = builder.EntityRecognizer.findEntity(args.entities, 'carLoan');

        if (hl && hl.score > 0.7) {
            session.beginDialog('/homeLoan');
        } else if (pl && pl.score > 0.68) {
            session.beginDialog('/personalLoan');
        } else if (el && el.score > 0.68) {
            session.beginDialog('/educationalLoan');
        }else if (cl && cl.score > 0.68) {
            session.beginDialog('/carLoan');
        }else {
            builder.Prompts.choice(session, 'Select a type of loan you are looking for', loan);
            next();
        }
    },
    function(session, results) {
        session.endDialog();
    }
]);

bot.dialog('/homeLoan', [
    function(session, args, next) {
        session.send(`Features and benefits of Home loan
        
—	Home Loan for purchase or construct of  houses

—	Home Improvement Loan for internal and external repairs

—	Home Extension Loan for adding more space to the existing home
`);
        builder.Prompts.confirm(session, 'Do you wish to continue ?');
    },
    function(session, results) {
        if (results.response) {
            session.send('Thats Great! Our customer service representative will contact you within 2 days and you have to provide 2 Passport size photo and xerox of Pan card and Aadhar card. Thank you for banking with us :)');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);

bot.dialog('/personalLoan', [
    function(session, args, next) {
        session.send(`Features and benefits of Personal loan
        
—	Personal loan eligibility in 1 minute available online and across all branches

—	Special personal loan offers for women 
Eligibility

—	21-60 years of age

—	Working for at least 2 years 

—	Minimum earning of Rs. 12,000/- pm

`);
        builder.Prompts.confirm(session, 'Do you wish to continue ?');
    },
    function(session, results) {
        if (results.response) {
            session.send('Thats Great! Our customer service representative will contact you within 2 days and you have to provide 2 Passport size photo and xerox of Pan card and Aadhar card. Thank you for banking with us :)');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);

bot.dialog('/educationalLoan', [
    function(session, args, next) {
        session.send(`Features and benefits of Educational loan
        
—	Avail tax benefits under section 80(E) 

—	Insurance cover 

—	Preferential rates for top ranked universities / institutes
Eligibility

—	Indian resident

—	Aged between 16 - 35 years

—	Collateral security for loan over Rs. 7.5 Lakh,


`);
        builder.Prompts.confirm(session, 'Do you wish to continue ?');
    },
    function(session, results) {
        if (results.response) {
            session.send('Thats Great! Our customer service representative will contact you within 2 days and you have to provide 2 Passport size photo and xerox of Pan card and Aadhar card. Thank you for banking with us :)');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);

bot.dialog('/carLoan', [
    function(session, args, next) {
        session.send(`Features and benefits of car loan
        
—	Up to 100% finance

—	Check Car Loan eligibility in 1 minute

—	Approval of Car loan in 30 minutes


`);
        builder.Prompts.confirm(session, 'Do you wish to continue ?');
    },
    function(session, results) {
        if (results.response) {
            session.send('Thats Great! Our customer service representative will contact you within 2 days and you have to provide 2 Passport size photo and xerox of Pan card and Aadhar card. Thank you for banking with us :)');
            session.endDialog();
        } else {
            session.send('Thank you for your interest, let me know if you need additional information.');
            session.endDialog();
        }
    }
]);


dialog.matches('balance', [
    function(session, args, next) {
         builder.Prompts.confirm(session,"Apologies, I do not have authority to share customer specific details");
//    } ,  function(session, results) {
//        if (results.response) {
//             session.send('Thank you. Look forward to similar charities in future ;) ');
//            session.endDialog();
//        } else {
//            session.send('Ahh.. Never mind :P ');
//            session.endDialog();
//        }
        session.endDialog();
   }
]);

dialog.matches('help', [
    function(session, args, next) {
        var help = ['Accounts', 'Deposits','Loans','Interest rates','Pin Change','Request a new card','Reset pin'];
        builder.Prompts.choice(session, 'I can help you with the following', help);
         session.endDialog();
    }
 
]);

dialog.matches('acknowledge', [
    function(session, args, next) {
         builder.Prompts.confirm(session, 'Is there anything else that i can help you with?');
     
     },
    function(session, results) {
        if (results.response) {
            session.endDialog();
        } else {
            session.send('Thank you for your interest. Have a nice day :) ');
            session.endDialog();
        }
    }
 
]);



dialog.matches('greeting', [
    function(session) {
        builder.Prompts.text(session, 'Hi. Welcome to the BCM booth at SectoRize. My name is Adam. May I know your name ?');
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
        builder.Prompts.text(session, 'Hello ' + session.dialogData.name + ' Can i have your email id?');
    },
    function(session, results) {
        session.send("Thanks. How can i help you " + session.dialogData.name)
        session.dialogData.email = results.response;
        obj.u_name =  session.dialogData.name;
        obj.u_email = results.response;
        gr.insert(obj).then(function(response){ 
        //your code 
        //console.log(util.inspect(response,false,null)); 
        obj = {};
        })
        session.endDialog();       
    }

]);

dialog.onDefault(
    
    builder.DialogAction.send("Sorry, I did not understand. Please rephrase your question")
 
    );


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

 // for emulator
