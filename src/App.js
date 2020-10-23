import React from 'react';
import logo from './logo.svg';
import './App.css';
import * as tf from '@tensorflow/tfjs';
import {loadGraphModel} from '@tensorflow/tfjs-converter';

class App extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      image: "http://placehold.it/180"
    }
  }

  componentDidMount = async () => {
    const cracksSegModel = await loadGraphModel('http://localhost:3000/model_js/model.json')
		this.setState({model: cracksSegModel});
  }

	transpose = () => {
			
	
	}

	removeAlphaChannel = (image) => {
		var preprocessedImage = [];
		for(let i = 0;i < image.length;i++){
			if((i+1)%4 != 0){
				preprocessedImage.push(image[i]);
			}	
		}
		return preprocessedImage;

	}
	preprocessImage = () => {
    var myImage = document.getElementById('crack_image');
		var canvas = document.createElement('canvas');

		canvas.width = 448;
		canvas.height = 448;

		var ctx = canvas.getContext('2d');
		ctx.drawImage(myImage, 0, 0);

		var data = ctx.getImageData(0, 0, canvas.width, canvas.height);
		data = this.removeAlphaChannel(data.data);
		
		console.log('data', data);

	}

  predict = () => {
		this.preprocessImage();
  }


  handleUpload = (event) => {
    this.setState({image: URL.createObjectURL(event.target.files[0])});
  }

  render() {
		console.log(this.state.model);
    return (
      <div className="App">
        <h1>Choose an image to identify the presence of crack on it</h1>
        <input className="input" type='file' onChange={this.handleUpload} />
        <img id="crack_image" className="image" src={this.state.image} />
				<button onClick={this.predict}>Predict</button>
      </div>
    );
  }
}

export default App;
