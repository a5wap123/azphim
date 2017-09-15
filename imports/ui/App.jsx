import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { createContainer } from 'meteor/react-meteor-data';
import "../../node_modules/video-react/dist/video-react.css";
import { Button, Grid, Row, Col, Panel, FormControl } from 'react-bootstrap';
import { Player } from 'video-react';
// import { DDP } from 'meteor/ddp-client'
const io = require('socket.io-client')
import { Films, Director, Category, Country } from '../api/phimmoi'
// App component - represents the whole app

const SocketEndpoint = 'http://192.168.8.154:5547';
const socket = io(SocketEndpoint, {
    transports: ['websocket'],
});

class App extends Component {
    state = {
        medias: '',
        src: 'https://media.w3.org/2010/05/sintel/trailer_hd.mp4',
        text: '',
        total: 0,
        pageIndex: 1
    }

    constructor(props) {
        super(props)
        console.log('constructor')
    }
    componentWillMount = () => {
        console.log('componentWillMount')
        
        socket.on('connect', () => {
            console.log(socket.id+' connected')
        })
        socket.on('disconnect', () => {
            console.log(socket.id+' disconnected')
        })
        //server send obj medias lại sau khi get từ mobile
        socket.on('sendLink', (ob) => {
            let i = ob.length - 1
            console.log(ob[i])

            this.setState({ src: ob[i].url })
        })
        //server sau khi get total thì gửi về
        socket.on('server-send-total',(total,pageIndex)=>{
            this.setState({total,pageIndex})
        })
    }
    componentDidMount = () => {
        console.log('componentDidMount')
       
    }
    handleSubmit(evt) {
        evt.preventDefault()
        let link = ReactDOM.findDOMNode(this.refs.urlFilm).value.trim()
        console.log(Meteor.status())
        socket.emit('getLink', link)
    }
    getFilmBo(e) {
        e.preventDefault()
        let key = ReactDOM.findDOMNode(this.refs.key).value.trim()
        let pageIndex = ReactDOM.findDOMNode(this.refs.pageIndex).value.trim()
        let urlLaster = ReactDOM.findDOMNode(this.refs.urlLaster).value.trim()
        socket.emit('gettotalfilm',key,pageIndex,urlLaster)
        // Meteor.call('gettotalfilm',key,pageIndex,urlLaster)
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
                                <Col xs={6} md={8}>
                                    <p>Số film: {this.props.films.length}</p>
                                <p>Số directors: {this.props.directors.length}</p>
                                <p>Số countrys: {this.props.countrys.length}</p>
                                <p>Số categorys: {this.props.categorys.length}</p>
                                    <FormControl type='text' ref="urlFilm" placeholder="Link xem phim" />
                                    <Button bsStyle='primary' onClick={this.handleSubmit.bind(this)} >Get film</Button>
                                </Col>
                                <Col xs={6} md={8}>
                                    <p>Số film: {this.state.total}</p>
                                    <p>page: {this.state.pageIndex}</p>
                                    <FormControl type='text' ref='key' placeholder="key" />
                                    <FormControl type='text' ref='pageIndex' placeholder="Page index" />
                                    <FormControl type='text' ref='urlLaster' placeholder="Url laster" />
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

    films: PropTypes.array.isRequired,
    directors: PropTypes.array.isRequired,
    countrys: PropTypes.array.isRequired,
    categorys: PropTypes.array.isRequired,

};
export default createContainer(() => {
    Meteor.subscribe('films')
    Meteor.subscribe('directors')
    Meteor.subscribe('countrys')
    Meteor.subscribe('categorys')
    return {
        films: Films.find({}).fetch(),
        directors: Director.find({}).fetch(),
        countrys: Country.find({}).fetch(),
        categorys: Category.find({}).fetch(),
    };
}, App);