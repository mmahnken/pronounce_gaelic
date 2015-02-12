/** @jsx React.DOM */

var WordRow = React.createClass({
    getInitialState: function() {
        // initialize necessary vars in cDM 
    },
    componentDidMount: function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        var audioContext = new AudioContext();
        var audioInput = null,
            realAudioInput = null,
            inputPoint = null,
            audioRecorder = null;
        var rafID = null; // ?
    },
    gotStream: function(stream) {
        inputPoint = audioContext.createGain();

        // Create an AudioNode from the stream.
        realAudioInput = audioContext.createMediaStreamSource(stream);
        audioInput = realAudioInput;
        audioInput.connect(inputPoint);

        //    audioInput = convertToMono( input );

        audioRecorder = new Recorder( inputPoint );

        zeroGain = audioContext.createGain();
        zeroGain.gain.value = 0.0;
        inputPoint.connect( zeroGain );
        zeroGain.connect( audioContext.destination );
    },
    getUserAudio: function() {
        if (!navigator.getUserMedia)
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
        if (!navigator.cancelAnimationFrame)
            navigator.cancelAnimationFrame = navigator.webkitCancelAnimationFrame || navigator.mozCancelAnimationFrame;
        if (!navigator.requestAnimationFrame)
            navigator.requestAnimationFrame = navigator.webkitRequestAnimationFrame || navigator.mozRequestAnimationFrame;

        navigator.getUserMedia(
            {
                "audio": {
                    "mandatory": {
                        "googEchoCancellation": "false",
                        "googAutoGainControl": "false",
                        "googNoiseSuppression": "false",
                        "googHighpassFilter": "false"
                    },
                    "optional": []
                },
            }, this.gotStream, function(e) {
                alert('Error getting audio');
                console.log(e);
        });
    },
    render: function() {
        return (
                <li className="list-group-item">
                    <div className="row">
                        <div className="col-md-4">
                            <dl>
                                <dt>{this.props.word.word}</dt>
                                <dd>{this.props.word.english_usage}</dd>
                            </dl>
                            <audio controls>
                                <source src={this.props.word.url} type="audio/mpeg"></source>
                            </audio>
                        </div>
                        <div className="col-md-4">
                            <input type="submit" value="Pronounce it!" onClick={this.getUserAudio} className="btn btn-primary" />
                        </div>
                    </div>
                </li>
        );
    }
});

var WordArea = React.createClass({
    render: function() {
        var words_list = [];
        this.props.words.forEach(function(word) {
            console.log(word);
            words_list.push(<WordRow word={word} />);
        });
        return (
            <ul className="list-group">{words_list}</ul>
        );
    }
});

var Game = React.createClass({
    getInitialState: function() {
        return ({
            playing: false,
            words: []
        });
    },
    loadWords: function() {
        $.ajax({
            url: this.props.wordsUrl,
            datatype: 'json',
            type: 'get',
            success: function(data) {
                this.setState({
                    words: data.words
                });
            }.bind(this)
        });
    },
    checkForUserMedia: function() {
        return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia || navigator.msGetUserMedia);
    },
    componentWillMount: function() {
        if (this.checkForUserMedia()) {
            alert('You can play the game.')
        } else {
            alert('getUserMedia() is not supported in your browser');
        }
        this.loadWords();
    },
    render: function(){
        return (
            <div>
                <WordArea words={this.state.words} />
            </div>
            );
    }
});

var Test = React.createClass({
    render: function() {
        return (<p>HEY </p>);
    }
});


React.renderComponent(<Game wordsUrl="/pronounce_gaelic/easy/words" />, document.getElementById('game'));
