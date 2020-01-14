const xapi = require('xapi');

xapi.event.on('CallDisconnect', (event) => {
    if(event.Duration > 0){
        xapi.command("UserInterface Message Prompt Display", {Title: "Como foi a sua reunião", Text: 'Poderia avaliar', 'Opção 1':'Experiência muito boa', 'Opção 2':'Experiência regular', 'Opção 3': 'Experiência insatisfatória'});
    }
    else{
        xapi.command("UserInterface Message Prompt Display", {Title: "O que houve de errado?", Text: 'O que houve?', 'Opção 1':'Eu disquei um número errado', 'Opção 2':"Eu não sei" , 'Opção 3': 'Ops, botão errado'});
    }
});




xapi.event.on('UserInterface Message Prompt Response', (event) => {
    var displaytitle = '';
    var displaytext = '';
    switch(event.OptionId){
        case '1':
            displaytitle = ':-)';
            displaytext = 'Obrigado por responder ao formulário!';
            break;
        case '2':
            displaytitle = ':-\\';
            displaytext = 'Ok, vamos tentar melhorar para a próxima :-)';
            break;
        case '3':
            displaytitle = ':-(';
            displaytext = 'Vamos trabalhar para melhorar a sua experiência!';
            break;

        default:
            displaytext = 'Sem resposta!';
    }
    xapi.command("UserInterface Message Alert Display", {Title: displaytitle, Text: displaytext, Duration: 8});
});


