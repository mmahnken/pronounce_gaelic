/** @jsx React.DOM */

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

var WordArea = React.createClass({
    // componentDidMount: function() {
    //     var refAudioEl = this.refs.refAudio.getDOMNode();
    //     $(refAudioEl).on('playing', this.props.togglePlaying(refAudioEl));

    //     $(refAudioEl).on('ended', this.props.togglePlaying(refAudioEl)); 


    // },
    // componentWillUnMount: function() {
    //     var refAudioEl = this.refs.refAudio.getDOMNode();
    //     refAudioEl.removeEventListener('playing', this.props.togglePlaying(refAudioEl));

    //     refAudioEl.removeEventListener('ended', this.props.togglePlaying(refAudioEl));
    // },
    render: function() {
        var recordings_list = [];
        this.props.recordings.forEach(function(r) {
            recordings_list.push(<Recording data={r} />);
        }); 
        return (
                <div>
                    <div className="row">
                        <div className="panel panel-primary">
                            <div className="panel-heading">
                                <h3 className="panel-title">Native Pronunciation</h3>
                            </div>
                            <div className="panel-body">
                                <audio controls ref="refAudio">
                                    <source src={this.props.word.url} type="audio/mpeg"></source>
                                </audio>
                            </div>
                        </div>
                        
                        <div className="panel panel-info">
                            <div className="panel-heading">
                                <h3 className="panel-title">Your recordings</h3>
                            </div>
                            <div className="panel-body" id="recordings">
                                {recordings_list}
                            </div>
                        </div>
                    </div>
                </div>
        );
    }
});


var AudioController = React.createClass({
    getInitialState: function() {
        return ({
            recording: false,
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
    gotStream: function(stream, refAudioBoolean) {
        inputPoint = this.state.audioContext.createGain();

        // Create an AudioNode from the stream.
        this.state.realAudioInput = this.state.audioContext.createMediaStreamSource(stream);
        this.state.audioInput = this.state.realAudioInput;
        this.state.audioInput.connect(inputPoint);

        if (!refAudioBoolean){
            this.state.audioRecorder = new Recorder( inputPoint );
        }

    },
    updateViz: function(){
        if (this.state.recording || this.state.playing) {
            var bufferLength = this.state.analyser.frequencyBinCount;
            var dataArray = new Uint8Array(bufferLength);
            this.state.analyser.getByteTimeDomainData(dataArray);
            this.setState({d3Data: dataArray});
        } 
    },
    updateStream: function(stream){
        this.gotStream(stream, true);
    },
    togglePlaying: function(refAudioEl) {
        if (this.state.playing) {
            // stop visualizing
            clearInterval();
            this.setState({
                playing: false
            });
        } else {
            alert('toggling playing');
            this.updateStream(refAudioEl);
            // start visualizing
            var analyser = this.state.audioContext.createAnalyser();
            this.state.realAudioInput.connect(analyser);
            analyser.fftSize = 1000; 
            this.setState({
                domain: {x: [0, analyser.fftSize], y: [0, analyser.fftSize]},
                analyser: analyser,
                playing: true
            });
            setInterval(this.updateViz, 50);
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
        
        var recording = {url: url, filename: filename, word: this.props.currentWord};

        var current_recordings = this.state.recordings;
        current_recordings.push(recording);
        this.setState({recordings: current_recordings});
        this.persistAudio(blob);
    },
    persistAudio: function(blob) {
        var formData = new FormData();
        formData.append("blob", blob);

        var csrftoken = $.cookie('csrftoken');
        $.ajaxSetup({
            beforeSend: function(xhr, settings) {
                if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                    xhr.setRequestHeader("X-CSRFToken", csrftoken);
                }
            }
        });
        $.ajax({
            processData: false,
            type: "POST",
            url: '/pronounce_gaelic/save_audio', 
            data: formData,
            contentType: false
        }).done(function(data) {
            alert('persisted audio, '+data);
        }).error(function(e){
            console.log(e);
            alert(e.statusText);
        });
    },
    componentWillMount: function() {
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
        var recordings_list = []
        var currentWord = this.props.currentWord;
        this.state.recordings.forEach(function(r) {
            if (r.word.id == currentWord.id){
                recordings_list.push(r);
            }
        });
        if (!this.state.recording && !this.state.playing){
            return (
                <div>
                    <div className="row">
                        <dl className="col-md-6">
                            <dt>{this.props.currentWord.word}</dt>
                            <dd>{this.props.currentWord.english_usage}</dd>
                        </dl>
                        <div className="col-md-6">
                            <input type="submit" 
                                   value={this.state.buttonText} 
                                   onClick={this.toggleRecording} 
                                   className={this.state.buttonClass} />
                        </div>
                    </div>
                    <WordArea 
                        word={this.props.currentWord} 
                        recordings={recordings_list}
                        togglePlaying={this.togglePlaying} />
                </div>
            );
        } else {
            return (
            <div>
                <div className="row">
                    <dl className="col-md-6">
                        <dt>{this.props.currentWord.word}</dt>
                        <dd>{this.props.currentWord.english_usage}</dd>
                    </dl>
                    <div className="col-md-6">
                        <input type="submit" 
                               value={this.state.buttonText} 
                               onClick={this.toggleRecording} 
                               className={this.state.buttonClass} />
                    </div>
                </div>
                
                <div>
                    <AudioVisualization data={this.state.d3Data} domain={this.state.domain} />
                </div>
                <div>
                    <WordArea 
                        word={this.props.currentWord} 
                        recordings={recordings_list} 
                        togglePlaying={this.togglePlaying} />
                </div>
            </div>
        );
        }
        
    }
});


var Game = React.createClass({
    getInitialState: function() {
        return ({
            playing: false,
            words: [],
            currentWord: {}
        });
    },
    loadWords: function() {
        $.ajax({
            url: this.props.wordsUrl,
            datatype: 'json',
            type: 'get',
            success: function(data) {
                this.setState({
                    words: data.words,
                    currentWord: data.words[0]
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
        var words_list = [];
        var currentWord = this.state.currentWord;
        var words = this.state.words;
        if (Object.getOwnPropertyNames(currentWord).length !== 0 && this.state.words.length !== 0) {
            words.forEach(function(word, i) {
                //change this
                if (word.word == currentWord.word) {
                    words_list.push(<a href="#" className="list-group-item active">{word.word}</a>);
                } else {
                    words_list.push(<a href="#" className="list-group-item">{word.word}</a>);
                }      
            });

            return (
            <div>
                <div className="list-group col-md-2">
                    {words_list}
                </div>
                <div className="col-md-10">
                    <AudioController words={this.state.words} currentWord={this.state.currentWord} />
                </div>
            </div>
            );
        } else {
            return (<div>Loading... </div>);
        }
        
    }
});

function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}

React.renderComponent(<Game wordsUrl="/pronounce_gaelic/easy/words" />, document.getElementById('game'));