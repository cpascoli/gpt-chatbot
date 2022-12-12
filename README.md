# GPT3 ChatBot

A React native app to talk to GPT-3 on your iOS or Android device.
Builds and runs on iOS simulator and iOS devices (Untested on Android)

Uses: 
- *React Native Voice* for speech to text.
- *React Native TTS* or *Google Cloud Text-to-Speech * for text to speech.

The basic workflow is the following:

`Speech to Text => GPT-3 completiopn request => Text to Speech`


# Main features

- Dual language supports (English and italian)
- Support React native or Google Cloud text to speech.
- Support for open-ai chat and Q&A completions modes.


# Prerequisites

- Install XCode with command line utils
- Add `.env` file with the following API keys:

```
OPEN_AI_API_KEY=<Your OpenAI API key>
GOOGLE_API_KEY=<Your Google Cloud Text-to-Speech API key>
```


# Build
```
npm install
npx pod-install

```

# Run on iOS Simulator

```
npx react-native run-ios
```

# Install on iOS Device
- Update Xcode project file with your Team.
- Update bundle identifier
- Build & Run on device

