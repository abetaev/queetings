var audioContext = new window.AudioContext(),
  micStream: MediaStream;

var fixWebAudio = function (maxAttempts: number, interval: number, attempt: number = 0) {
  if (audioContext.baseLatency < 0.2) {
    if (attempt) {
      if (micStream) {
        micStream.getTracks()[0].stop();
        micStream = null;
      }
      window.alert(
        'Fixed WebAudio after ' + attempt + ' attempts, you ' +
        'may need to adjust your volume.'
      );
    }
    return;
  }

  if (!attempt) {
    if (!window.confirm(
      'It looks like you\'re using Bluetooth headphones which ' +
      'has broken WebAudio. Attempt to fix by turning the ' +
      'Bluetooth microphone on and off?'
    )) {
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => micStream = stream);
  }

  if (attempt < maxAttempts) {
    audioContext.close();
    audioContext = new window.AudioContext();
    setTimeout(function () {
      fixWebAudio(maxAttempts, interval, attempt + 1);
    }, interval);
  } else {
    window.alert('Failed to fix WebAudio after ' + attempt + ' attempts.');
  }
};

export default () => fixWebAudio(20, 500)