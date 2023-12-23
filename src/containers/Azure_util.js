import axios from 'axios';
import Cookie from 'universal-cookie';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

export async function getTokenOrRefresh() {
    const cookie = new Cookie();
    const speechToken = cookie.get('speech-token');

    if (speechToken === undefined) {
        try {
            const res = await axios.get('http://localhost:3001/api/get-speech-token');
            const token = res.data.token;
            const region = res.data.region;
            cookie.set('speech-token', region + ':' + token, {maxAge: 540, path: '/'});

            // console.log('Token fetched from back-end: ' + token);
            return { authToken: token, region: region };
        } catch (err) {
            console.log(err.response.data);
            return { authToken: null, error: err.response.data };
        }
    } else {
        // console.log('Token fetched from cookie: ' + speechToken);
        const idx = speechToken.indexOf(':');
        return { authToken: speechToken.slice(idx + 1), region: speechToken.slice(0, idx) };
    }
}

export async function sttFromMic(myApp) {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    myApp.setState({displayText: 'speak into your microphone...'});

    recognizer.recognizeOnceAsync(result => {
        let text;
        if (result.reason === ResultReason.RecognizedSpeech) {
            text = `RECOGNIZED: ${result.text}`;
        } else {
            text = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
        }
        myApp.setState({displayText: text});
    });
  }

export async function textToSpeech(myApp) {
    const textToSpeak = myApp.state.displayFact;
    if (textToSpeak==='') return;

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    const myPlayer = new speechsdk.SpeakerAudioDestination();
    myApp.setState({player: {p: myPlayer }});
    const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(myApp.state.player.p);
    let synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
    myApp.setState({displayText: `speaking text: ${textToSpeak}...`});
    synthesizer.speakTextAsync(
        textToSpeak,
        result => {
            let text;
            if (result.reason === speechsdk.ResultReason.SynthesizingAudioCompleted) {
                text = `synthesis finished for "${textToSpeak}".\n`
            } else if (result.reason === speechsdk.ResultReason.Canceled) {
                text = `synthesis failed. Error detail: ${result.errorDetails}.\n`
            }
            synthesizer.close();
            synthesizer = undefined;
            myApp.setState({displayText: text});
        },
        function (err) {
            myApp.setState({displayFact: `Error: ${err}.\n`});
            synthesizer.close();
            synthesizer = undefined;
        });
}

export async function handleMute(myApp) {
    const myPlayer = myApp.state.player.p
    if (!myApp.state.player.muted) {
      myPlayer.pause()
      myApp.setState( {player: myPlayer, muted: true} );
    } else {
      myPlayer.resume()
      myApp.setState( {player: myPlayer, muted: false} );
    }
}

export async function onClickAudioFileButton (myApp, event) {
    const audioFile = event.target.files[0];
    const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

    myApp.setState({displaySource: fileInfo});

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
    const speechRecognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    myApp.setState({ displaySource: fileInfo, displayText: 'RECOGNIZED: ' });

    speechRecognizer.recognizing = (s, e) => {
      myApp.setState({ recognizing: true });
    };

    speechRecognizer.recognized = (s, e) => {
      let text = myApp.state.displayText
      if (e.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          text += `${e.result.text}`
      }
      else if (e.result.reason === speechsdk.ResultReason.NoMatch) {
          text = "NOMATCH: Speech could not be recognized."
      }
      myApp.setState({ displayText: text, recognizing: false });
    };
    speechRecognizer.canceled = (s, e) => {
      let text = `CANCELED: Reason=${e.reason}, Text=${e.result.text}`;
      if (e.reason === speechsdk.CancellationReason.Error) {
          console.log(`"CANCELED: ErrorCode=${e.errorCode}`);
          console.log(`"CANCELED: ErrorDetails=${e.errorDetails}`);
          console.log("CANCELED: Did you set the speech resource key and region values?");
      }
      myApp.setState({ displayText: text, recognizing: false });
      speechRecognizer.stopContinuousRecognitionAsync();
    };
    speechRecognizer.sessionStopped = (s, e) => {
      console.log("Session stopped")
      speechRecognizer.stopContinuousRecognitionAsync();
    };
    speechRecognizer.startContinuousRecognitionAsync();
}

