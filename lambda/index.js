const Alexa = require("ask-sdk");
const ytlist = require("yt-list");
const ytdl = require("ytdl-core");
const i18next = require("i18next");
const sprintf = require("i18next-sprintf-postprocessor");

const languageLabels = {
    "en-GB":{
        translation: {
            WelcomeMessage: "Welcome to Audio Tube. Ask to play a video to start listening.",
            RepromptMessage: "You can say, play the Whitesnake, to begin.",
            NotSupportedMessage: "Sorry, this skill is not supported on this device.",
            GoodbyeMessage: "Goodbye!",
            NotValidMessage: "Sorry, this is not a valid command. Please say help to hear what you can say.",
            NowPlayingMessage: "Playing {{TrackInfo}}"
        }
    },
    "fr-FR":{
        translation: {
            WelcomeMessage: "Bienvenue sur Audio Tube. Demandez à lire une video pour commencer l'écoute.",
            RepromptMessage: "Dites, lire Whitesnake, pour commencer.",
            NotSupportedMessage: "Désolé, cette skill ne fonctionne pas avec ce dispositif.",
            GoodbyeMessage: "Au revoir!",
            NotValidMessage: "Désolé cette commande n'est pas valide. Demander l'aide pour connaître les commandes.",
            NowPlayingMessage: "Lecture de {{TrackInfo}}"
        }
    }
}

i18next.use(sprintf).init({
    overloadTranlationOptionHandler: sprintf.overloadTranslationOptionHandler,
    returnObjects: true,
    lng: "en-GB",
    resources: languageLabels
});


/* INTENT HANDLERS */

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "LaunchRequest"
    );
  },
  handle(handlerInput) {
    console.log("LaunchRequestHandler");
    i18next.changeLanguage(handlerInput.requestEnvelope.request.locale);
    const message = i18next.t("WelcomeMessage");
    const reprompt = i18next.t("RepromptMessage");
    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(reprompt)
      .getResponse();
  },
};

const CheckAudioInterfaceHandler = {
  async canHandle(handlerInput) {
    const audioPlayerInterface = (
      (((handlerInput.requestEnvelope.context || {}).System || {}).device || {})
        .supportedInterfaces || {}
    ).AudioPlayer;
    return audioPlayerInterface === undefined;
  },
  handle(handlerInput) {
      i18next.changeLanguage(handlerInput.requestEnvelope.request.locale);
      return handlerInput.responseBuilder
      .speak(i18next.t("NotSupportedMessage"))
      .withShouldEndSession(true)
      .getResponse();
  },
};

const GetVideoIntentHandler = {
  async canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "GetVideoIntent"
    );
  },
  handle(handlerInput) {
    console.log("GetVideo");
    const speechText =
      handlerInput.requestEnvelope.request.intent.slots.videoQuery.value;
    if (speechText) {
      return controller.search(handlerInput, speechText);
    } else {
      i18next.changeLanguage(handlerInput.requestEnvelope.request.locale);
      return handlerInput.responseBuilder
        .speak(i18next.t("RepromptMessage"))
        .getResponse();
    }
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    i18next.changeLanguage(handlerInput.requestEnvelope.request.locale);
    const speakOutput = i18next.t("WelcomeMessage");

    return handlerInput.responseBuilder
      .speak(speakOutput)
      .reprompt(speakOutput)
      .getResponse();
  },
};
const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      (Alexa.getIntentName(handlerInput.requestEnvelope) ===
        "AMAZON.CancelIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.StopIntent" ||
        Alexa.getIntentName(handlerInput.requestEnvelope) ===
          "AMAZON.PauseIntent")
    );
  },
  handle(handlerInput) {
    console.log("CancelAndStopIntentHandler");
    i18next.changeLanguage(handlerInput.requestEnvelope.request.locale);
    return controller.stop(handlerInput, i18next.t("GoodByeMessage"));
  },
};
const SystemExceptionHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type ===
      "System.ExceptionEncountered"
    );
  },
  handle(handlerInput) {
    console.log("SystemExceptionHandler");
    console.log(JSON.stringify(handlerInput.requestEnvelope, null, 2));
    console.log(
      `System exception encountered: ${handlerInput.requestEnvelope.request.reason}`
    );
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) ===
      "SessionEndedRequest"
    );
  },
  handle(handlerInput) {
    console.log("SessionEndedRequestHandler");
    // Any cleanup logic goes here.
    return handlerInput.responseBuilder.getResponse();
  },
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
  canHandle(handlerInput) {
    console.log(handlerInput.requestEnvelope.request.type);
    return true;
  },
  handle(handlerInput, error) {
    console.log("ErrorHandler");
    console.log(error);
    console.log(`Error handled: ${error.message}`);
    i18next.changeLanguage(handlerInput.requestEnvelope.request.locale);
    const message = i18next.t("NotValidMessage");

    return handlerInput.responseBuilder
      .speak(message)
      .reprompt(message)
      .getResponse();
  },
};

/**
 * Handle Audio Player Events
 */
const AudioPlayerEventHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type.startsWith("AudioPlayer.");
  },
  async handle(handlerInput) {
    const { requestEnvelope, responseBuilder } = handlerInput;
    const audioPlayerEventName = requestEnvelope.request.type.split(".")[1];

    console.log("AudioPlayerEventHandler");
    console.log(audioPlayerEventName);
    switch (audioPlayerEventName) {
      case "PlaybackStarted":
        break;
      case "PlaybackFinished":
        break;
      case "PlaybackStopped":
        break;
      case "PlaybackNearlyFinished":
        break;
      case "PlaybackFailed":
        break;
      default:
        throw new Error("Should never reach here!");
    }

    return responseBuilder.getResponse();
  },
};

/* HELPER FUNCTIONS */

const controller = {
  async search(handlerInput, query) {
    console.log(query);
    const data = await searchForVideos(query);
    return this.play(handlerInput, data.items[0]);
  },
  async play(handlerInput, audioInfo) {
    const { responseBuilder } = handlerInput;
    const playBehavior = "REPLACE_ALL";
    console.log("play");
    console.log(audioInfo);
    const audioFormat = await getAudioUrl(audioInfo.id.videoId);
    console.log(`${audioInfo.snippet.title}`);
    console.log(audioFormat.url);
    console.log(audioInfo.id.videoId);
    i18next.changeLanguage(handlerInput.requestEnvelope.request.locale);
    responseBuilder
      .speak(i18next.t("NowPlayingMessage", {TrackInfo: audioInfo.snippet.title}))
      .withShouldEndSession(true)
      .addAudioPlayerPlayDirective(
        playBehavior,
        audioFormat.url,
        audioInfo.id.videoId,
        0,
        null
      );
    return responseBuilder.getResponse();
  },
  async stop(handlerInput, message) {
    return handlerInput.responseBuilder
      .speak(message)
      .addAudioPlayerStopDirective()
      .getResponse();
  },
};

const searchForVideos = async (searchQuery) => {
  return await ytlist.searchVideos(searchQuery, null, 1);
}

const getAudioUrl = async (videoId) => {
  const audioInfo = await ytdl.getInfo(videoId, {});
  const audioFormat = await ytdl.chooseFormat(audioInfo.formats, {
    quality: "140",
  });
  return audioFormat;
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
  .addRequestHandlers(
    CheckAudioInterfaceHandler,
    LaunchRequestHandler,
    GetVideoIntentHandler,
    SystemExceptionHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler,
    AudioPlayerEventHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
