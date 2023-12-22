import React, { Component } from 'react';
import NumInput from '../components/NumInput';
import DisplayFact from '../components/DisplayFact';
import TypesRadio from '../components/TypeRadio';
// import './App.css'

import { getTokenOrRefresh } from './token_util';
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';
import ActionButton from '../components/ActionButton';
const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

class App extends Component {
  constructor() {
    super();
    this.state = {
        type: 'trivia',
        displayFact: '',
        displayNum: '',
        displayText: '',
        displaySource: '',
        player: {p: undefined, muted: false}
    }
  }

  onEnterNumber = (event) => {
    if (event.key!=="Enter") {
      return;
    }
    this.requestNumAPI(event.target.value);
  }

  onChangeNumber = (event) => {
    let num = event.target.value;
    if (isNaN(num)) {
      return;
    }
    this.setState({displayNum: num});
  }

  onClickButton = (event) => {
    if (this.state.displayNum!=='') this.requestNumAPI(this.state.displayNum);
  }

  sttFromMic = async function () {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';
    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    this.setState({displayFact: 'speak into your microphone...'});

    recognizer.recognizeOnceAsync(result => {
        let text;
        if (result.reason === ResultReason.RecognizedSpeech) {
            text = `RECOGNIZED: ${result.text}`;
        } else {
            text = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
        }
        this.setState({displayFact: text});
    });
  }

  textToSpeech = async function () {
    const textToSpeak = this.state.displayFact;
    if (textToSpeak==='') return;

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    const myPlayer = new speechsdk.SpeakerAudioDestination();
    this.setState({player: {p: myPlayer }});
    const audioConfig = speechsdk.AudioConfig.fromSpeakerOutput(this.state.player.p);
    let synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
    this.setState({displayText: `speaking text: ${textToSpeak}...`});
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
        this.setState({displayText: text});
      },
      function (err) {
        this.setState({displayFact: `Error: ${err}.\n`});
        synthesizer.close();
        synthesizer = undefined;
    });
  }

  handleMute = async function () {
    const myPlayer = this.state.player.p
    if (!this.state.player.muted) {
      myPlayer.pause()
      this.setState( {player: myPlayer, muted: true} );
    } else {
      myPlayer.resume()
      this.setState( {player: myPlayer, muted: false} );
    }
  }

  onClickAudioFileButton = async function (event) {
    const audioFile = event.target.files[0];
    const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

    this.setState({displaySource: fileInfo});

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'en-US';

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(result => {
        let text;
        if (result.reason === ResultReason.RecognizedSpeech) {
            text = `RECOGNIZED: ${result.text}`
        } else {
            text = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
        }

        this.setState({
          displaySource: fileInfo,
          displayText: text
        });
      });
  }

  onSelectType = (event) => {
    this.setState({type: event.target.value});
  }

  requestNumAPI = (num) => {
    if (isNaN(num)) {
      alert("Insert only numbers", num);
      return;
    }
    const url = 'http://numbersapi.com/' + num + '/' + this.state.type + '?json';
    fetch(url)
    .then(response => response.json())
    .then(data => {
        this.setState( {
          displayFact: data.text,
          displayNum: data.number,
          displayDate: data.date + data.year
        });
    })
    .catch(err => console.log("Error JSON:", err));
  }
  render() {
    const {displayFact, displayNum, displayText, displaySource} = this.state;
    return (
      <div className='main'>
        <div className="container">
            <div className="title">
              <h3>Numerous Commands
                <br/>
                <small>Type your number and listen for a fun fact associated with it.</small>
              </h3>
            </div>

            <div className="row">
              <DisplayFact title={"The fun fact"} fact={displayFact} source={displayNum} action={() => this.textToSpeech()}/>
            </div>
            <div className="row">
              <NumInput EnterNumber={this.onEnterNumber} ChangeNumber={this.onChangeNumber}/>
              <TypesRadio SelectType={this.onSelectType}/>
            </div>
            <div className="row">
              <div className="col-sm-10">
                <ActionButton name="Request!" iconClass="nc-icon nc-send" action={this.onClickButton}/>
                <ActionButton name="Read!" iconClass="nc-icon nc-button-play" action={() => this.textToSpeech()}/>
              </div>
            </div>
            <br/>
            <div className="row">
              <DisplayFact title={"The text"} fact={displayText} source={displaySource}/>
              <div className="col-sm-10">
                <input className="btn btn-primary btn-round" type="file" id="audio-file" accept='audio/wav' onChange={ (e) => this.onClickAudioFileButton(e) } style={{display: "none"}} />
                <button type="button" className="btn btn-primary btn-round"><i className="nc-icon nc-cloud-upload-94"></i><label htmlFor="audio-file" >Convert!</label></button>

                <ActionButton name="Listen!" iconClass="nc-icon nc-button-power" action={() => this.sttFromMic()}/>
                <ActionButton name="Pause/Resume!" iconClass="nc-icon nc-button-pause" action={() => this.handleMute()}/>

              </div>
            </div>

        </div>
      </div>
    );
  }
}

export default App;

