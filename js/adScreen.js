/********************************************************************
  AD SCREEN
*********************************************************************/

var AdScreen = React.createClass({
  getInitialState: function() {
    this.isMobile = this.props.controller.state.isMobile;
    return {
      controlBarVisible: true,
      controlBarWidth: 0,
      timer: null
    };
  },

  componentDidMount: function () {
    this.setState({controlBarWidth: this.getDOMNode().clientWidth});

    // Make sure component resize correctly after switch to fullscreen/inline screen
    window.addEventListener('resize', this.handleResize);

    //for mobile, hide control bar after 3 seconds
    if (this.isMobile){
      this.startHideControlBarTimer();
    }
  },

  componentWillUnmount: function () {
    if (this.state.timer !== null){
      clearTimeout(this.state.timer);
    }
  },

  startHideControlBarTimer: function(){
    var timer = setTimeout(function(){
      if(this.state.controlBarVisible){
        this.hideControlBar();
      }
    }.bind(this), 3000);
    this.setState({timer: timer});
  },

  handleResize: function(e) {
    if (this.isMounted()) {
      this.setState({controlBarWidth: this.getDOMNode().clientWidth});
    }
  },

  handlePlayerClicked: function(event) {
    //since after exiting the full screen, iPhone pauses the video and places an overlay play button in the middle
    //of the screen (which we can't remove), clicking the screen would start the video.
    if (Utils.isIPhone() && this.state.playerState == STATE.PAUSE){
      this.props.controller.togglePlayPause();
    }
    else {
      console.log("ad screen clicked");
      event.stopPropagation(); // W3C
      event.cancelBubble = true; // IE
      this.props.controller.onAdsClicked();
    }
  },

  showControlBar: function() {
    this.setState({controlBarVisible: true});
  },

  hideControlBar: function() {
    this.setState({controlBarVisible: false});
  },

  handleTouchEnd: function() {
    if (!this.state.controlBarVisible){
      this.showControlBar();
      this.startHideControlBarTimer();
    }
    else {
      this.handlePlayerClicked();
    }
  },

  getPlaybackControlItems: function() {
    var playbackControlItemTemplates = {
     "scrubberBar": <ScrubberBar {...this.props} controlBarVisible={this.state.controlBarVisible}
       controlBarWidth={this.state.controlBarWidth} />,

     "controlBar": <ControlBar {...this.props} controlBarVisible={this.state.controlBarVisible}
       controlBarWidth={this.state.controlBarWidth}
       playerState={this.props.playerState} />
    };

    var playbackControlItems = [];
    for(var item in playbackControlItemTemplates) {
      playbackControlItems.push(playbackControlItemTemplates[item]);
    }

    return playbackControlItems;
  },

  render: function() {
    var adPanel = null;
    if (this.props.skinConfig.adScreen.showAdMarquee) {
      adPanel = <AdPanel {...this.props} controlBarWidth={this.state.controlBarWidth}/>;
    }
    var playbackControlItems = null;
    if(this.props.skinConfig.adScreen.showControlBar) {
      playbackControlItems = this.getPlaybackControlItems();
    }
    return (
      <div onMouseOver={this.showControlBar} onMouseOut={this.hideControlBar}
        onClick={this.isMobile?null:this.handlePlayerClicked} onTouchEnd={this.handleTouchEnd} style={defaultScreenStyle.style}>
        
        {adPanel}

        {playbackControlItems}
      </div>
    );
  }
});