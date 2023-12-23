import React, { Component } from 'react';
import NumInput from '../components/NumInput';
import DisplayFact from '../components/DisplayFact';
import TypesRadio from '../components/TypeRadio';
import ActionButton from '../components/ActionButton';
// import './App.css'

import { sttFromMic, textToSpeech, onClickAudioFileButton, handleMute } from './Azure_util';

class App extends Component {
  constructor() {
    super();
    this.state = {
        type: 'trivia',
        displayFact: '',
        displayNum: '',
        displayText: '',
        displaySource: '',
        player: {p: undefined, muted: false},
        recognizing: false
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
        });
    })
    .catch(err => console.log("Error JSON:", err));
  }
  render() {
    const {displayFact, displayNum, displayText, displaySource, recognizing} = this.state;
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
              <DisplayFact title={"The fun fact"} fact={displayFact} source={displayNum} action={() => textToSpeech(this)} recognizing={false}/>
            </div>
            <div className="row">
              <NumInput EnterNumber={this.onEnterNumber} ChangeNumber={this.onChangeNumber}/>
              <TypesRadio SelectType={this.onSelectType}/>
            </div>
            <div className="row">
              <div className="col-sm-10">
                  <ActionButton name="Request!" iconClass="nc-icon nc-send" action={this.onClickButton}/>
                  <ActionButton name="Read!" iconClass="nc-icon nc-button-play" action={() => textToSpeech(this)}/>
              </div>
            </div>
            <div className="title">
              <h3><small>Upload your audio file or record your speech to recognize.</small></h3>
            </div>
            <div className="row">
              <DisplayFact title={"The text"} fact={displayText} source={displaySource} recognizing={recognizing}/>
              <div className="col-sm-10">
                  <input className="btn btn-primary btn-round" type="file" id="audio-file" accept='audio/wav' onChange={ (e) => onClickAudioFileButton(this, e) } style={{display: "none"}} />
                  <button type="button" className="btn btn-primary btn-round"><i className="nc-icon nc-cloud-upload-94"></i><label htmlFor="audio-file" >Upload!</label></button>
                  <ActionButton name="Listen!" iconClass="nc-icon nc-button-power" action={() => sttFromMic(this)}/>
                  <ActionButton name="Pause/Resume" iconClass="nc-icon nc-button-pause" action={() => handleMute(this)}/>
              </div>
            </div>

        </div>
      </div>
    );
  }
}

export default App;

