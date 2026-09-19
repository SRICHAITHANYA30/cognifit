import type { Language } from '../types';
import type { CommandEntry, VoiceIntent } from './voiceCommandsCore';

export const voiceCommands: Record<Language, Partial<Record<VoiceIntent, CommandEntry>>> = {
  en: {
    OPEN_HOME: {
      phrases: ['go home', 'open home', 'go to home', 'take me home', 'go back home', 'home'],
      keywords: ['home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['open memory matrix', 'start memory matrix', 'play memory matrix', 'take me to memory matrix', 'memory matrix'],
      keywords: ['memory matrix', 'memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['open music match', 'play music match', 'start music match', 'take me to music match', 'music match'],
      keywords: ['music match', 'music', 'match'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['open bamboo basket', 'play bamboo basket', 'start bamboo basket', 'open bamboo basket builder', 'bamboo basket builder', 'bamboo basket'],
      keywords: ['bamboo', 'basket', 'builder', 'weave'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['open pattern sequence', 'open pattern and sequence', 'play pattern sequence', 'pattern sequence', 'open muga motif', 'play muga motif', 'muga motif', 'pattern and sequence'],
      keywords: ['pattern', 'sequence', 'muga', 'motif'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['open word scramble', 'play word scramble', 'start word scramble', 'open word scramble and recall', 'word scramble', 'word scramble and recall'],
      keywords: ['word', 'scramble', 'letters'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['open math maze', 'play math maze', 'start math maze', 'open math maze and logic', 'math maze', 'math maze and logic'],
      keywords: ['math', 'maze', 'calculation'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['open photo memory', 'play photo memory', 'photo memory', 'open smriti rong', 'smriti rong', 'reminiscence', 'look at photos'],
      keywords: ['photo memory', 'photo', 'smriti', 'reminiscence', 'memory', 'photos'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['open taal', 'play taal', 'open taal xur', 'taal xur', 'open rhythm game', 'rhythm game', 'taal and reflex'],
      keywords: ['taal', 'xur', 'rhythm', 'reflex', 'drum'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['open what changed', 'play what changed', 'what changed', 'open observation game', 'observation game', 'spot the change'],
      keywords: ['what changed', 'changed', 'observation'],
    },
    OPEN_PROGRESS: {
      phrases: ['open my progress', 'open progress', 'open my progress report', 'my progress'],
      keywords: ['progress', 'report'],
    },
    READ_PROGRESS: {
      phrases: ['show my progress', 'show progress', 'read my progress', 'how am i doing', 'show me my progress'],
      keywords: ['progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['open reminders', 'show reminders', 'show my reminders', 'open my reminders', 'open reminders and alarms', 'reminders'],
      keywords: ['reminder', 'reminders', 'alarm', 'alarms'],
    },
    SET_REMINDER: {
      phrases: ['set a reminder', 'set reminder', 'add reminder', 'create reminder', 'make a reminder', 'schedule reminder'],
      keywords: ['reminder', 'set'],
    },
    OPEN_CAREGIVER: {
      phrases: ['open caregiver', 'open caregiver dashboard', 'open caregiver hub', 'caregiver dashboard', 'caregiver hub', 'open doctor hub'],
      keywords: ['caregiver', 'caregiver dashboard', 'doctor', 'asha'],
    },
    OPEN_SETTINGS: {
      phrases: ['open settings', 'open display settings', 'open theme settings', 'open font settings', 'settings'],
      keywords: ['settings', 'theme', 'font', 'display'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['change language', 'open language selection', 'switch language', 'select language', 'change the language', 'language settings'],
      keywords: ['language'],
    },
    GO_BACK: {
      phrases: ['go back', 'back', 'go back to previous', 'previous page', 'turn back', 'go back one page'],
      keywords: ['back'],
    },
    LOGOUT: {
      phrases: ['log out', 'logout', 'sign out', 'log me out', 'exit the app', 'log off', 'sign me out'],
      keywords: ['logout', 'signout'],
    },
    START_GAME: {
      phrases: ['start game', 'start the game', 'start playing', 'begin', 'let us start', 'begin game'],
      keywords: ['start', 'begin'],
    },
    PAUSE_GAME: {
      phrases: ['pause game', 'pause', 'pause the game', 'hold on', 'wait a moment', 'take a pause'],
      keywords: ['pause', 'hold', 'wait'],
    },
    RESUME_GAME: {
      phrases: ['resume game', 'resume', 'resume the game', 'continue playing', 'keep going', 'continue game'],
      keywords: ['resume', 'continue'],
    },
    NEXT: {
      phrases: ['next', 'next question', 'next one', 'go to next', 'move to next', 'next challenge'],
      keywords: ['next'],
    },
    REPEAT: {
      phrases: ['repeat', 'repeat question', 'say it again', 'repeat that', 'one more time', 'tell me again', 'repeat the question'],
      keywords: ['repeat', 'again'],
    },
    STOP: {
      phrases: ['stop', 'stop the game', 'stop playing', 'that is enough', 'no more', 'stop activity'],
      keywords: ['stop'],
    },
    READ_SCORE: {
      phrases: ['show score', 'show my score', 'read score', 'read my score', 'what is my score', 'my score', 'current score'],
      keywords: ['score'],
    },
    SHOW_REWARDS: {
      phrases: ['show rewards', 'open rewards', 'my rewards', 'show my rewards', 'rewards', 'show prizes'],
      keywords: ['rewards', 'prize', 'prizes'],
    },
    SHOW_COINS: {
      phrases: ['show coins', 'show my coins', 'how many coins', 'how many coins do i have', 'my coins', 'show me my coins', 'count my coins'],
      keywords: ['coins', 'coin'],
    },
  },
  as: {
    OPEN_HOME: {
      phrases: ['ঘৰলৈ যাওক', 'ঘৰ খোলক', 'ঘৰলৈ উভতি যাওক', 'ঘৰলৈ লৈ যাওক', 'হোম খোলক'],
      keywords: ['ঘৰ', 'হোম', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['স্মৃতি মেট্রিক্স খোলক', 'স্মৃতি মেট্রিক্স আৰম্ভ কৰক', 'স্মৃতি মেট্রিক্স খেলক', 'মেমরি মেট্রিক্স খোলক', 'memory matrix খোলক', 'স্মৃতি মেট্রিক্স'],
      keywords: ['মেট্রিক্স', 'মেমরি', 'memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['মিউজিক ম্যাচ খোলক', 'সংগীত মিল খেলক', 'মিউজিক ম্যাচ খেলক', 'music match খোলক'],
      keywords: ['মিউজিক', 'ম্যাচ', 'সংগীত', 'music'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['বাঁহ টোকৰি খোলক', 'বাঁহ টোকৰি বনোৱা খেলক', 'bamboo basket খোলক', 'বাঁহ টোকৰি', 'টোকৰি বনি খেলক'],
      keywords: ['বাঁহ', 'টোকৰি', 'bamboo', 'basket'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['চানেকি খোলক', 'চানেকি আৰু ক্ৰম খোলক', 'মুগা চানেকি খোলক', 'pattern sequence খোলক', 'ক্ৰম খেলক', 'মুগা মটিফ খোলক'],
      keywords: ['চানেকি', 'ক্ৰম', 'মুগা', 'pattern', 'sequence'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['শব্দ সাঁথৰ খোলক', 'শব্দ লিখা খেলক', 'word scramble খোলক', 'শব্দ সাঁথৰ', 'আখৰ সাঁথৰ'],
      keywords: ['শব্দ', 'সাঁথৰ', 'word', 'scramble'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['গণিত গোলকধাঁধা খোলক', 'হিচাপ খেলক', 'math maze খোলক', 'গণিত খেলক'],
      keywords: ['গণিত', 'হিচাপ', 'math', 'maze'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['স্মৃতি ৰং খোলক', 'ফটো স্মৃতি খোলক', 'স্মৃতি ৰং', 'photo memory খোলক', 'ছবি চাওক'],
      keywords: ['স্মৃতি', 'ফটো', 'ছবি', 'photo', 'smriti'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['তাল খোলক', 'তাল খেলক', 'ঢোল খেলক', 'taal খোলক', 'তাল আৰু সঁহাৰি খোলক'],
      keywords: ['তাল', 'ঢোল', 'rhythm', 'taal'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['কি সলনি খোলক', 'পৰিৱৰ্তন চাওক', 'what changed খোলক', 'সলনি চিনাক্ত খেলক'],
      keywords: ['সলনি', 'পৰিৱৰ্তন', 'changed'],
    },
    OPEN_PROGRESS: {
      phrases: ['মোৰ অগ্ৰগতি খোলক', 'অগ্ৰগতি দেখুওৱা', 'মোৰ অগ্ৰগতি'],
      keywords: ['অগ্ৰগতি', 'progress'],
    },
    READ_PROGRESS: {
      phrases: ['মোৰ অগ্ৰগতি দেখুৱাওক', 'কিমান আগুৱাইছো দেখাওক', 'মোৰ ৰিপোর্ট দেখুওৱা'],
      keywords: ['অগ্ৰগতি', 'progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['সোঁৱৰণী খোলক', 'সোঁৱৰণী দেখুওৱা', 'মোৰ সোঁৱৰণী', 'এইলের্ম দেখুওৱা'],
      keywords: ['সোঁৱৰণী', 'অ্যালার্ম', 'reminder'],
    },
    SET_REMINDER: {
      phrases: ['এটা সোঁৱৰণী দিয়ক', 'সোঁৱৰণী যোগ কৰক', 'সোঁৱৰণী গঠন কৰক'],
      keywords: ['সোঁৱৰণী', 'reminder'],
    },
    OPEN_CAREGIVER: {
      phrases: ['কেয়াৰগিভার ড্যাশবোর্ড খোলক', 'ডাক্তর হাব খোলক', 'কেয়াৰগিভার খোলক', 'caregiver খোলক'],
      keywords: ['কেয়াৰগিভার', 'ডাক্তর', 'caregiver'],
    },
    OPEN_SETTINGS: {
      phrases: ['চেটিং খোলক', 'বিন্যাস খোলক', 'থিম চেটিং খোলক', 'আখৰ মাপ চেটিং খোলক'],
      keywords: ['চেটিং', 'থিম', 'বিন্যাস', 'settings'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['ভাষা সলনি কৰক', 'ভাষা বাছনি খোলক', 'ভাষা সলাওক', 'ভাষা বাছক'],
      keywords: ['ভাষা', 'language'],
    },
    GO_BACK: {
      phrases: ['উভতি যাওক', 'পিছু হটক', 'পূৰ্বব পৃষ্ঠালৈ যাওক'],
      keywords: ['উভতি', 'পিছু', 'back'],
    },
    LOGOUT: {
      phrases: ['লগ আউট কৰক', 'লগ আউট', 'বাহিৰ হৈ যাওক', 'এক্সিট কৰক'],
      keywords: ['লগ আউট', 'logout'],
    },
    START_GAME: {
      phrases: ['খেল আৰম্ভ কৰক', 'আৰম্ভ কৰক', 'খেলা আৰম্ভ', 'শুৰু কৰক'],
      keywords: ['আৰম্ভ', 'শুৰু', 'খেল'],
    },
    PAUSE_GAME: {
      phrases: ['খেল বিৰতি দিয়ক', 'বিৰতি', 'বিৰতি লওক', 'অলপ ৰওক'],
      keywords: ['বিৰতি', 'pause'],
    },
    RESUME_GAME: {
      phrases: ['খেল আকৌ চালু কৰক', 'চালু কৰক', 'আকৌ আৰম্ভ', 'জাৰি ৰাখক'],
      keywords: ['চালু', 'resume'],
    },
    NEXT: {
      phrases: ['পৰৱৰ্তী', 'পৰৱৰ্তী প্ৰশ্ন', 'আগবাঢ়ক', 'আগলৈ যাওক'],
      keywords: ['পৰৱৰ্তী', 'আগবাঢ়', 'next'],
    },
    REPEAT: {
      phrases: ['আকৌ কওক', 'প্ৰশ্নটো আকৌ শুনা', 'আৰু এবাৰ', 'আকৌ শুনাওক'],
      keywords: ['আকৌ', 'পুনৰ', 'repeat'],
    },
    STOP: {
      phrases: ['যথেষ্ট', 'বন্ধ কৰক', 'খেল বন্ধ', 'আটক দিয়ক'],
      keywords: ['বন্ধ', 'যথেষ্ট', 'stop'],
    },
    READ_SCORE: {
      phrases: ['স্কোৰ দেখুওৱা', 'মোৰ স্কোৰ', 'স্কোৰ কিমান', 'স্কোৰ বুলি কওক'],
      keywords: ['স্কোৰ', 'score'],
    },
    SHOW_REWARDS: {
      phrases: ['পুৰস্কাৰ দেখুওৱা', 'মোৰ পুৰস্কাৰ', 'বঁটা দেখুওৱা'],
      keywords: ['পুৰস্কাৰ', 'বঁটা', 'rewards'],
    },
    SHOW_COINS: {
      phrases: ['মোৰ কয়েন দেখুওৱা', 'কয়েন কিমান আছে', 'মোৰ মুদা দেখুওৱা', 'কয়েন কেইটা আছে'],
      keywords: ['কয়েন', 'মুদা', 'coins'],
    },
  },
  bn: {
    OPEN_HOME: {
      phrases: ['বাড়িতে যান', 'বাড়ি খুলুন', 'হোমে যান', 'বাসায় নিয়ে যান', 'হোম খুলুন'],
      keywords: ['বাড়ি', 'হোম', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['মেমোরি ম্যাট্রিক্স খুলুন', 'মেমোরি ম্যাট্রিক্স শুরু করুন', 'মেমোরি ম্যাট্রিক্স খেলুন', 'memory matrix খুলুন', 'মেমোরি ম্যাট্রিক্স'],
      keywords: ['মেমোরি', 'ম্যাট্রিক্স', 'memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['মিউজিক ম্যাচ খুলুন', 'সংগীত মেলান খেলুন', 'মিউজিক ম্যাচ খেলুন', 'music match খুলুন'],
      keywords: ['মিউজিক', 'ম্যাচ', 'সংগীত', 'music'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['বাঁশের ঝুড়ি খুলুন', 'বাঁশের ঝুড়ি তৈরির খেলা খুলুন', 'bamboo basket খুলুন', 'বাঁশের ঝুড়ি'],
      keywords: ['বাঁশ', 'ঝুড়ি', 'bamboo', 'basket'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['প্যাটার্ন ও সিকোয়েন্স খুলুন', 'মুগা প্যাটার্ন খুলুন', 'pattern sequence খুলুন', 'ধাঁচ খুলুন', 'নকশা খেলুন'],
      keywords: ['প্যাটার্ন', 'সিকোয়েন্স', 'ধাঁচ', 'নকশা', 'pattern', 'sequence'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['শব্দ ধাঁধা খুলুন', 'শব্দ খেলা খুলুন', 'word scramble খুলুন', 'শব্দ ধাঁধা', 'শব্দ সাজানো খেলা'],
      keywords: ['শব্দ', 'ধাঁধা', 'word', 'scramble'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['গণিত ধাঁধা খুলুন', 'হিসাব খেলুন', 'math maze খুলুন', 'গণিত খেলুন'],
      keywords: ['গণিত', 'হিসাব', 'math', 'maze'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['স্মৃতি রং খুলুন', 'ছবির স্মৃতি খুলুন', 'স্মৃতি রং', 'photo memory খুলুন', 'ছবি দেখুন'],
      keywords: ['স্মৃতি', 'ছবি', 'photo', 'smriti'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['তাল খুলুন', 'তাল খেলুন', 'ঢোল খেলুন', 'taal খুলুন', 'তাল ও প্রতিক্রিয়া খুলুন'],
      keywords: ['তাল', 'ঢোল', 'rhythm', 'taal'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['কী বদলেছে খুলুন', 'পার্থক্য চিহ্নিত খেলুন', 'what changed খুলুন', 'পরিবর্তন দেখুন'],
      keywords: ['বদল', 'পার্থক্য', 'পরিবর্তন', 'changed'],
    },
    OPEN_PROGRESS: {
      phrases: ['অগ্রগতি খুলুন', 'আমার অগ্রগতি খুলুন', 'আমার অগ্রগতি'],
      keywords: ['অগ্রগতি', 'progress'],
    },
    READ_PROGRESS: {
      phrases: ['আমার অগ্রগতি দেখান', 'কতটা এগিয়েছি দেখান', 'আমার প্রতিবেদন দেখান'],
      keywords: ['অগ্রগতি', 'progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['রিমাইন্ডার খুলুন', 'স্মরণ করানোর তালিকা দেখান', 'আমার রিমাইন্ডার', 'অ্যালার্ম দেখান'],
      keywords: ['রিমাইন্ডার', 'অ্যালার্ম', 'reminder'],
    },
    SET_REMINDER: {
      phrases: ['একটি রিমাইন্ডার দিন', 'রিমাইন্ডার যোগ করুন', 'স্মরণ করানোর ব্যবস্থা করুন'],
      keywords: ['রিমাইন্ডার', 'reminder'],
    },
    OPEN_CAREGIVER: {
      phrases: ['কেয়ারগিভার ড্যাশবোর্ড খুলুন', 'ডাক্তারের হাব খুলুন', 'কেয়ারগিভার খুলুন', 'caregiver খুলুন'],
      keywords: ['কেয়ারগিভার', 'ডাক্তার', 'caregiver'],
    },
    OPEN_SETTINGS: {
      phrases: ['সেটিংস খুলুন', 'সেটিং খুলুন', 'থিম সেটিং খুলুন', 'ফন্ট সেটিং খুলুন'],
      keywords: ['সেটিংস', 'থিম', 'ফন্ট', 'settings'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['ভাষা পরিবর্তন করুন', 'ভাষা নির্বাচন খুলুন', 'ভাষা বদলান', 'ভাষা বাছুন'],
      keywords: ['ভাষা', 'language'],
    },
    GO_BACK: {
      phrases: ['ফিরে যান', 'পেছনে যান', 'আগের পৃষ্ঠায় যান'],
      keywords: ['ফিরে', 'পেছনে', 'back'],
    },
    LOGOUT: {
      phrases: ['লগ আউট করুন', 'লগ আউট', 'বেরিয়ে যান', 'এক্সিট করুন'],
      keywords: ['লগ আউট', 'logout'],
    },
    START_GAME: {
      phrases: ['খেলা শুরু করুন', 'শুরু করুন', 'খেলা শুরু', 'শুরু করি'],
      keywords: ['শুরু', 'খেলা'],
    },
    PAUSE_GAME: {
      phrases: ['খেলা বিরতি দিন', 'বিরতি', 'একটু থামুন', 'অপেক্ষা করুন'],
      keywords: ['বিরতি', 'pause'],
    },
    RESUME_GAME: {
      phrases: ['খেলা আবার চালু করুন', 'চালু করুন', 'আবার শুরু', 'চালিয়ে যান'],
      keywords: ['চালু', 'resume'],
    },
    NEXT: {
      phrases: ['পরের', 'পরের প্রশ্ন', 'এগিয়ে যান', 'আগের দিকে যান'],
      keywords: ['পরের', 'এগিয়ে', 'next'],
    },
    REPEAT: {
      phrases: ['আবার বলুন', 'প্রশ্ন আবার শোনান', 'আরও একবার', 'আবার শুনুন'],
      keywords: ['আবার', 'পুনরায়', 'repeat'],
    },
    STOP: {
      phrases: ['থামুন', 'খেলা বন্ধ করুন', 'যথেষ্ট হয়েছে', 'বন্ধ করুন'],
      keywords: ['থাম', 'বন্ধ', 'stop'],
    },
    READ_SCORE: {
      phrases: ['স্কোর দেখান', 'আমার স্কোর', 'স্কোর কত', 'স্কোর বলুন'],
      keywords: ['স্কোর', 'score'],
    },
    SHOW_REWARDS: {
      phrases: ['পুরস্কার দেখান', 'আমার পুরস্কার', 'পুরস্কার দেখুন'],
      keywords: ['পুরস্কার', 'rewards'],
    },
    SHOW_COINS: {
      phrases: ['আমার কয়েন দেখান', 'কয়েন কত আছে', 'আমার টাকা দেখান', 'কয়েন কয়টা আছে'],
      keywords: ['কয়েন', 'টাকা', 'coins'],
    },
  },
  lus: {
    OPEN_HOME: {
      phrases: ['in lama kal', 'in haw leh', 'in hmun hawn', 'home hawn'],
      keywords: ['in', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['memory matrix hawn', 'memory matrix tan', 'memory matrix chel', 'memory matrix'],
      keywords: ['memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['music match hawn', 'music match chel', 'music match tan', 'music match'],
      keywords: ['music', 'match'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['bamboo basket hawn', 'bamboo basket chel', 'bamboo basket siam', 'bamboo basket'],
      keywords: ['bamboo', 'basket', 'siam'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['pattern sequence hawn', 'pattern sequence chel', 'muga pattern hawn', 'pattern sequence'],
      keywords: ['pattern', 'sequence', 'muga'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['word scramble hawn', 'word scramble chel', 'thu lem chel', 'word scramble'],
      keywords: ['word', 'scramble', 'thu'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['math maze hawn', 'math maze chel', 'chhiar leh ngaihtuah chel', 'math maze'],
      keywords: ['math', 'maze', 'chhiar'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['photo memory hawn', 'photo en', 'smriti rong hawn', 'photo memory'],
      keywords: ['photo', 'memory', 'smriti', 'photo en'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['taal hawn', 'taal chel', 'khuang chel', 'taal xur hawn', 'rhythm chel'],
      keywords: ['taal', 'khuang', 'rhythm', 'dawl'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['what changed hawn', 'thleng hawn', 'what changed chel', 'danglam en'],
      keywords: ['changed', 'thleng', 'danglam'],
    },
    OPEN_PROGRESS: {
      phrases: ['ka progress hawn', 'progress hawn', 'ka progress'],
      keywords: ['progress'],
    },
    READ_PROGRESS: {
      phrases: ['ka progress târ lang', 'engtia ka fe tih min hrilh', 'ka report târ lang'],
      keywords: ['progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['reminder hawn', 'reminder târ lang', 'ka reminder', 'alarm târ lang'],
      keywords: ['reminder', 'alarm'],
    },
    SET_REMINDER: {
      phrases: ['reminder siam', 'reminder thlen', 'tzawngtu siam'],
      keywords: ['reminder', 'siam'],
    },
    OPEN_CAREGIVER: {
      phrases: ['caregiver dashboard hawn', 'doctor hub hawn', 'caregiver hawn', 'caregiver dashboard'],
      keywords: ['caregiver', 'doctor'],
    },
    OPEN_SETTINGS: {
      phrases: ['settings hawn', 'setting hawn', 'theme setting hawn', 'font setting hawn'],
      keywords: ['settings', 'theme', 'font'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['ṭawng thlak', 'ṭawng thlang', 'ṭawng duh thlan'],
      keywords: ['ṭawng', 'language'],
    },
    GO_BACK: {
      phrases: ['kir leh', 'haw leh', 'phel hmasa lama kir'],
      keywords: ['kir', 'haw'],
    },
    LOGOUT: {
      phrases: ['logout', 'log out', 'chhuak', 'app chhuak'],
      keywords: ['logout', 'chhuak'],
    },
    START_GAME: {
      phrases: ['game tan', 'tan', 'chel tan', 'thawk tan'],
      keywords: ['tan', 'start'],
    },
    PAUSE_GAME: {
      phrases: ['game ding', 'ding nghal', 'lo nghak', 'rehat teh'],
      keywords: ['ding', 'nghah'],
    },
    RESUME_GAME: {
      phrases: ['game thawk leh', 'thawk leh', 'nun leh', 'chel leh'],
      keywords: ['thawk', 'nun', 'resume'],
    },
    NEXT: {
      phrases: ['a hnu', 'hnu zawng', 'kal zel', 'hnu lama kal'],
      keywords: ['hnu', 'next'],
    },
    REPEAT: {
      phrases: ['tih leh', 'sawi leh', 'vawi khat zel', 'dawng leh'],
      keywords: ['tih leh', 'repeat'],
    },
    STOP: {
      phrases: ['ding', 'game dang', 'a tawk', 'chan tawh'],
      keywords: ['ding', 'tawp', 'stop'],
    },
    READ_SCORE: {
      phrases: ['score târ lang', 'ka score', 'score engtia', 'score min hrilh'],
      keywords: ['score'],
    },
    SHOW_REWARDS: {
      phrases: ['zawhte târ lang', 'ka zawhte', 'lâwma pek târ lang'],
      keywords: ['zawhte', 'rewards'],
    },
    SHOW_COINS: {
      phrases: ['ka coins târ lang', 'coins engzat nge', 'ka money târ lang'],
      keywords: ['coins', 'money'],
    },
  },
  mni: {
    OPEN_HOME: {
      phrases: ['yumda chatlo', 'yum hangdoklo', 'yumda hallaklo', 'yumda puro', 'home hangdoklo'],
      keywords: ['yum', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['memory matrix hangdoklo', 'memory matrix houramba', 'memory matrix sajello', 'memory matrix'],
      keywords: ['memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['music match hangdoklo', 'music match sajello', 'issei likhai hangdoklo', 'music match'],
      keywords: ['music', 'match', 'essei'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['bamboo basket hangdoklo', 'bamboo basket sajello', 'wabok theple ehakpa sajello', 'bamboo basket'],
      keywords: ['bamboo', 'basket', 'wabok', 'theple'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['pattern sequence hangdoklo', 'pattern sequence sajello', 'muga motif hangdoklo', 'machu hunba sajello', 'pattern sequence'],
      keywords: ['pattern', 'sequence', 'muga', 'machu'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['word scramble hangdoklo', 'word scramble sajello', 'wapao leihou sajello', 'word scramble'],
      keywords: ['word', 'scramble', 'wapao'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['math maze hangdoklo', 'math maze sajello', 'kayal sajello', 'math maze'],
      keywords: ['math', 'maze', 'kayal', 'khudon'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['photo memory hangdoklo', 'numer sapa thajello', 'smriti rong hangdoklo', 'photo memory'],
      keywords: ['photo', 'memory', 'smriti', 'numer'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['taal hangdoklo', 'taal sajello', 'pung sajello', 'taal xur hangdoklo'],
      keywords: ['taal', 'pung', 'rhythm', 'dhol'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['what changed hangdoklo', 'kari honglambage ningsingba sajello', 'what changed sajello', 'honglamba uyu'],
      keywords: ['changed', 'hongla', 'honglamba'],
    },
    OPEN_PROGRESS: {
      phrases: ['eigi progress hangdoklo', 'progress hangdoklo', 'eigi progress'],
      keywords: ['progress'],
    },
    READ_PROGRESS: {
      phrases: ['eigi progress utlo', 'kayada chenkhrabage utlo', 'eigi report utlo'],
      keywords: ['progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['reminder hangdoklo', 'reminder utlo', 'eigi reminder', 'alarm utlo'],
      keywords: ['reminder', 'alarm'],
    },
    SET_REMINDER: {
      phrases: ['reminder thamo', 'reminder thadoklo', 'nungsibi thamo'],
      keywords: ['reminder', 'thamo'],
    },
    OPEN_CAREGIVER: {
      phrases: ['caregiver dashboard hangdoklo', 'doctor hub hangdoklo', 'caregiver hangdoklo', 'caregiver dashboard'],
      keywords: ['caregiver', 'doctor'],
    },
    OPEN_SETTINGS: {
      phrases: ['settings hangdoklo', 'setting hangdoklo', 'theme setting hangdoklo', 'font setting hangdoklo'],
      keywords: ['settings', 'theme', 'font'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['lon hongdoklo', 'lon thamlo', 'lon thadoklo', 'lon thajello'],
      keywords: ['lon', 'language'],
    },
    GO_BACK: {
      phrases: ['hallaklo', 'amyangda chatlo', 'mamanggi page da chatlo'],
      keywords: ['hallak', 'back'],
    },
    LOGOUT: {
      phrases: ['logout', 'log out', 'thok nang chattuna thoklo', 'log out touro'],
      keywords: ['logout', 'out'],
    },
    START_GAME: {
      phrases: ['game houramba', 'houramba', 'sajel houramba', 'thabak houramba'],
      keywords: ['houra', 'start'],
    },
    PAUSE_GAME: {
      phrases: ['game ngaklo', 'ngaklo', 'ngalbak ejou', 'khara ngaklo'],
      keywords: ['ngak', 'pause'],
    },
    RESUME_GAME: {
      phrases: ['game mashakka sajello', 'asum thoklo', 'sajel lep thoklo', 'game wakongbu thoklo'],
      keywords: ['thoklo', 'resume'],
    },
    NEXT: {
      phrases: ['matungda', 'matunggi question', 'chatkhiro', 'mamangda chatlo'],
      keywords: ['matung', 'next'],
    },
    REPEAT: {
      phrases: ['ammuk chatlo', 'question ammuk takhiro', 'amanba thajello', 'ammuk hangkhiro'],
      keywords: ['ammuk', 'repeat'],
    },
    STOP: {
      phrases: ['louhou', 'game louhou', 'asi touba thengdoklo', 'lakpa lepthoklo'],
      keywords: ['louhou', 'stop'],
    },
    READ_SCORE: {
      phrases: ['score utlo', 'eigi score', 'score kayada', 'score takhiro'],
      keywords: ['score'],
    },
    SHOW_REWARDS: {
      phrases: ['rewards utlo', 'eigi rewards', 'manam utlo', 'phibasak utlo'],
      keywords: ['rewards', 'manam'],
    },
    SHOW_COINS: {
      phrases: ['eigi coins utlo', 'coins kayada leige', 'eigi sent utlo', 'coins asum utlo'],
      keywords: ['coins', 'sent'],
    },
  },
  kha: {
    OPEN_HOME: {
      phrases: ['wan leit sha iing', 'phi khot iing', 'leit sha iing', 'hika home'],
      keywords: ['iing', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['memory matrix biang', 'memory matrix sdang', 'memory matrix pynkai', 'memory matrix'],
      keywords: ['memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['music match biang', 'music match pynkai', 'music match sdang', 'music match'],
      keywords: ['music', 'match'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['bamboo basket biang', 'bamboo basket pynkai', 'mieni khyllung biang', 'bamboo basket'],
      keywords: ['bamboo', 'basket', 'mieni', 'khyllung'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['pattern sequence biang', 'pattern sequence pynkai', 'jaintia pattern biang', 'muga motif biang', 'pattern sequence'],
      keywords: ['pattern', 'sequence', 'muga', 'risa'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['word scramble biang', 'word scramble pynkai', 'fyrkad ka ktien biang', 'word scramble'],
      keywords: ['word', 'scramble', 'fyrkad'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['math maze biang', 'math maze pynkai', 'liship biang', 'math maze'],
      keywords: ['math', 'maze', 'liship', 'iew'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['photo memory biang', 'phi peit phi dur khula', 'smriti rong biang', 'photo memory'],
      keywords: ['photo', 'memory', 'smriti', 'dur'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['taal biang', 'taal pynkai', 'shtar biang', 'taal xur biang', 'rhythm pynkai'],
      keywords: ['taal', 'shtar', 'rhythm', 'ksar'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['what changed biang', 'aieh ba la kylla biang', 'what changed pynkai', 'kylla peit'],
      keywords: ['changed', 'kylla'],
    },
    OPEN_PROGRESS: {
      phrases: ['iajot ha mynsiem ka biang', 'my progress biang', 'ia my progress'],
      keywords: ['progress'],
    },
    READ_PROGRESS: {
      phrases: ['sha my progress', 'kumno ngi la leit', 'sha ka report'],
      keywords: ['progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['reminder biang', 'phi sha reminder', 'ia ka reminder', 'alarm sha'],
      keywords: ['reminder', 'alarm'],
    },
    SET_REMINDER: {
      phrases: ['buht reminder', 'reminder buh', 'reminder thied'],
      keywords: ['reminder'],
    },
    OPEN_CAREGIVER: {
      phrases: ['caregiver dashboard biang', 'doctor hub biang', 'caregiver biang', 'caregiver dashboard'],
      keywords: ['caregiver', 'doctor'],
    },
    OPEN_SETTINGS: {
      phrases: ['settings biang', 'setting biang', 'theme setting biang', 'font setting biang'],
      keywords: ['settings', 'theme', 'font'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['pynkylla ka ktien', 'thied ka ktien', 'suid ka ktien', 'pynkylla ka language'],
      keywords: ['ktien', 'language'],
    },
    GO_BACK: {
      phrases: ['wan phai', 'leit phai', 'wan bud ha shwa'],
      keywords: ['phai', 'back'],
    },
    LOGOUT: {
      phrases: ['iatoh noh', 'log out', 'phi mih noh', 'la iatmih noh'],
      keywords: ['iatoh noh', 'logout'],
    },
    START_GAME: {
      phrases: ['sdang ka game', 'sdang', 'sdang ka pynkai', 'sdang hi'],
      keywords: ['sdang', 'start'],
    },
    PAUSE_GAME: {
      phrases: ['nieh shisien', 'nieh', 'shong shisien', 'ap shisien'],
      keywords: ['nieh', 'ap', 'pause'],
    },
    RESUME_GAME: {
      phrases: ['pynkylla shisien', 'sdang wat', 'pynutsap shisien', 'pynkai wat'],
      keywords: ['pynutsap', 'resume'],
    },
    NEXT: {
      phrases: ['ka bud', 'ka bud ka question', 'bud wat', 'leit sha bud'],
      keywords: ['bud', 'next'],
    },
    REPEAT: {
      phrases: ['bud kurang', 'ka question wat', 'wat shisien', 'sngap wat'],
      keywords: ['wat', 'repeat'],
    },
    STOP: {
      phrases: ['sah', 'sah ka game', 'shangai', 'duh shisien'],
      keywords: ['sah', 'stop'],
    },
    READ_SCORE: {
      phrases: ['sha ka score', 'ka score', 'haeh ka score', 'ka score katta'],
      keywords: ['score'],
    },
    SHOW_REWARDS: {
      phrases: ['sha ki rewards', 'ka rewards', 'ka bahan', 'ka jingman'],
      keywords: ['rewards', 'bahan', 'jingman'],
    },
    SHOW_COINS: {
      phrases: ['sha ki coins', 'haeh ka coins', 'ki coins katta', 'ki pisa katta'],
      keywords: ['coins', 'pisa'],
    },
  },
  grt: {
    OPEN_HOME: {
      phrases: ['nokna reangbo', 'nok ko ongata', 'nokna songbo', 'home ongata'],
      keywords: ['nok', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['memory matrix ongata', 'memory matrix aachakenga', 'memory matrix watenga', 'memory matrix'],
      keywords: ['memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['music match ongata', 'music match watenga', 'music match aachakenga', 'music match'],
      keywords: ['music', 'match'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['bamboo basket ongata', 'bamboo basket watenga', 'wa doke ongata', 'bamboo basket'],
      keywords: ['bamboo', 'basket', 'wa', 'doke'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['pattern sequence ongata', 'pattern sequence watenga', 'muga pattern ongata', 'dalani ongata', 'pattern sequence'],
      keywords: ['pattern', 'sequence', 'muga', 'dalani'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['word scramble ongata', 'word scramble watenga', 'katta ongata', 'word scramble'],
      keywords: ['word', 'scramble', 'katta'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['math maze ongata', 'math maze watenga', 'kena ongata', 'math maze'],
      keywords: ['math', 'maze', 'kena'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['photo memory ongata', 'photo ko naiko', 'smriti rong ongata', 'photo memory'],
      keywords: ['photo', 'memory', 'smriti', 'naiko'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['taal ongata', 'taal watenga', 'damdin ongata', 'taal xur ongata', 'rhythm ongata'],
      keywords: ['taal', 'damdin', 'rhythm', 'dambe'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['what changed ongata', 'maia dangdikbae ongata', 'what changed watenga', 'dikgipa niko'],
      keywords: ['changed', 'dangdik'],
    },
    OPEN_PROGRESS: {
      phrases: ['anga progress ongata', 'progress ongata', 'anga progress'],
      keywords: ['progress'],
    },
    READ_PROGRESS: {
      phrases: ['anga progress mesokbo', 'maiaba rang baten nika mesokbo', 'anga report mesokbo'],
      keywords: ['progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['reminder ongata', 'reminder mesokbo', 'anga reminder', 'alarm mesokbo'],
      keywords: ['reminder', 'alarm'],
    },
    SET_REMINDER: {
      phrases: ['reminder rako', 'reminder dontiako', 'reminder todako'],
      keywords: ['reminder', 'rako'],
    },
    OPEN_CAREGIVER: {
      phrases: ['caregiver dashboard ongata', 'doctor hub ongata', 'caregiver ongata', 'caregiver dashboard'],
      keywords: ['caregiver', 'doctor'],
    },
    OPEN_SETTINGS: {
      phrases: ['settings ongata', 'setting ongata', 'theme setting ongata', 'font setting ongata'],
      keywords: ['settings', 'theme', 'font'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['skia danggede', 'ku·sik danggede', 'ku·sik dongroka', 'ku·sik ongata'],
      keywords: ['ku·sik', 'language'],
    },
    GO_BACK: {
      phrases: ['jari ko reangbo', 'jari ongata', 'mukangni page na reangbo'],
      keywords: ['jari', 'back'],
    },
    LOGOUT: {
      phrases: ['log out ko', 'logout', 'ongkatatbo', 'appaon katbo'],
      keywords: ['logout', 'katbo'],
    },
    START_GAME: {
      phrases: ['game aachak', 'aachak', 'game aachakenga', 'aachakbo'],
      keywords: ['aachak', 'start'],
    },
    PAUSE_GAME: {
      phrases: ['game moumanda', 'manda', 'mamam kisiko', 'chongmotbae nike'],
      keywords: ['manda', 'pause'],
    },
    RESUME_GAME: {
      phrases: ['game namen napbo', 'napbo', 'aachak napbo', 'game gitchakbo'],
      keywords: ['napbo', 'resume'],
    },
    NEXT: {
      phrases: ['gnigipa', 'gnigipa question', 'napken', 'bobilna reangbo'],
      keywords: ['gnigipa', 'nap', 'next'],
    },
    REPEAT: {
      phrases: ['gombo', 'question gomna', 'saksa bate', 'sko reangbo'],
      keywords: ['gom', 'repeat'],
    },
    STOP: {
      phrases: ['doka', 'game doka', 'maila mikkia', 'dokanga'],
      keywords: ['doka', 'stop'],
    },
    READ_SCORE: {
      phrases: ['score mesokbo', 'anga score', 'score maiaba', 'score aganbo'],
      keywords: ['score'],
    },
    SHOW_REWARDS: {
      phrases: ['rewards mesokbo', 'anga rewards', 'dalgipa ongata', 'ona mesokbo'],
      keywords: ['rewards', 'dalgipa'],
    },
    SHOW_COINS: {
      phrases: ['anga coins mesokbo', 'coins maiaba donga', 'anga patta mesokbo', 'coins sakantini'],
      keywords: ['coins', 'patta'],
    },
  },
  trp: {
    OPEN_HOME: {
      phrases: ['nokma tokbo', 'nok khaibo', 'nokni anini tokbo', 'home khaibo'],
      keywords: ['nok', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['memory matrix khaibo', 'memory matrix jakkabo', 'memory matrix okkabo', 'memory matrix'],
      keywords: ['memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['music match khaibo', 'music match okkabo', 'siring mwm khi tokbo', 'music match'],
      keywords: ['music', 'match', 'siring'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['bamboo basket khaibo', 'bamboo basket okkabo', 'wa ha pakho khaibo', 'bamboo basket'],
      keywords: ['bamboo', 'basket', 'wa', 'pakho'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['pattern sequence khaibo', 'pattern sequence okkabo', 'muga motif khaibo', 'pata khaibo', 'pattern sequence'],
      keywords: ['pattern', 'sequence', 'muga', 'pata'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['word scramble khaibo', 'word scramble okkabo', 'kok salam khaibo', 'word scramble'],
      keywords: ['word', 'scramble', 'kok'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['math maze khaibo', 'math maze okkabo', 'sikhang khaibo', 'math maze'],
      keywords: ['math', 'maze', 'sikhang'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['photo memory khaibo', 'photo lang nairo', 'smriti rong khaibo', 'photo memory'],
      keywords: ['photo', 'memory', 'smriti', 'lang'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['taal khaibo', 'taal okkabo', 'khuwang okkabo', 'taal xur khaibo', 'rhythm khaibo'],
      keywords: ['taal', 'khuwang', 'rhythm', 'dhol'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['what changed khaibo', 'ba okkaksini khaibo', 'what changed okkabo', 'okkkak nokhu tong'],
      keywords: ['changed', 'okkkak'],
    },
    OPEN_PROGRESS: {
      phrases: ['angka progress khaibo', 'progress khaibo', 'angka progress'],
      keywords: ['progress'],
    },
    READ_PROGRESS: {
      phrases: ['angka progress naizok', 'bidi tangbai naizok', 'angka report naizok'],
      keywords: ['progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['reminder khaibo', 'reminder naizok', 'angka reminder', 'alarm naizok'],
      keywords: ['reminder', 'alarm'],
    },
    SET_REMINDER: {
      phrases: ['reminder wngbo', 'reminder thakbo', 'reminder nokhongbo'],
      keywords: ['reminder', 'wngbo'],
    },
    OPEN_CAREGIVER: {
      phrases: ['caregiver dashboard khaibo', 'doctor hub khaibo', 'caregiver khaibo', 'caregiver dashboard'],
      keywords: ['caregiver', 'doctor'],
    },
    OPEN_SETTINGS: {
      phrases: ['settings khaibo', 'setting khaibo', 'theme setting khaibo', 'font setting khaibo'],
      keywords: ['settings', 'theme', 'font'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['kwm sqlai', 'kwm thakbo', 'kwmbang thakbo', 'kwm khaibo'],
      keywords: ['kwm', 'language'],
    },
    GO_BACK: {
      phrases: ['tai gangbo', 'tai khaibo', 'mukangni page na karbo'],
      keywords: ['tai', 'back'],
    },
    LOGOUT: {
      phrases: ['logout', 'log out', 'tang khai', 'app tang khai'],
      keywords: ['logout', 'khai'],
    },
    START_GAME: {
      phrases: ['game okkabo', 'okkabo', 'game jakkabo', 'khato okkabo'],
      keywords: ['okka', 'start'],
    },
    PAUSE_GAME: {
      phrases: ['game lekbo', 'lekbo', 'kbila lekbo', 'khwa lekbo'],
      keywords: ['lekbo', 'pause'],
    },
    RESUME_GAME: {
      phrases: ['game salam jabo', 'salam', 'jabo', 'game pni jakkabo'],
      keywords: ['salam', 'resume'],
    },
    NEXT: {
      phrases: ['nwngkho', 'nwngkho question', 'tokbo nana', 'suk tokbo'],
      keywords: ['nwngkho', 'next'],
    },
    REPEAT: {
      phrases: ['khanaije', 'question khanaije', 'suk khanaije', 'khana'],
      keywords: ['khana', 'repeat'],
    },
    STOP: {
      phrases: ['thodo', 'game thodo', 'nangwa', 'khothobo'],
      keywords: ['thodo', 'stop'],
    },
    READ_SCORE: {
      phrases: ['score naizok', 'angka score', 'score bidi', 'score khwa naizok'],
      keywords: ['score'],
    },
    SHOW_REWARDS: {
      phrases: ['rewards naizok', 'angka rewards', 'omani naizok', 'o mongma naizok'],
      keywords: ['rewards', 'omani'],
    },
    SHOW_COINS: {
      phrases: ['angka coins naizok', 'coins bidi tangbai', 'angka pai naizok', 'coins pumuko'],
      keywords: ['coins', 'pai'],
    },
  },
  ne: {
    OPEN_HOME: {
      phrases: ['घर जाने', 'घर खोल्ने', 'घर जाऔं', 'होम खोल्ने'],
      keywords: ['घर', 'होम', 'home'],
    },
    OPEN_MEMORY_MATRIX: {
      phrases: ['मेमोरी म्याट्रिक्स खोल्ने', 'मेमोरी म्याट्रिक्स सुरु गर्ने', 'मेमोरी म्याट्रिक्स खेल्ने', 'memory matrix खोल्ने', 'मेमोरी म्याट्रिक्स'],
      keywords: ['मेमोरी', 'म्याट्रिक्स', 'memory', 'matrix'],
    },
    OPEN_MUSIC_MATCH: {
      phrases: ['म्युजिक म्याच खोल्ने', 'संगीत मिलाने खेल खोल्ने', 'म्युजिक म्याच खेल्ने', 'music match खोल्ने'],
      keywords: ['म्युजिक', 'म्याच', 'संगीत', 'music'],
    },
    OPEN_BAMBOO_BASKET: {
      phrases: ['बांसको डोको खोल्ने', 'बांसको डोको बनाउने खेल', 'bamboo basket खोल्ने', 'बांसको डोको'],
      keywords: ['बांस', 'डोको', 'bamboo', 'basket'],
    },
    OPEN_PATTERN_SEQUENCE: {
      phrases: ['पैटर्न र सिक्वेन्स खोल्ने', 'मुगा पैटर्न खोल्ने', 'pattern sequence खोल्ने', 'नमुना खेल्ने', 'क्रम खेल्ने'],
      keywords: ['पैटर्न', 'सिक्वेन्स', 'नमुना', 'मुगा', 'pattern', 'sequence'],
    },
    OPEN_WORD_SCRAMBLE: {
      phrases: ['शब्द पहेली खोल्ने', 'शब्द खेल खोल्ने', 'word scramble खोल्ने', 'शब्द पहेली'],
      keywords: ['शब्द', 'पहेली', 'word', 'scramble'],
    },
    OPEN_MATH_MAZE: {
      phrases: ['गणित खेल खोल्ने', 'हिसाब खेल्ने', 'math maze खोल्ने', 'गणित खेल्ने'],
      keywords: ['गणित', 'हिसाब', 'math', 'maze'],
    },
    OPEN_SMRITI_RONG: {
      phrases: ['फोटो मेमोरी खोल्ने', 'तस्बिर हेर्ने', 'स्मृति रंग खोल्ने', 'photo memory खोल्ने'],
      keywords: ['मेमोरी', 'फोटो', 'तस्बिर', 'स्मृति', 'photo', 'smriti'],
    },
    OPEN_TAAL_XUR: {
      phrases: ['ताल खोल्ने', 'ताल खेल्ने', 'मादल खेल्ने', 'taal खोल्ने', 'ताल र प्रतिक्रिया खोल्ने'],
      keywords: ['ताल', 'मादल', 'rhythm', 'taal'],
    },
    OPEN_WHAT_CHANGED: {
      phrases: ['के परिवर्तन खोल्ने', 'अन्तर पहिचान खेल', 'what changed खोल्ने', 'फरक देख्ने खेल'],
      keywords: ['परिवर्तन', 'अन्तर', 'फरक', 'changed'],
    },
    OPEN_PROGRESS: {
      phrases: ['मेरो प्रगति खोल्ने', 'प्रगति खोल्ने', 'मेरो प्रगति'],
      keywords: ['प्रगति', 'progress'],
    },
    READ_PROGRESS: {
      phrases: ['मेरो प्रगति देखाउने', 'कति अगाडि पुगें देखाउने', 'मेरो रिपोर्ट देखाउने'],
      keywords: ['प्रगति', 'progress'],
    },
    OPEN_REMINDERS: {
      phrases: ['रिमाइन्डर खोल्ने', 'सम्झना देखाउने', 'मेरो रिमाइन्डर', 'अलार्म देखाउने'],
      keywords: ['रिमाइन्डर', 'अलार्म', 'reminder'],
    },
    SET_REMINDER: {
      phrases: ['रिमाइन्डर राख्ने', 'सम्झना थप्ने', 'सम्झना बनाउने'],
      keywords: ['रिमाइन्डर', 'reminder'],
    },
    OPEN_CAREGIVER: {
      phrases: ['केयरगिभर ड्यासबोर्ड खोल्ने', 'डाक्टर हब खोल्ने', 'केयरगिभर खोल्ने', 'caregiver खोल्ने'],
      keywords: ['केयरगिभर', 'डाक्टर', 'caregiver'],
    },
    OPEN_SETTINGS: {
      phrases: ['सेटिंग खोल्ने', 'सेटिंग्स खोल्ने', 'थिम सेटिंग खोल्ने', 'फन्ट सेटिंग खोल्ने'],
      keywords: ['सेटिंग', 'थिम', 'फन्ट', 'settings'],
    },
    OPEN_LANGUAGE_SELECTION: {
      phrases: ['भाषा परिवर्तन गर्ने', 'भाषा रोज्ने', 'भाषा बदल्ने', 'भाषा छान्ने'],
      keywords: ['भाषा', 'language'],
    },
    GO_BACK: {
      phrases: ['फर्किने', 'पछाडि जाने', 'अघिल्लो पानामा जाने'],
      keywords: ['फर्क', 'पछाडि', 'back'],
    },
    LOGOUT: {
      phrases: ['लग आउट', 'बाहिरिने', 'एक्सिट गर्ने', 'लग आउट गर्ने'],
      keywords: ['लग आउट', 'logout'],
    },
    START_GAME: {
      phrases: ['खेल सुरु गर्ने', 'सुरु गर्ने', 'खेल सुरु', 'शुरु गर्ने'],
      keywords: ['सुरु', 'शुरु', 'खेल'],
    },
    PAUSE_GAME: {
      phrases: ['खेल बिराम गर्ने', 'बिराम', 'एकछिन रोक्ने', 'पर्खने'],
      keywords: ['बिराम', 'pause'],
    },
    RESUME_GAME: {
      phrases: ['खेल फेरि चलाउने', 'चलाउने', 'फेरि सुरु', 'जारी राख्ने'],
      keywords: ['चलाउने', 'resume'],
    },
    NEXT: {
      phrases: ['अर्को', 'अर्को प्रश्न', 'अघि बढ्ने', 'अगाडि जाने'],
      keywords: ['अर्को', 'अघि', 'next'],
    },
    REPEAT: {
      phrases: ['फेरि भन्ने', 'प्रश्न फेरि सुनाउने', 'अर्को पटक', 'फेरि सुन्ने'],
      keywords: ['फेरि', 'पुनः', 'repeat'],
    },
    STOP: {
      phrases: ['रोक्ने', 'खेल बन्द गर्ने', 'पुग्यो', 'बन्द गर्ने'],
      keywords: ['रोक', 'बन्द', 'stop'],
    },
    READ_SCORE: {
      phrases: ['स्कोर देखाउने', 'मेरो स्कोर', 'स्कोर कति', 'स्कोर भन्ने'],
      keywords: ['स्कोर', 'score'],
    },
    SHOW_REWARDS: {
      phrases: ['पुरस्कार देखाउने', 'मेरो पुरस्कार', 'पुरस्कार हेर्ने'],
      keywords: ['पुरस्कार', 'rewards'],
    },
    SHOW_COINS: {
      phrases: ['मेरो क्विन देखाउने', 'क्विन कति छ', 'मेरो रकम देखाउने', 'क्विन कति वटा छ'],
      keywords: ['क्विन', 'रकम', 'coins'],
    },
  },
};