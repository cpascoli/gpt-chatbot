// Text to Speech Conversion with Natural Voices in React Native
// https://aboutreact.com/react-native-text-to-speech/

// import React in our code
import React, {useState, useEffect} from 'react';

// import all the components we are going to use
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  Keyboard,
  TouchableOpacity,
} from 'react-native';



import Voice from 'react-native-voice';
import { NeuButton, NeuVie } from "neumorphism-ui";


// import slider for the tuning of pitch and speed
import Slider from '@react-native-community/slider';

// import Tts Text to Speech
import Tts from 'react-native-tts';

const App = () => {

    //// Speech to Text
    const [isRecording, setRecording] = useState(false);
    const [inputValue, setInputValue] = useState('');

    Voice.onSpeechStart = () => setRecording(true);
    Voice.onSpeechResults = (e) => setInputValue(e.value[0]);


    const handleStartRecording = async () => {
        setRecording(true);
        await Voice.start('en-US');
    };

    const handleStopRecording = async () => {
        setRecording(false);
        await Voice.stop();
    };



    //// Text to Speech
    const [voices, setVoices] = useState([]);
    const [ttsStatus, setTtsStatus] = useState('initiliazing');
    const [selectedVoice, setSelectedVoice] = useState(null);
    const [speechRate, setSpeechRate] = useState(0.5);
    const [speechPitch, setSpeechPitch] = useState(1);
    const [
        text,
        setText
    ] = useState('Hello, this is my voice. Is it annoying?');

  useEffect(() => {
    Tts.addEventListener(
      'tts-start',
      (_event) => setTtsStatus('started')
      );
    Tts.addEventListener(
      'tts-finish',
      (_event) => setTtsStatus('finished')
      );
    Tts.addEventListener(
      'tts-cancel',
      (_event) => setTtsStatus('cancelled')
      );
    Tts.setDefaultRate(speechRate);
    Tts.setDefaultPitch(speechPitch);
    Tts.getInitStatus().then(initTts);
    return () => {
      Tts.removeEventListener('tts-start', (_event) => setTtsStatus('started') );
      Tts.removeEventListener('tts-finish', (_event) => setTtsStatus('finished'),);
      Tts.removeEventListener('tts-cancel', (_event) => setTtsStatus('cancelled'),);
    };
}, []);

  const initTts = async () => {

    let voiceId = 18 // Karen

    const voices = await Tts.voices();
    const availableVoices = voices
    .filter((v) => !v.networkConnectionRequired && !v.notInstalled)
    .map((v) => {
      return {id: v.id, name: v.name, language: v.language};
  });
    let selectedVoice = null;
    if (voices && voices.length > 0) {
      selectedVoice = voices[voiceId].id;
      try {
        await Tts.setDefaultLanguage(voices[voiceId].language);
    } catch (err) {
        //Samsung S9 has always this error:
        //"Language is not supported"
        console.log(`setDefaultLanguage error `, err);
    }
    await Tts.setDefaultVoice(voices[voiceId].id);
    setVoices(availableVoices);
    setSelectedVoice(selectedVoice);
    setTtsStatus('initialized');
} else {
  setTtsStatus('initialized');
}
};

const readText = async () => {
    Tts.stop();
    Tts.speak(inputValue);
};

const deleteText = () => {
    setInputValue('')
};

const updateSpeechRate = async (rate) => {
    await Tts.setDefaultRate(rate);
    setSpeechRate(rate);
};

const updateSpeechPitch = async (rate) => {
    await Tts.setDefaultPitch(rate);
    setSpeechPitch(rate);
};

const onVoicePress = async (voice) => {
    try {
      await Tts.setDefaultLanguage(voice.language);
  } catch (err) {
      // Samsung S9 has always this error: 
      // "Language is not supported"
      console.log(`setDefaultLanguage error `, err);
  }
  await Tts.setDefaultVoice(voice.id);
  setSelectedVoice(voice.id);
};

const renderVoiceItem = ({item}) => {
    return (
      <TouchableOpacity
      style={{
        backgroundColor: selectedVoice === item.id ? 
        '#DDA0DD' : '#5F9EA0',
    }}
    onPress={() => onVoicePress(item)}>
    <Text style={styles.buttonTextStyle}>
        {`${item.language} - ${item.name || item.id}`}
    </Text>
    </TouchableOpacity>
    );
};

return (
    <SafeAreaView style={styles.container}>
    <View style={styles.container}>
    <Text style={styles.titleText}>
    Text to Speech Conversion with Natural Voices
    </Text>
    <View style={styles.sliderContainer}>
    <Text style={styles.sliderLabel}>
    {`Speed: ${speechRate.toFixed(2)}`}
    </Text>
    <Slider
    style={styles.slider}
    minimumValue={0.01}
    maximumValue={0.99}
    value={speechRate}
    onSlidingComplete={updateSpeechRate}
    />
    </View>
    <View style={styles.sliderContainer}>
    <Text style={styles.sliderLabel}>
    {`Pitch: ${speechPitch.toFixed(2)}`}
    </Text>
    <Slider
        style={styles.slider}
        minimumValue={0.5}
        maximumValue={2}
        value={speechPitch}
        onSlidingComplete={updateSpeechPitch}
    />
    </View>
    <Text style={styles.sliderContainer}>
        {`Selected Voice: ${selectedVoice || ''}`}
    </Text>
    <TextInput
        style={styles.textInput}
        onChangeText={(text) => setInputValue(text)}
        value={inputValue}
        onSubmitEditing={Keyboard.dismiss}
        multiline={true}
    />

    <TouchableOpacity
        style={styles.buttonStyle}
        onPress={readText}>
        <Text style={styles.buttonTextStyle}>
            Read Text ({`Status: ${ttsStatus || ''}`})
        </Text>
    </TouchableOpacity>

    <TouchableOpacity
        style={ {marginTop: 20, backgroundColor: '#eee', padding: 10} }
        onPress={deleteText}>
        <Text style={styles.buttonDeleteStyle}>
            Delete Text
        </Text>
    </TouchableOpacity>

  
      <NeuButton style={styles.recordButton}
        onPress={handleStartRecording}
        onUnpress={handleStopRecording}
      >
        <Text style={styles.btnLabel}>
          {isRecording ? 'STOP' : 'RECORD'}
        </Text>
      </NeuButton>





    <Text style={styles.sliderLabel} style={{ marginTop: 20 }} >
        Select the Voice from below
    </Text>
    <FlatList
        style={{width: '100%', marginTop: 5}}
        keyExtractor={(item) => item.id}
        renderItem={renderVoiceItem}
        extraData={selectedVoice}
        data={voices}
    />
    </View>
    </SafeAreaView>
)};



export default App;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    flexDirection: 'column',
    padding: 5,
},
titleText: {
    fontSize: 22,
    textAlign: 'center',
    fontWeight: 'bold',
},
buttonStyle: {
    justifyContent: 'center',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#8ad24e',
},
buttonTextStyle: {
    color: '#fff',
    textAlign: 'center',
},
buttonDeleteStyle: {
    color: '#333',
    textAlign: 'center',
},

sliderContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: 300,
    padding: 5,
},
sliderLabel: {
    textAlign: 'center',
    marginRight: 20,
},
slider: {
    flex: 1,
},
textInput: {
    backgroundColor: 'white',
    borderColor: 'gray',
    borderWidth: 1,
    color: 'black',
    width: '100%',
    height: 200,
},

recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
},

});
