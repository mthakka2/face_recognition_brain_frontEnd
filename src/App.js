import React, { Component } from 'react';
import Particles from 'react-particles-js';
import FaceRecognition from './Components/FaceRecognition/FaceRecognition';
import Navigation from './Components/Navigation/Navigation';
import Signin from './Components/Signin/Signin';
import Register from './Components/Register/Register';

import Logo from './Components/Logo/Logo';
import Rank from './Components/Rank/Rank';
import ImageLinkForm from './Components/ImageLinkForm/ImageLinkForm'
//import Clarifai from 'clarifai';

import './App.css';

// const app = new Clarifai.App({
//  apiKey: '85e97b18b08e487fa66a2e6cb60a8bfa'
// });

const particlesOptions = {
               particles: {
                  number : {
                    value: 100,
                    density : {
                      enable : true,
                      value_area: 800   
                    }
                  }
                  }

                 
              
}              

const initialState = {

      input : '',
      imageUrl: '',
      box: {},
      route: 'signin',
      isSignedIn : false,
        user: {
         id: '',
        name: '',
        email: '',
        entries: 0,
        joined: ''
        }
    }

class App extends Component {
  constructor(){
    super();
    this.state = initialState;
    // this.state = {
    //   input : '',
    //   imageUrl: '',
    //   box: {},
    //   route: 'signin',
    //   isSignedIn : false,
    //     user: {
    //      id: '',
    //     name: '',
    //     email: '',
    //     entries: 0,
    //     joined: ''
    //     }
    // }
  }


  loadUser = (data) => {
    console.log(data);
    this.setState( {user:{
        email: data.email,
        name: data.name,
        id: data.id,
        entries: data.entries,
        joined: data.joined

    }})
  }

 

  calculateFaceLocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputimage');
    const width = Number(image.width);
    const height = Number(image.height);
    return{
      leftCol: clarifaiFace.left_col * width,
      topRow: clarifaiFace.top_row * height,
      rightCol: width - (clarifaiFace.right_col * width),
      bottomRow: height - (clarifaiFace.bottom_row * height)
    }

  }

  displayFaceBox = (box) => {
    console.log(box);
    this.setState({box: box})
  }

  onInputChange = (event) => {
    this.setState({input : event.target.value});
  }

  onButtonSubmit = () => {
    this.setState({imageUrl : this.state.input});
    // app.models.predict(
    //   Clarifai.FACE_DETECT_MODEL, this.state.input)
    fetch('https://secure-atoll-51459.herokuapp.com/imageurl' ,{
          method: 'post',
          headers: {'Content-Type' : 'application/json'},
          body: JSON.stringify({
          input: this.state.input
          //password: this.state.signInPassword
        })
        })
    .then(response => response.json())
    .then (response => {
      if(response){
        fetch('https://secure-atoll-51459.herokuapp.com/image' ,{
          method: 'put',
          headers: {'Content-Type' : 'application/json'},
          body: JSON.stringify({
          id: this.state.user.id
          //password: this.state.signInPassword
        })
        })
          .then(response => response.json())
          .then(count => {
              this.setState(Object.assign(this.state.user, {entries:count}))
                   
           })
          .catch(console.log)
      }
        this.displayFaceBox(this.calculateFaceLocation(response))
      })
    
    .catch(err => console.log(err));
  }


  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState(initialState)
    } else if(route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route});
  }

  

  render() {
   const {isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Particles className = 'particles' 
              params={particlesOptions}
            />

              <Navigation isSignedIn = {isSignedIn} onRouteChange = {this.onRouteChange}/>

              {
               
                  route === 'home' ?
                  <div>
                  <Logo />
                  <Rank name = {this.state.user.name} entries = {this.state.user.entries}/>
            
                  <ImageLinkForm 
                  onInputChange = {this.onInputChange} onButtonSubmit = {this.onButtonSubmit}/>
            
                  <FaceRecognition box = {box} imageUrl={imageUrl} />
                </div>
                  :(
                  route === 'signin' ?
                  <Signin loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
                  :
                  <Register loadUser = {this.loadUser} onRouteChange = {this.onRouteChange}/>
                  )

                }

      </div>
    );
  }
}

export default App;
