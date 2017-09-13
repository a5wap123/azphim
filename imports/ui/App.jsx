import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import "../../node_modules/video-react/dist/video-react.css";
import { Button, Grid, Row, Col, Panel, FormControl } from 'react-bootstrap';
import { Player } from 'video-react';
const io = require('socket.io-client')
import { Films } from '../api/phimmoi'
// App component - represents the whole app

const SocketEndpoint = 'http://192.168.8.155:5547';
const socket = io(SocketEndpoint, {
    transports: ['websocket'],
});
class App extends Component {
    state = {
        isConnected: 'false',
        medias: '',
        src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
        text: '',
        total:0,
        pageIndex:1
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
            let i = ob.length - 1
            console.log(ob[i])

            this.setState({ src: ob[i].url })
        })
        socket.on('sendIO', (ob) => {
            console.log(ob)
        })
        socket.on('server-send-total',(total,pageIndex)=>{
            this.setState({total})
        })
    }
    componentDidMount = () => {
        console.log('componentDidMount')
        console.log(this.refs.row.getAttribute('class'));
    }
    handleSubmit(evt) {
        evt.preventDefault()
        //let link = ReactDOM.findDOMNode(this.refs.urlXemPhim).value.trim()
        let link = this.state.text
        socket.emit('getLink', link)
        this.setState({ text: '' })
    }
    handleChange(e) {
        this.setState({ text: e.target.value })
    }
    getFilmBo(e){
        e.preventDefault()
        let key  = ReactDOM.findDOMNode(this.refs.key).value.trim()
        let pageIndex  = ReactDOM.findDOMNode(this.refs.pageIndex).value.trim()
        socket.emit('gettotalfilm',key,pageIndex)
    }

    render() {
        return (
            <div className="container">
                <header>
                    <h1></h1>
                </header>
                <div>
                    <Panel header="Getfilm" bsStyle="primary">
                        <Grid>
                            <Row className="show-grid" ref='row'>
                                <Col xs={12} md={8}>
                                <p>Số film: {this.props.films.length}</p>
                                    <FormControl type='text' value={this.state.text} onChange={this.handleChange.bind(this)} placeholder="Link xem phim" />
                                    <Button bsStyle='primary' onClick={this.handleSubmit.bind(this)} >Get film</Button>
                                </Col>
                                <Col xs={6} md={4}>
                                <p>Số film: {this.state.total}</p>
                                <p>page: {this.state.pageIndex}</p>
                                <FormControl type='text' ref='key'  placeholder="key" />
                                <FormControl type='text' ref='pageIndex' placeholder="Page index" />
                                <Button bsStyle='primary' onClick={this.getFilmBo.bind(this)} >Get total film bộ</Button>
                                </Col>
                            </Row>
                        </Grid>
                    </Panel>

                </div>

               

                {/*                 
                
                <div style={{ width: 500, height: 350 }}>
                    <Player
                        playsInline
                        src={`${this.state.src}`}
                    />
                </div> */}

            </div>
        );
    }
}
App.propTypes = {
    films: PropTypes.array.isRequired
};
export default createContainer(() => {
    Meteor.subscribe('films');
    return {
        films: Films.find({}).fetch(),
    };
}, App);