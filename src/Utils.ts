

// import Tts Text to Speech
import Tts from 'react-native-tts';
import RNFS from 'react-native-fs';
import Sound from 'react-native-sound';
import { OPEN_AI_API_KEY, GOOGLE_API_KEY } from '@env'


const OPEN_AI_URL = "https://api.openai.com/v1/completions"
const GOOGLE_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize"


const enUsVoices = ['en-US-Standard-A', 'en-US-Standard-B', 'en-US-Standard-C']
const itItVoices = ['it-IT-Standard-A', 'it-IT-Standard-B', 'it-IT-Standard-C']

let speech : Sound

export const stopSpeaking = async (isGoogleSpeech, setReading) => {
    if (isGoogleSpeech) {
        if (speech && speech.isPlaying()) {
            speech.stop()
            setReading(false)
        }
    } else {
        Tts.stop();
        setReading(false)
    }
}



export const speak = async (isGoogleSpeech, language, text, setReading) => {
    stopSpeaking(isGoogleSpeech, setReading)
    if (isGoogleSpeech) {
        await speechRequestAndPlay(text, language, setReading)
    } else {
        await Tts.stop();
        await Tts.speak(text);
    }
}


export const openAIRequest = async (prompt, isModeQA, setRequestInProgress) => {

    if (!OPEN_AI_API_KEY) {
        console.error("Misisng OPEN_AI_API_KEY", OPEN_AI_API_KEY)
        return
    }


    let request = {
        "model": "text-davinci-003",
        "prompt": "",
        "temperature": 0.5,
        "max_tokens": 500,
        "top_p": 1.0,
        "frequency_penalty": 0.5,
        "presence_penalty": 0.0,
        "stop": [isModeQA ? "Q:" : "You:"]
    }

    request['prompt'] = prompt;

    try {
        const requestJson = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Bearer '+OPEN_AI_API_KEY
            },
            body: JSON.stringify(request),
        }

        setRequestInProgress(true);
        let response = await fetch(OPEN_AI_URL, requestJson );

        setRequestInProgress(false);

        let responseJson = await response.json();
        if (responseJson.error && responseJson.error.message) {
            console.error(responseJson.error.message)
        }

        const reply = responseJson.choices && responseJson.choices.length > 0 ? responseJson.choices[0].text : ''

        return {
            reply: reply ? reply.trim() : '',
            jsonTxt: JSON.stringify(responseJson['choices'])
        }
    } catch (error) {
        console.error(error);
        setRequestInProgress(false);
    }
};





const speechRequestAndPlay = async (text, language, setReading) => {

    if (!GOOGLE_API_KEY) {
        console.error("Missing GOOGLE_API_KEY", GOOGLE_API_KEY)
        return
    }

    const speechRequestURL = `${GOOGLE_API_URL}?key=${GOOGLE_API_KEY}`

    const request = {
          input: {
            text: text,
          },
          voice: {
            languageCode: language,
            name: language === 'it-IT' ? 'it-IT-Standard-A' :'en-US-Standard-C',
            ssmlGender: 'FEMALE'
          },
          audioConfig: {
            audioEncoding: 'MP3',
          }
    }

    const path = `${RNFS.DocumentDirectoryPath}/voice.mp3`

    try {
         const response = await fetch(speechRequestURL, 
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            }
        )

        const result = await response.json()
      
        await createFile(path, result.audioContent)
        playSpeech(path, setReading)

    } catch (err) {
        console.warn(err)
    }
}


 
const createFile = async (path, data) => {
    try {
        return await RNFS.writeFile(path, data, 'base64')
    } catch (err) {
        console.warn(err)
    }
}



const playSpeech = (path, setReading) => {

    if (speech && speech.isPlaying()) {
        speech.stop()
    }

    speech = new Sound(path, '', (error) => {
        if (error) {
            setReading(false)
            console.warn('failed to load the sound', error)
            return null
        }

        setReading(true)
        speech.play((success) => {
            if (!success) {
                console.warn('playback failed due to audio decoding errors')
            }
            setReading(false)
        })
        
      return null
    })

}