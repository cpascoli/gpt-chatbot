// Text to Speech Conversion with Natural Voices in React Native
// https://aboutreact.com/react-native-text-to-speech/

// import React in our code
import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from './AppContext';

import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Switch,
    Pressable,
    SegmentedControlIOS,
} from 'react-native';

// import slider for the tuning of pitch and speed
import Slider from '@react-native-community/slider';

import Clipboard from '@react-native-community/clipboard';
import Tts from 'react-native-tts';

import { speak, stopSpeaking } from "./Utils"


const sampleTextEN = "As a large language model trained by OpenAI, my primary function is to assist with a wide range of tasks by generating text based on the input provided by the user. \n " +
                     "I can provide information and answers to questions on a wide range of topics, such as history, science, literature, and more. I can also generate text on a given topic or based on specific prompts."
const sampleTextIT = "Essendo un grande modello di linguaggio addestrato da OpenAI, la mia funzione principale è quella di assistere in una vasta gamma di attività generando testo in base all'input fornito dall'utente.\n" + 
                     "Posso fornire informazioni e risposte a domande su una vasta gamma di argomenti, come la storia, la scienza, la letteratura e altro ancora. Posso anche generare testo su un determinato argomento o in base a prompt specifici."

const voicesEN =  
    [{"id": "com.apple.voice.compact.en-AU.Karen", "language": "en-AU", "name": "Karen"}, 
    {"id": "com.apple.voice.compact.en-GB.Daniel", "language": "en-GB", "name": "Daniel"}, 
    {"id": "com.apple.voice.compact.en-IE.Moira", "language": "en-IE", "name": "Moira"}, 
    {"id": "com.apple.voice.compact.en-IN.Rishi", "language": "en-IN", "name": "Rishi"}, 
    {"id": "com.apple.speech.synthesis.voice.Trinoids", "language": "en-US", "name": "Trinoids"},
    {"id": "com.apple.speech.synthesis.voice.Albert", "language": "en-US", "name": "Albert"}, 
    {"id": "com.apple.speech.synthesis.voice.Hysterical", "language": "en-US", "name": "Jester"}, 
    {"id": "com.apple.voice.compact.en-US.Samantha", "language": "en-US", "name": "Samantha"}, 
    {"id": "com.apple.speech.synthesis.voice.Whisper", "language": "en-US", "name": "Whisper"}, 
    {"id": "com.apple.speech.synthesis.voice.Princess", "language": "en-US", "name": "Superstar"}, 
    {"id": "com.apple.speech.synthesis.voice.Bells", "language": "en-US", "name": "Bells"}, 
    {"id": "com.apple.speech.synthesis.voice.Organ", "language": "en-US", "name": "Organ"}, 
    {"id": "com.apple.speech.synthesis.voice.BadNews", "language": "en-US", "name": "Bad News"}, 
    {"id": "com.apple.speech.synthesis.voice.Bubbles", "language": "en-US", "name": "Bubbles"}, 
    {"id": "com.apple.speech.synthesis.voice.Junior", "language": "en-US", "name": "Junior"}, 
    {"id": "com.apple.speech.synthesis.voice.Bahh", "language": "en-US", "name": "Bahh"}, 
    {"id": "com.apple.speech.synthesis.voice.Deranged", "language": "en-US", "name": "Wobble"}, 
    {"id": "com.apple.speech.synthesis.voice.Boing", "language": "en-US", "name": "Boing"}, 
    {"id": "com.apple.speech.synthesis.voice.GoodNews", "language": "en-US", "name": "Good News"}, 
    {"id": "com.apple.speech.synthesis.voice.Zarvox", "language": "en-US", "name": "Zarvox"}, 
    {"id": "com.apple.speech.synthesis.voice.Ralph", "language": "en-US", "name": "Ralph"}, 
    {"id": "com.apple.speech.synthesis.voice.Cellos", "language": "en-US", "name": "Cellos"}, 
    {"id": "com.apple.speech.synthesis.voice.Kathy", "language": "en-US", "name": "Kathy"}, 
    {"id": "com.apple.speech.synthesis.voice.Fred", "language": "en-US", "name": "Fred"}, 
    {"id": "com.apple.voice.compact.en-ZA.Tessa", "language": "en-ZA", "name": "Tessa"}]

const voicesIT =  [{"id": "com.apple.voice.compact.it-IT.Alice", "language": "it-IT", "name": "Alice"}]


