/** @jsx React.DOM */

var AudioVisualization = require('AudioVisualization');

var Recording = React.createClass({
    render: function() {
        return (
            <div>
                    <audio controls src={this.props.data.url}></audio>
                    <a href={this.props.data.url} 
                       download={this.props.data.filename}>{this.props.data.filename}
                    </a>
            </div>
        );
    }
});

var WordRow = React.createClass({
    getInitialState: function() {
        return ({
            audioContext: null,
            audioInput: null,
            realAudioInput: null,
            inputPoint: null,
            audioRecorder: null,
            recordings: [],
            buttonClass: 'btn btn-primary',
            buttonText: 'Pronounce it!',
            d3Data: [],
            domain: {x:[], y:[]}
        });
    },
    gotStream: function(stream) {
        inputPoint = this.state.audioContext.createGain();

        // Create an AudioNode from the stream.
        this.state.realAudioInput = this.state.audioContext.createMediaStreamSource(stream);
        this.state.audioInput = this.state.realAudioInput;
        this.state.audioInput.connect(inputPoint);

        this.state.audioRecorder = new Recorder( inputPoint );

        //
    },
    updateViz: function(){
        if (this.state.recording) {
            var bufferLength = this.state.analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            this.state.analyser.getByteTimeDomainData(dataArray);
            this.setState({d3Data: dataArray});
        } 
    },
    toggleRecording: function(event) {
        if (this.state.recording) {
            // stop recording
            clearInterval();
            this.state.audioRecorder.stop();
            this.setState({
                recording: false,
                buttonClass: 'btn btn-primary',
                buttonText: 'Pronounce it!'
            });
            this.createDownloadLink();

        } else {
            // start recording
            if (!this.state.audioRecorder) {
                return;
            }

            var analyser = this.state.audioContext.createAnalyser();
            this.state.realAudioInput.connect(analyser);
            analyser.fftSize = 256; // so the bars aren't really thin
            this.setState({
                domain: {x: [0, analyser.fftSize], y: [0, analyser.fftSize]},
                recording: true,
                buttonClass: 'btn btn-danger',
                buttonText: 'Recording...',
                analyser: analyser
            });
            this.state.audioRecorder.clear();
            this.state.audioRecorder.record();

            // fourier transform visualization
            setInterval(this.updateViz, 200);

        }
    },
    createDownloadLink: function() {
        var recorder = this.state.audioRecorder;
        recorder.exportWAV(this.doneEncoding);
    },
    doneEncoding: function(blob) {
        var baseUrl = window.URL || window.webkitURL;
        var url = baseUrl.createObjectURL(blob);
        
        var filename = new Date().toISOString() + '.wav';
        
        var recording = {url: url, filename: filename};

        var current_recordings = this.state.recordings;
        current_recordings.push(recording);
        this.setState({recordings: current_recordings});
    },
    componentDidMount: function() {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        this.state.audioContext = new AudioContext();
        this.initAudio();
    },
    initAudio: function() {
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
        console.log(this.state.d3Data);
        var recordings_list = [];
        this.state.recordings.forEach(function(r) {
            recordings_list.push(<Recording data={r} />);
        });
        
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
                            <input type="submit" value={this.state.buttonText} onClick={this.toggleRecording} className={this.state.buttonClass} />
                            <div id="recordings">
                                {recordings_list}
                            </div>
                        </div>
                        <div className="col-md-4">
                            <AudioVisualization data={this.state.d3Data} domain={this.state.domain}/>
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
        if (!this.checkForUserMedia()) {
            alert('Oh no! getUserMedia() is not supported in your browser');
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


React.renderComponent(<Game wordsUrl="/pronounce_gaelic/easy/words" />, document.getElementById('game'));