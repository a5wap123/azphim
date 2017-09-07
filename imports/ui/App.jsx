import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "../../node_modules/video-react/dist/video-react.css";
import { Player } from 'video-react';
const io = require('socket.io-client')
import Task from './Task.jsx';
import App1 from './App1.jsx';

// App component - represents the whole app

const SocketEndpoint = 'http://localhost:5547';
const socket = io(SocketEndpoint, {
    transports: ['websocket'],
});
export default class App extends Component {
    state = {
        isConnected: 'false',
        medias: '',
        src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4'
    }
    
    constructor(props) {
        super(props)
        console.log('constructor')
    }
    componentWillMount = () => {
        console.log('componentWillMount')

        socket.on('connect', () => {
            this.setState({ isConnected: 'true' })
        })
        socket.on('disconnect', () => {
            this.setState({ isConnected: 'false' })
        })
        socket.on('sendLink', (ob) => {
            let i = ob.length -1
            console.log(ob[i])

            this.setState({ src: ob[i].url })
        })
        socket.on('sendIO',(ob)=>{
            console.log(ob)
        })
        
    }
    componentDidMount = () => {
        console.log('componentDidMount')
    }
    handleSubmit(evt){
        evt.preventDefault()
        let link = ReactDOM.findDOMNode(this.refs.urlXemPhim).value.trim()
        socket.emit('webcalllink',link)
    }
    render() {
        return (
            <div className="container">
                <header>
                    <h1>test</h1>
                </header>
                <Task isConnected={this.state.isConnected} />
                <input type='text' ref='urlXemPhim' placeholder="Link xem phim" />
                <button onClick={this.handleSubmit.bind(this)} >Lấy link</button>
                <div style={{ width: 500, height: 350 }}>
                    <Player
                        playsInline
                        src={`${this.state.src}`}
                    />
                </div>

            </div>
        );
    }
}