const SettingsView = (props) => {

    const { 
        selectedVoice, setSelectedVoice ,
        isModeQA, setModeQA,
        isGoogleSpeech, setGoogleSpeech,
        jsonResponse,

        speechRate, updateSpeechRate,
        speechPitch, updateSpeechPitch,
        isReading, setReading, 

    } = useContext(AppContext);



    const isItalian = () => {
        return selectedVoice !== null && selectedVoice.language === 'it-IT'
    }

    const toggleMode = async () => {
        setModeQA(!isModeQA)
    };

    const nextVoice = async () => {
       const voices = isItalian() ? voicesIT : voicesEN
       let selVoice = voices[0]

       voices.forEach((voice, idx) => {
            if (voice.id === selectedVoice.id && voices.length > idx + 1) {
                selVoice = voices[idx+1]
            }
       });
    
        setSelectedVoice(selVoice)
        await Tts.setDefaultVoice(selVoice.id);

        if (isReading) {
            await stopVoice()
            await playVoice()
        }

    };

    const previousVoice = async () => {
        const voices = isItalian() ? voicesIT : voicesEN
        let selVoice = voices[voices.length-1]

        voices.forEach((voice, idx) => {
             if (voice.id === selectedVoice.id && idx > 0) {
                selVoice = voices[idx-1]
             }
        });
     
        setSelectedVoice(selVoice)
        await Tts.setDefaultVoice(selVoice.id);

        if (isReading) {
            await stopVoice()
            await playVoice()
        }
    };


    const playVoice = async () => {
        const sampleText = isItalian() ? sampleTextIT : sampleTextEN
        await speak(isGoogleSpeech, selectedVoice.language, sampleText, setReading )
       
    }

    const stopVoice  = async () => {
        await stopSpeaking(isGoogleSpeech, setReading )
    }


    const updateLanguage = async (language) => {
        if(language === 'it-IT') {
            setSelectedVoice( {"id": "com.apple.voice.compact.it-IT.Alice", "language": "it-IT", "name": "Alice"} )
        } else {
            setSelectedVoice( {"id": "com.apple.voice.compact.en-AU.Karen", "language": "en-AU", "name": "Karen"} )
        }
    };

    const toggleSpeech = async () => {
        setGoogleSpeech(!isGoogleSpeech)
    };



    return (
        <View style={styles.centeredView}>

            <View style={styles.modalView}>

                <View style={styles.modalHeader} >
                    <Pressable
                        style={[styles.button, styles.buttonClose]}
                        onPress={() => props.onClose() }
                    >
                        <Text style={styles.textStyle}>Done</Text>
                    </Pressable>
                </View>



                <View style={styles.rowContainer}>
                
                    <SegmentedControlIOS style={{ width: "100%", height: 40, backgroundColor: '#1B98F5'}}
                        values={['English', 'Italian']}
                        selectedIndex={  isItalian() ? 1 : 0 }
                        onChange={(event) => {
                            updateLanguage(event.nativeEvent.selectedSegmentIndex === 0 ? 'en-EN' : 'it-IT');
                        }}
                    />
                </View>

                <View style={styles.rowContainer}>
                    {/* <Text>English/Italian </Text>
                    <View style={{ width: 10 }}></View>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSelectedVoice}
                        value={isItalian()}
                    />
                    <View style={{ width: 40 }}></View> */}

                    <Text style={{ width: 130 }}>
                        {`Selected Voice:\n${(selectedVoice && selectedVoice !== null && selectedVoice.id && (selectedVoice.id.split(".").pop() + " ("+ selectedVoice.language+")") )  || selectedVoice}`}
                    </Text>
                    <View style={{ width: 60 }}></View>
                    <Pressable style={[styles.button, styles.buttonNextPrev]} onPress={() => nextVoice() }>
                        <Text style={styles.textStyle}>&lt;</Text>
                    </Pressable>

                    <View style={{ width: 5 }}></View>
                    <Pressable style={[styles.button, styles.buttonNextPrev]} onPress={() => isReading ? stopVoice() : playVoice() }>
                        <Text style={styles.textStyle}> { isReading ? "Stop" : "Play" } </Text>
                    </Pressable>

                    <View style={{ width: 5 }}></View>
                    <Pressable style={[styles.button, styles.buttonNextPrev]} onPress={() => previousVoice() }>
                        <Text style={styles.textStyle}>&gt;</Text>
                    </Pressable>

                </View>


                <View style={styles.rowContainer}>
                    <Text>Friend/Q&amp;A </Text>
                    <View style={{ width: 25 }}></View>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleMode}
                        value={isModeQA}
                    />
                </View>

                <View style={styles.rowContainer}>
                    <Text>Google Speech </Text>
                    <View style={{ width: 5 }}></View>
                    <Switch
                        trackColor={{ false: "#767577", true: "#81b0ff" }}
                        ios_backgroundColor="#3e3e3e"
                        onValueChange={toggleSpeech}
                        value={isGoogleSpeech}
                    />
                </View>


                <View style={styles.sliderContainer}>
                    <Text style={styles.sliderLabel}>
                        {`Speed: ${ speechRate ? speechRate.toFixed(2) : 'n/a'}`}
                    </Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={0.30}
                        maximumValue={0.60}
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
                        maximumValue={2.0}
                        value={speechPitch}
                        onSlidingComplete={updateSpeechPitch}
                    />
                </View>


                <Text style={{ marginTop: 25 }} > JSON Response: </Text>
                <TouchableOpacity style={{ marginTop: 10, backgroundColor: '#bbb', width: '100%' }} onPress={() => { Clipboard && Clipboard.setString(jsonResponse) }}>
                    <Text style={styles.jsonTextBox} >  {jsonResponse}</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
  }
  


export default SettingsView;

const styles = StyleSheet.create({
    /// Modal View
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
    },
    modalView: {
        width: "100%",
        // minHeight: 200,
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 15,
        // alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },

    modalHeader: {
        width: '100%',
        marginBottom: 40,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
    },

    modalText: {
        marginBottom: 15,
        textAlign: "center"
    },
    button: {
        borderRadius: 5,
        padding: 10,
        elevation: 2,
        borderColor: 'gray',
        borderWidth: 1,
    },

    buttonClose: {
        backgroundColor: "#eee",
    },
    buttonNextPrev: {
         borderColor: "#2196F3",
    },


    rowContainer: {
        marginTop: 10,
        marginBottom: 10,
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: 'center'
    },


    sliderContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: 300,
        // padding: 5,
    },
    sliderLabel: {
        textAlign: 'center',
        marginRight: 20,
    },
    slider: {
        flex: 1,
    },

    jsonTextBox: {
        height: 350,
        backgroundColor: '#ddd'
    },

    textStyle: {
        minWidth: 30,
        textAlign: "center"
    }

});
