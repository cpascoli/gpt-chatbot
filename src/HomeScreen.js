
// import React in our code
import React, { useState, useEffect, useRef, useContext } from 'react';

import Tts from 'react-native-tts';

// import all the components we are going to use
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
    FlatList,
    TextInput,
    Keyboard,
    TouchableOpacity, TouchableHighlight,
    ScrollView,
} from 'react-native';

import Clipboard from '@react-native-community/clipboard';

import Voice from 'react-native-voice';
import { NeuButton } from "neumorphism-ui";
import ProgressCircle from 'react-native-progress/Circle';

// import slider for the tuning of pitch and speed
// import Slider from '@react-native-community/slider';



import { AppContext } from "./AppContext"
import { openAIRequest, speak, stopSpeaking  } from "./Utils";


const presetVoices = ['Karen', 'Daniel', 'Samantha', 'Whisper', 'Alice'];



export const HomeScreen = () => {

    const scrollViewRef = useRef();
    const { isReading, setReading, selectedVoice, setSelectedVoice, isModeQA, setJsonResponse, isGoogleSpeech } = useContext(AppContext);


    // API
    const [isRequestInProgress, setRequestInProgress] = useState(false);

    //// Speech to Text
    // const [isItalian, setItalian] = useState(false);

    const [isRecording, setRecording] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [chatText, setChatText] = useState('');
    // const [jsonResponse, setJsonResponse] = useState('');
    const [lastReplyText, setLastReplyText] = useState('');


    Voice.onSpeechStart = () => setRecording(true);
    Voice.onSpeechResults = (e) => setInputValue(e.value[0]);

    const handleStartRecording = async () => {
        setRecording(true);
        await Voice.start(isItalian() ? 'it-IT' : 'en-US');
    };

    const handleStopRecording = async () => {
        await Voice.stop();
        setRecording(false);
    };

    const isItalian = () => {
        return selectedVoice !== null && selectedVoice.language === 'it-IT'
    }


    //// Text to Speech
    const [voices, setVoices] = useState([]);
    const [ttsStatus, setTtsStatus] = useState('initiliazing');
  
    const [speechRate, setSpeechRate] = useState(0.5);
    const [speechPitch, setSpeechPitch] = useState(1);


    // run once when component is mounted
    useEffect(() => {
        Tts.addEventListener('tts-start', (_event) => { setTtsStatus('started'); setReading(true); });
        Tts.addEventListener('tts-finish', (_event) => { setTtsStatus('finished'); setReading(false); });
        Tts.addEventListener('tts-cancel', (_event) => { setTtsStatus('cancelled'); setReading(false); });
        Tts.setDefaultRate(speechRate);
        Tts.setDefaultPitch(speechPitch);
        Tts.getInitStatus().then(initTts(selectedVoice) ).then( it => console.log("**** initialized", it));

        return () => {
            Tts.removeEventListener('tts-start', (_event) => setTtsStatus('started'));
            Tts.removeEventListener('tts-finish', (_event) => setTtsStatus('finished'),);
            Tts.removeEventListener('tts-cancel', (_event) => setTtsStatus('cancelled'),);
        };
    }, []);


    useEffect(() => {
        console.log(">>>> useEffect ",speechRate, speechPitch, selectedVoice.id, selectedVoice.language, selectedVoice.name)
        Tts.setDefaultRate(speechRate);
        Tts.setDefaultPitch(speechPitch);
        initTts({
            id: selectedVoice.id,
            language: selectedVoice.language,
            name: selectedVoice.name,
        })
    }, [selectedVoice]);


    const initTts = async (selectedVoice) => {

        console.log("*** initTts", selectedVoice)
        // const voices = await Tts.voices();
        // const availableVoices = voices.filter((v) => !v.networkConnectionRequired && !v.notInstalled)
        //     .map((v) => {
        //         return { id: v.id, name: v.name, language: v.language };
        //     })
        //     .filter(voice => voice.language.startsWith('it') ||  voice.language.startsWith('en'));
    
        // console.log(">>> availableVoices", availableVoices);

        // let enVoice = availableVoices.find(it => it.language === 'en-AU');  // Karen
        // let itVoice = availableVoices.find(it => it.language === 'it-IT');  // Alice
        if (selectedVoice && selectedVoice.language && selectedVoice.id) {
            try {
                await Tts.setDefaultLanguage(selectedVoice.language);
                await Tts.setDefaultVoice(selectedVoice.id);

                console.log(`>>> initialized `, selectedVoice);
            } catch (err) {
                //Samsung S9 has always this error:
                //"Language is not supported"
                console.log(`setDefaultLanguage error `, err);
            }
            // setVoices(availableVoices);
            // setSelectedVoice(voice);
            return 'initialized';
        } else {
            return 'initialized';
        }
    };



    //// OPEN API - API CALL



    /// Button Actions

    const readLastReply = async () => {
        if (isReading) {
            console.log("STOP pressed")
            stopSpeaking(isGoogleSpeech, setReading)
            // setReading(false)
        } else {
            console.log("READ pressed")
            await speak(isGoogleSpeech, selectedVoice.language, lastReplyText, setReading)
        }
    };



    const deleteText = () => {
        setInputValue('')
        setChatText('')
        setJsonResponse('')
        setLastReplyText('')
    };



    const sendText = async (isModeQA) => {

        // stop recording
        await handleStopRecording()

        if (inputValue.trim() === '') return

        // update chat box
        const prefix = isModeQA ? 'Q:' : 'You:';
        const suffix = isModeQA ? 'A:' : 'Friend:';

        const prompt = `${chatText}\n${prefix} ${inputValue}\n${suffix}`
        const { reply, jsonTxt } = await openAIRequest(prompt, isModeQA, setRequestInProgress)
        
        setLastReplyText(reply)
        setJsonResponse(jsonTxt)
        setInputValue('')

        // speak reponse
        if (reply !== '') {
            setChatText(prompt + ' ' + reply);
            speak(isGoogleSpeech, selectedVoice.language, reply, setReading)
        }
    };



    /// List of Voices

    const onVoicePress = async (voice) => {
        try {
            await Tts.setDefaultLanguage(voice.language);
        } catch (err) {
            // Samsung S9 has always this error: 
            // "Language is not supported"
            console.log(`setDefaultLanguage error `, err);
        }
        await Tts.setDefaultVoice(voice.id);
        setSelectedVoice(voice);
    };

    const renderVoiceItem = ({ item }) => {
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
            <View >

                <View style={{
                    borderColor: isRecording ? 'red' : 'white',
                    borderBottomWidth: isRecording ? 2 : 2,
                    borderTopWidth: isRecording ? 2 : 2,
                    borderLeftWidth: isRecording ? 2 : 2,
                    borderRightWidth: isRecording ? 2 : 2,
                    padding: 5,

                }} >

                    <Text style={styles.sliderContainer}> Your prompt: </Text>
                    <TextInput
                        style={styles.textInput}
                        onChangeText={(text) => setInputValue(text)}
                        value={inputValue}
                        onSubmitEditing={Keyboard.dismiss}
                        multiline={true}
                        spellCheck={false}
                        autoCorrect={false}
                    />


                    <View style={styles.rowContainer}>
                        <TouchableOpacity
                            style={{ marginTop: 5, marginLeft: 0, backgroundColor: '#aaa', padding: 10, minWidth: 60 }}
                            onPress={() => inputValue.length > 0 && setInputValue(inputValue.substring(0, inputValue.length - 1))}>
                            <Text style={styles.buttonTextStyle}> &lt; </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginTop: 5, marginLeft: 5, backgroundColor: '#aaa', padding: 10, minWidth: 60 }}
                            onPress={() => setInputValue(inputValue + '.')}>
                            <Text style={styles.buttonTextStyle}>.</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={{ marginTop: 5, marginLeft: 5, backgroundColor: '#aaa', padding: 10, minWidth: 60 }}
                            onPress={() => setInputValue(inputValue + '?')}>
                            <Text style={styles.buttonTextStyle}>?</Text>
                        </TouchableOpacity>
                        <View style={{ width: 120 }}></View>

                        <TouchableOpacity
                            style={{ marginTop: 5, marginLeft: 5, backgroundColor: '#aaa', padding: 10, minWidth: 60 }}
                            onPress={() => {
                                Clipboard && Clipboard.setString(chatText)
                                //  const text = "a short piece of information that you give to a person when you cannot speak to them directly\n\n";
                                //  setChatText( chatText + text);
                            }}>
                            <Text style={styles.buttonTextStyle}> Copy </Text>
                        </TouchableOpacity>
                    </View>


                    <View style={styles.textOutput} >
                        <ScrollView ref={scrollViewRef}
                            onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
                        >
                            <Text style={{ height: '100%' }}>{chatText}</Text>
                        </ScrollView>
                    </View>

                    <View style={{ display: "flex", justifyContent: "center", alignItems: "center", borderWidth: 0,
                                     marginTop: 20, width: "100%", height: 140 }}>

                        <TouchableHighlight underlayColor="#800c04" activeOpacity={0.6}
                            style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: 'center', 
                                     backgroundColor: '#fc4747', borderRadius: 50, borderWidth: 2
                                   }}
       
                                onPressIn={handleStartRecording} 
                                onPressOut={handleStopRecording}>
                                <Text style={{ color: '#fff', fontSize: 18, paddingTop: 40, width: 100, height: 100, textAlign: 'center' }}>
                                     {isRecording ? 'STOP' : 'RECORD'}
                                </Text>
                        </TouchableHighlight>
                   
                    </View>

                    <View style={styles.rowContainer}>

                        <TouchableOpacity
                            style={{ marginTop: 5, marginBottom: 0, backgroundColor: '#ff7777', paddingTop: 15, width: 110, height: 60 }}
                            onPress={deleteText}>
                            <Text style={styles.buttonTextStyle}>Clear</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ marginTop: 5, marginLeft: 5, backgroundColor: isReading ? '#ff7777' : '#8ad24e', paddingTop: 5, width: 110, height: 60 }}
                            onPress={readLastReply}>
                            <Text style={styles.buttonTextStyle}> {isReading ? 'Stop' : `Read\n(${ttsStatus || ''}) `} </Text>
                        </TouchableOpacity>

                        <View style={{ width: 45 }}></View>

                        <TouchableOpacity
                            disabled={isRequestInProgress}
                            style={{ marginTop: 5, backgroundColor: isRequestInProgress ? '#999' : '#23C4ED', paddingTop: 15, width: 110, height: 60 }}
                            onPress={ () => sendText(isModeQA) }>
                            {!isRequestInProgress && <Text style={styles.buttonTextStyle}> Send </Text>}
                            {isRequestInProgress && <ProgressCircle size={30} style={{ marginLeft: 35 }} indeterminate={true} />}
                        </TouchableOpacity>
                    </View>



                    <Text style={styles.sliderContainer}>
                        {`Selected Voice: ${(selectedVoice && selectedVoice !== null && selectedVoice.id && selectedVoice.id.split(".").pop()) || selectedVoice}`}
                    </Text>


                    {/* <TouchableOpacity style={{ marginTop: 5, backgroundColor: '#aaa', }} onPress={() => { Clipboard && Clipboard.setString(jsonResponse) }}>
                        <Text style={styles.jsonTextBox} >{jsonResponse}</Text>
                    </TouchableOpacity> */}


                    <Text style={styles.sliderLabel} style={{ marginTop: 100 }} >
                        Select the Voice from below
                    </Text>
                    <FlatList
                        style={{ width: '100%', marginTop: 5 }}
                        keyExtractor={(item) => item.id}
                        renderItem={renderVoiceItem}
                        extraData={selectedVoice}
                        data={voices}
                    />

                    <View style={{ height: 100 }}>

                    </View>

                    {/* </ScrollView> */}
                </View>

            </View>
        </SafeAreaView>

    )
};




const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
        flexDirection: 'column',
        // padding: 0,
    },

    titleText: {
        fontSize: 22,
        textAlign: 'center',
        fontWeight: 'bold',
    },

    buttonStyle: {
        justifyContent: 'center',
        marginTop: 0,
        marginLeft: 0,
        backgroundColor: '#8ad24e',
    },
    buttonTextStyle: {
        color: '#fff',
        textAlign: 'center',
        justifyContent: 'center',
        marginTop: 5,
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

    textInput: {
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        padding: 10,
        color: 'black',
        width: '100%',
        maxHeight: 90,
    },

    rowContainer: {
        marginTop: 10,
        marginBottom: 10,
        flexDirection: "row",
        flexWrap: "nowrap",
        alignItems: 'center'
    },

    textOutput: {
        width: '100%',
        height: '100%',
        backgroundColor: '#fff',
        borderColor: 'gray',
        borderWidth: 1,
        height: 320,
        marginTop: 10,
        paddingLeft: 10,
        paddingRight: 10,
    },

    recordButton: {
        width: 100,
        height: 100,
        borderRadius: 50,
        alignSelf: 'center',
        marginBottom: 20
    },

    jsonTextBox: {
        height: 80,
        backgroundColor: '#ddd'
    },



});
