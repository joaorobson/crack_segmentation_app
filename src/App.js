import React from "react";
import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import { loadGraphModel } from "@tensorflow/tfjs-converter";
const IMG_WIDTH = 448;
const IMG_HEIGHT = 448;

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      image: "http://placehold.it/180",
    };
  }

  componentDidMount = async () => {
    const cracksSegModel = await loadGraphModel(
      "http://localhost:3000/unet_js/model.json"
    );
    this.setState({ model: cracksSegModel });
  };

  arrayToImg = (arr, imgHeight, imgWidth) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    this.removeLastImage();

    // size the canvas to your desired image
    canvas.width = IMG_WIDTH;
    canvas.height = IMG_HEIGHT;

    // get the imageData and pixel array fr
    const imgData = ctx.getImageData(0, 0, IMG_WIDTH, IMG_HEIGHT);

    // manipulate some pixel elements
    let ix = 0;
    for (let i = 0; i < IMG_WIDTH * IMG_HEIGHT * 4; i += 4) {
      imgData.data[i + 1] = Math.round(arr[ix] * 255.0); // set every red pixel element to 255
      imgData.data[i + 3] = 255; // make this pixel opaque
      ix += 1;
    }

    // put the modified pixels back on the canvas
    ctx.putImageData(imgData, 0, 0);

    // create a new img object
    const image = new Image();

    // set the img.src to the canvas data url
    image.src = canvas.toDataURL();
    image.id = "predictedImage";
    image.height = imgHeight;
    image.width = imgWidth;
    image.style.opacity = 0.5;
    image.style.position = "absolute";
    image.style.top = "0";
    image.style.left = "0";

    // append the new img object to the page
    const div = document.getElementById("images");
    div.appendChild(image);
  };

  preprocessImage = async () => {
    const myImage = document.getElementById("crack_image");

    const data = tf.browser.fromPixels(myImage);
    let tensor = tf.image.resizeBilinear(data, [448, 448]); // 192,192
    tensor = tensor.reshape([1, 448, 448, 3]).div(tf.scalar(255));

    const { model } = this.state;
    const prediction = model.executeAsync(tensor);
    prediction
      .then((p) => {
        p.data()
          .then((predData) => {
            this.arrayToImg(predData, myImage.height, myImage.width);
            return null;
          })
          .catch((e) => {
            return null;
          });
        return null;
      })
      .catch((e) => {
        return null;
      });
  };

  predict = () => {
    this.preprocessImage();
  };

  removeLastImage = () => {
    const predictedImage = document.getElementById("predictedImage");
    if (predictedImage) {
      predictedImage.parentNode.removeChild(predictedImage);
    }
  };

  handleUpload = (event) => {
    this.removeLastImage();
    this.setState({ image: URL.createObjectURL(event.target.files[0]) });
  };
  render() {
    const { image } = this.state;
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          flexBasis: "80%",
          justifyContent: "space-around",
        }}
        className="App"
      >
        <h1>Choose an image to identify the presence of cracks on it</h1>
        <input className="input" type="file" onChange={this.handleUpload} />
        <div id="images" style={{ position: "relative" }}>
          <img
            style={{ maxWidth: "500px" }}
            id="crack_image"
            width="448"
            height="448"
            className="image"
            src={this.state.image}
          />
        </div>
        <button onClick={this.predict}>Predict</button>
      </div>
    );
  }
}

export default App;
