const xapi = require('xapi');
const wxAPIs = {
    //caminho de espaços
      'space': 'https://api.ciscospark.com/v1/rooms',
      //caminho de mensagens
      'message': 'https://api.ciscospark.com/v1/messages'
  
  };
    //chave de acesso do bot
  const accesstoken = '{bot access token here}';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


xapi.status.on('SystemUnit State NumberOfActiveCalls', (callCounter) => {
    if(callCounter == 1){
          xapi.command("UserInterface Message Alert Display", {
              Text: 'Sua chamada está pronta!'
              , Title: 'Confirmação de inicio de chamada'
              , Duration:2
          }).catch((error) => { console.error(error); });
    }
});


xapi.event.on('CallDisconnect', (event) => {
    if(event.Duration > 0){
        xapi.command("UserInterface Message Prompt Display", {
              Title: "Como foi sua experiência"
            , Text: 'Por favor, digue o que achou'
            , FeedbackId: 'callrating'
            , 'Option.1':'Foi incrível!!!'
            , 'Option.2':'Foi regular'
            , 'Option.3': 'Foi ruim!'
          }).catch((error) => { console.error(error); });
    }
    else{

    }
});


xapi.event.on('UserInterface Message TextInput Response', (event) => {
    switch(event.FeedbackId){
        case 'callrating':
                sleep(1000).then(() => {
                    xapi.command("UserInterface Message TextInput Display", {
                              Duration: 0
                            , FeedbackId: "feedback_step2"
                            , InputType: "SingleLine"
                            , KeyboardState: "Open"
                            , Placeholder: "Digite sua informação aqui"
                            , SubmitText: "Proximo"
                            , Text: "Por favor, nos diga como contatar você"
                            , Title: "Informação para contato"
                      }).catch((error) => { console.error(error); });
                });
              break;
        case 'feedback_step2':
            sleep(500).then(() => {
                xapi.command("UserInterface Message Alert Display", {
                    Title: 'Recibo de feedback'
                    , Text: 'Obrigado, tenha um ótimo dia!'
                    , Duration: 3
                }).catch((error) => { console.error(error); });
            });
            break;
    }
});



xapi.event.on('UserInterface Message Prompt Response', (event) => {
    var displaytitle = '';
    var displaytext = '';
    switch(event.FeedbackId){
        case 'callrating':
            switch(event.OptionId){
                case '1':
                    displaytitle = 'Obrigado!!';
                    xapi.command("UserInterface Message Alert Display", {Title: displaytitle, Text: displaytext, Duration: 8});
                    break;
                case '2':
                    displaytitle = ':-(';
                    displaytext = 'Ok, vamos nos esforçar mais da próxima vez';
                    xapi.command("UserInterface Message Alert Display", {Title: displaytitle, Text: displaytext, Duration: 8});
                    break;
                case '3':
                    xapi.command("UserInterface Message TextInput Display", {
                              Duration: 0
                            , FeedbackId: "feedback_step1"
                            , InputType: "SingleLine"
                            , KeyboardState: "Open"
                            , Placeholder: "Digite seu feedback aqui"
                            , SubmitText: "Next"
                            , Text: "Por favor nos diga o motivo de sua insatisfação, é muito importante para nós!"
                            , Title: "Sentimos muito"
                      }).catch((error) => { console.error(error); });
                      
                      xapi.event.on('UserInterface Message TextInput Response', (event) => {
                          //Colocar o id do espaço
                        sendWebexTeams(wxAPIs.message,'Post','{space id here}',event.Text)
                      });
                      
                    break;
                default:
                    displaytext = 'Hm, temos algum erro aqui';
            }
            break;
        case 'nocallrating':
            switch(event.OptionId){
                case '1':
                    displaytitle = ':-)';
                    displaytext = 'talvez devessemos fazer botões maiores';
                    break;
                case '2':
                    displaytitle = 'Oops';
                    displaytext = 'Ok, quer tentar debugar?';
                    break;
                case '3':
                    displaytitle = ':-(';
                    displaytext = 'Oops, talvez devessemos fazer uma interface mais limpa';
                    break;

                default:
                    displaytext = 'Hm, temos algum erro aqui';
            }
            xapi.command("UserInterface Message Alert Display", {
                Title: displaytitle
                , Text: displaytext
                , Duration: 5
            }).catch((error) => { console.error(error); });
    }
});

function sendWebexTeams(url, method, email, message) {
    //é importante cercar o comando por um try catch para não crashar os macros
      try {
        //comando de requisição http
          xapi.command('HttpClient ' + method, {
                      Header: ["Content-Type: application/json", "Authorization: Bearer " + accesstoken],
                      Url: url,
                      AllowInsecureHTTPS: 'True'
                  },
                  JSON.stringify({
                      "roomId": email,
                      "text": "feedback: "+message
                  })
              )
              .then((result) => {
                  console.log(message);
             // console.log(result);
               xapi.command('UserInterface Message Prompt Display', {
                  Title: 'Feedback enviado',
                  Text: message
                });
              })
              .catch((err) => {
                //exibe o erro no console caso tenha dado algum
                  console.log("failed: " + JSON.stringify(err));
                //exie o mesmo erro na parte visual
                   xapi.command('UserInterface Message Prompt Display', {
                   Title: 'Erro:',
                   Text: err.StatusCode
                 });
              });
      } catch (exception) {
          console.log("Erro ao enviar a mensagem");
      }
  }
