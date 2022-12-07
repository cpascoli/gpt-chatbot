// Text to Speech Conversion with Natural Voices in React Native
// https://aboutreact.com/react-native-text-to-speech/

// import React in our code
import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// import all the components we are going to use
import {
    Text,
    Button,
    Modal,
    Settings
} from 'react-native';


import SettingsView from './SettingsView'
import { HomeScreen } from "./HomeScreen"
import { AppContext } from "./AppContext"
import Tts from 'react-native-tts';


const Stack = createNativeStackNavigator();


const App = () => {

    const defaultVoice = Settings.get("voice") || {"id": "com.apple.voice.compact.en-AU.Karen", "language": "en-AU", "name": "Karen"} 
    // const defaultQAMode = Settings.get("mode") === true

    const [selectedVoice, setSelectedVoice] = useState(defaultVoice);
    const [isModeQA, setModeQA] = useState( Settings.get("mode") == true || false );
    const [isGoogleSpeech, setGoogleSpeech] = useState( Settings.get("googleSpeech") == true || false );

    const [isReading, setReading] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [jsonResponse, setJsonResponse] = useState('');

    const [speechRate, setSpeechRate] = useState( Settings.get("speechRate") || 0.5);
    const [speechPitch, setSpeechPitch] = useState( Settings.get("speechPitch") || 1);



    const setAndStoreSelectedVoice = (voice) => {

        console.log(">>> setAndStoreSelectedVoice: ", voice)

        Settings.set({ voice: voice });
        setSelectedVoice(voice);
    }

    const setAndStoreChatMode = (isModeQA) => {
        Settings.set({ mode: isModeQA });
        setModeQA(isModeQA);

        console.log("setAndStoreChatMode: " , isModeQA, "==>", Settings.get("mode"), typeof Settings.get("mode"))
    }

    const setAndStoreGoogleSpeech = (isGoogleSpeech) => {
        Settings.set({ googleSpeech: isGoogleSpeech });
        setGoogleSpeech(isGoogleSpeech);
        console.log("setAndStoreGoogleSpeech: " , isGoogleSpeech, "==>", Settings.get("googleSpeech"), typeof Settings.get("googleSpeech"))
    }

    const updateSpeechRate = async (speechRate) => {
        console.log("updateSpeechRate: " , speechRate, typeof Settings.get("speechRate"))

        await Tts.setDefaultRate(speechRate);
        Settings.set({ speechRate: speechRate });
        setSpeechRate(speechRate);
    }
 
    const updateSpeechPitch = async (speechPitch) => {
        console.log("speechPitch: " , speechPitch, typeof Settings.get("speechPitch"))

        await Tts.setDefaultPitch(speechPitch);
        Settings.set({ speechPitch: speechPitch });
        setSpeechPitch(speechPitch);
    }

    return (
        <AppContext.Provider value={
            {
                selectedVoice: selectedVoice,
                setSelectedVoice: setAndStoreSelectedVoice,

                isModeQA: isModeQA,
                setModeQA: setAndStoreChatMode,

                isGoogleSpeech: isGoogleSpeech,
                setGoogleSpeech: setAndStoreGoogleSpeech,

                jsonResponse: jsonResponse,
                setJsonResponse: setJsonResponse,

                speechRate: speechRate,
                updateSpeechRate : updateSpeechRate,
                
                speechPitch: speechPitch,
                updateSpeechPitch: updateSpeechPitch,

                isReading, setReading,
            }
        }>  

            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Home"
                        component={HomeScreen}
                        options={{
                            headerTitleStyle: {
                                fontWeight: 'bold', 
                            },
                            headerTitle: (props) => <Text>GPT-3 Chat</Text>,
                            headerRight: () => (
                            <Button
                                onPress={() => { 
                                    setModalVisible(!modalVisible);
                                }
                                }
                                title="Settings"
                                color="#333"
                            />
                            ),
                        }}
                    />
                </Stack.Navigator>

                <Modal
                    animationType="slide"
                    transparent={true}
                    visible={modalVisible}
                    onRequestClose={() => {
                        setModalVisible(!modalVisible);
                    }}
                >
                    <SettingsView onClose={ () => setModalVisible(!modalVisible) } />
                </Modal>

            </NavigationContainer>
        </AppContext.Provider>  

    );
  }


export default App;
