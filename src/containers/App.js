import React, { Component } from 'react';
import NumInput from '../components/NumInput';
import DisplayFact from '../components/DisplayFact';
import TypesRadio from '../components/TypeRadio';

class App extends Component {
  constructor() {
    super();
    this.state = {
        type: 'trivia',
        displayFact: '',
        displayNum: '',
        displayDate: ''
    }
  }

  onEnterNumber = (event) => {
    if (event.key!=="Enter") {
      return;
    }
    this.requestNumAPI(event.target.value);
  }

  onChangeNumber = (event) => {
    let num = event.target.value
    if (isNaN(num)) {
      return;
    }
    this.setState({displayNum: num})
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
          displayDate: data.date + data.year
        });
    })
    .catch(err => console.log("Error JSON:", err));
  }
  render() {
    const {displayFact, displayNum, displayDate} = this.state;
    let date = ''
    if (!isNaN(displayDate)) date = displayDate;
    return (
      <div className='main'>
        <div className="container">
            <div className="title">
              <h3>Numerous Commands
                <br/>
                <small>Type your number and listen for a fun fact associated with it.</small>
              </h3>
            </div>
            <TypesRadio SelectType={this.onSelectType}/>
            <NumInput EnterNumber={this.onEnterNumber} ChangeNumber={this.onChangeNumber} ClickButton={this.onClickButton}/>
            <DisplayFact fact={displayFact} number={displayNum} date={date}/>
        </div>
      </div>
    );
  }
}

export default App;

