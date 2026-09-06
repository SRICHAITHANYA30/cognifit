import type { Language } from '../types';

export interface TranslationStrings {
  appName: string;
  appSubtitle: string;
  offlineBadge: string;
  syncedBadge: string;
  kioskElderlyMode: string;
  caregiverMode: string;
  remindersNavBtn: string;
  displayNavBtn: string;
  pinRequiredTitle: string;
  pinPlaceholder: string;
  unlockButton: string;
  incorrectPin: string;
  backToHome: string;

  // Home Actions
  welcomePatient: string;
  dailyRoutineGreeting: string;
  todaysRoutine: string;
  markCompleted: string;
  completedBadge: string;
  listenReminder: string;
  voiceHelpButton: string;
  emergencyCallButton: string;

  // Game Hub
  playGameTitle: string;
  game1Title: string;
  game1Subtitle: string;
  game2Title: string;
  game2Subtitle: string;
  game3Title: string;
  game3Subtitle: string;
  game4Title: string;
  game4Subtitle: string;
  game5Title: string;
  game5Subtitle: string;
  game6Title: string;
  game6Subtitle: string;

  // Game Common
  tapToStart: string;
  level: string;
  score: string;
  wellDone: string;
  gentleEncouragement: string;
  playAgain: string;
  nextChallenge: string;
  audioHint: string;
  identifyPhotoPrompt: string;

  // Game 1 Specific (Smriti Rong)
  whoOrWhatIsThis: string;
  revealHint: string;
  familyTag: string;
  cultureTag: string;

  // Game 2 Specific (Memory Matrix)
  matrixInstruction: string;
  matchesFound: string;
  movesCount: string;

  // Game 3 Specific (Taal aru Xur)
  rhythmInstructions: string;
  tapOnBeat: string;
  perfectTiming: string;
  goodTiming: string;
  missedTiming: string;

  // Game 4 Specific (Pattern & Sequence)
  sequencePrompt: string;
  motifPrompt: string;

  // Game 5 Specific (Word Scramble)
  wordPrompt: string;
  wordClue: string;
  clearSelection: string;

  // Game 6 Specific (Math Maze)
  mathPrompt: string;
  solveCalculation: string;

  // Reminders & Alarms System
  remindersTitle: string;
  addReminderBtn: string;
  reminderTimeLabel: string;
  reminderTitleLabel: string;
  reminderNoteLabel: string;
  reminderFreqLabel: string;
  freqOnce: string;
  freqDaily: string;
  freqWeekdays: string;
  freqWeekly: string;
  categoryLabel: string;
  catBrain: string;
  catMedicine: string;
  catWater: string;
  catWalk: string;
  catRest: string;
  voiceAlarmLabel: string;
  alarmActiveBanner: string;
  dismissAlarm: string;
  snoozeAlarm: string;
  noRemindersScheduled: string;
  testAlarmSound: string;

  // Display & Themes System
  displaySettingsTitle: string;
  themeTitle: string;
  themeLight: string;
  themeDark: string;
  themeComfort: string;
  themeForest: string;
  themeAzure: string;
  fontScaleTitle: string;
  fontScaleNormal: string;
  fontScaleLarge: string;
  fontScaleXLarge: string;
  savePreferences: string;
  close: string;

  // Caregiver Dashboard
  caregiverDashboardTitle: string;
  ashaSupervisor: string;
  csiScoreTitle: string;
  csiDescription: string;
  stableStatus: string;
  needsAttentionStatus: string;
  memoryDomain: string;
  executiveDomain: string;
  attentionDomain: string;
  motorStabilityDomain: string;
  sevenDayTrend: string;
  memoryVaultTitle: string;
  addFamilyPhoto: string;
  photoTitleLabel: string;
  relationLabel: string;
  voicePromptLabel: string;
  saveToVault: string;
  cancel: string;
  downloadPdfReport: string;
  syncWithPhcButton: string;
  syncSuccessMessage: string;
  pendingSyncCount: string;
  simulatedHealthPost: string;
}

export const translations: Record<Language, TranslationStrings> = {
  en: {
    appName: 'Brainactiver',
    appSubtitle: 'Active Cognitive Wellness & Daily Brain Training',
    offlineBadge: '100% Offline Operational (No Internet Needed)',
    syncedBadge: 'Connected with Health Centre',
    kioskElderlyMode: 'Elderly Kiosk Mode',
    caregiverMode: 'Caregiver / Doctor Hub',
    remindersNavBtn: 'Reminders & Alarms',
    displayNavBtn: 'Theme & Font',
    pinRequiredTitle: 'Enter Caregiver Security PIN',
    pinPlaceholder: '4-digit PIN (e.g. 1234)',
    unlockButton: 'Unlock Dashboard',
    incorrectPin: 'Incorrect PIN! Please try again (Default: 1234)',
    backToHome: 'Back to Home',

    welcomePatient: 'Welcome, Shri Pranab Baruah',
    dailyRoutineGreeting: 'Wishing you an active, sharp, and peaceful day',
    todaysRoutine: "Today's Routine & Brain Schedule",
    markCompleted: 'Done ✓',
    completedBadge: 'Completed',
    listenReminder: 'Listen 🔊',
    voiceHelpButton: 'Voice Help 🎙️',
    emergencyCallButton: 'Call Family 📞',

    playGameTitle: 'Daily Cognitive Exercises & Brain Games',
    game1Title: 'Photo Memory & Recall',
    game1Subtitle: 'Identify loved ones and cherished cultural landmarks',
    game2Title: 'Memory Matrix',
    game2Subtitle: 'Flip and match pairs to strengthen spatial working memory',
    game3Title: 'Taal & Reaction Speed',
    game3Subtitle: 'Rhythm attention tapping to enhance motor reflexes',
    game4Title: 'Pattern & Sequence',
    game4Subtitle: 'Organize daily sequences and match traditional weave motifs',
    game5Title: 'Word Scramble & Recall',
    game5Subtitle: 'Reconstruct words to boost vocabulary and language recall',
    game6Title: 'Math Maze & Logic',
    game6Subtitle: 'Engage arithmetic reasoning and mental calculation',

    tapToStart: 'Tap to Play',
    level: 'Level',
    score: 'Score',
    wellDone: 'Wonderful! You solved it brilliantly!',
    gentleEncouragement: "It's alright, take your time and try gently again",
    playAgain: 'Play Again',
    nextChallenge: 'Next Challenge',
    audioHint: 'Listen to Hint 🔊',
    identifyPhotoPrompt: 'Who or what is shown in this picture?',

    whoOrWhatIsThis: 'Do you recognize this?',
    revealHint: 'Sharpen Image Hint',
    familyTag: 'Family Member',
    cultureTag: 'Cultural Heritage',

    matrixInstruction: 'Flip cards and find all matching pairs',
    matchesFound: 'Pairs Found',
    movesCount: 'Moves',

    rhythmInstructions: 'Tap exactly when the rhythmic ring aligns with the drum',
    tapOnBeat: 'Tap with the Beat!',
    perfectTiming: 'Perfect Timing! (Excellent)',
    goodTiming: 'Good Timing!',
    missedTiming: 'Slightly off beat, try again gently',

    sequencePrompt: 'Arrange the sequence in correct chronological order',
    motifPrompt: 'Select the matching traditional motif',

    wordPrompt: 'Spell the word correctly by tapping letters',
    wordClue: 'Clue',
    clearSelection: 'Clear',

    mathPrompt: 'Solve the mental math challenge',
    solveCalculation: 'What is the correct answer?',

    remindersTitle: 'Reminders & Activity Alarms',
    addReminderBtn: '+ New Reminder',
    reminderTimeLabel: 'Scheduled Time',
    reminderTitleLabel: 'Activity Title',
    reminderNoteLabel: 'Notes / Instructions',
    reminderFreqLabel: 'Repeat Frequency',
    freqOnce: 'Once',
    freqDaily: 'Every Day',
    freqWeekdays: 'Mon - Fri',
    freqWeekly: 'Weekly',
    categoryLabel: 'Category',
    catBrain: 'Brain Training',
    catMedicine: 'Medication',
    catWater: 'Hydration',
    catWalk: 'Physical Walk',
    catRest: 'Rest / Sleep',
    voiceAlarmLabel: 'Speak Voice Alarm Prompt',
    alarmActiveBanner: 'REMINDER ALARM ACTIVE NOW!',
    dismissAlarm: 'I Have Done This (Dismiss)',
    snoozeAlarm: 'Remind in 5 Min',
    noRemindersScheduled: 'No reminders currently scheduled. Tap "+ New Reminder" to set one.',
    testAlarmSound: 'Test Voice Alarm 🔔',

    displaySettingsTitle: 'Display & Accessibility Customizer',
    themeTitle: 'Visual Theme & Contrast',
    themeLight: 'Clean Light',
    themeDark: 'OLED Dark',
    themeComfort: 'Warm Comfort (Sepia)',
    themeForest: 'Serene Emerald',
    themeAzure: 'Ocean Azure',
    fontScaleTitle: 'Font Size & Readability',
    fontScaleNormal: 'Standard (100%)',
    fontScaleLarge: 'Large (115%)',
    fontScaleXLarge: 'Extra Large (130%)',
    savePreferences: 'Apply & Save Settings',
    close: 'Close',

    caregiverDashboardTitle: 'Caregiver & Clinical Monitoring Hub',
    ashaSupervisor: 'Care Supervisor: Anita Devi (ASHA Lead, Jorhat PHC)',
    csiScoreTitle: 'Cognitive Stability Index (CSI)',
    csiDescription: 'Scientific composite monitoring memory, executive logic & motor reflexes',
    stableStatus: 'Cognitively Stable (MCI Managed)',
    needsAttentionStatus: 'Alert: Mild motor delay & response latency noted',
    memoryDomain: 'Memory Recall',
    executiveDomain: 'Executive Function',
    attentionDomain: 'Attention & Reflex',
    motorStabilityDomain: 'Motor Tremor Stability',
    sevenDayTrend: '7-Day Cognitive Trajectory',
    memoryVaultTitle: 'Personalized Memory Vault',
    addFamilyPhoto: 'Add Family Photo & Voice Cue',
    photoTitleLabel: 'Photo Title / Name',
    relationLabel: 'Relationship (e.g. Grandson, Daughter)',
    voicePromptLabel: 'Voice Cue Prompt',
    saveToVault: 'Save into Local Vault',
    cancel: 'Cancel',
    downloadPdfReport: 'Download Clinical Card (PDF)',
    syncWithPhcButton: 'Sync with Health Sub-Centre',
    syncSuccessMessage: 'All offline telemetry records securely uploaded!',
    pendingSyncCount: 'telemetry packets queued offline awaiting connection',
    simulatedHealthPost: 'Linked Health Post: Titabar Primary Health Centre',
  },

  as: {
    appName: 'ব্ৰেইনএক্টিভাৰ',
    appSubtitle: 'বয়োজ্যেষ্ঠসকলৰ সক্ৰিয় জ্ঞান আৰু স্মৃতি চৰ্চা',
    offlineBadge: '১০০% অফলাইন সক্ৰিয় (ইন্টাৰনেট প্ৰয়োজন নাই)',
    syncedBadge: 'স্বাস্থ্য কেন্দ্ৰৰ সৈতে সংযুক্ত',
    kioskElderlyMode: 'বয়োবৃদ্ধ সেৱা মোড',
    caregiverMode: 'অভিভাৱক / আশা দিদি ডেশ্ববৰ্ড',
    remindersNavBtn: 'মনত পেলোৱা সূচী (Alarms)',
    displayNavBtn: 'ৰং আৰু আখৰ (Display)',
    pinRequiredTitle: 'অভিভাৱক সুৰক্ষা পিন (PIN) দিয়ক',
    pinPlaceholder: '৪-টা সংখ্যাৰ পিন (যেনে: 1234)',
    unlockButton: 'খোলা হওক',
    incorrectPin: 'ভুল পিন! অনুগ্ৰহ কৰি সঠিক পিন দিয়ক (ডিফল্ট: 1234)',
    backToHome: 'ঘৰলৈ উভতি যাওক',

    welcomePatient: 'নমস্কাৰ, প্ৰণৱ বৰুৱা ডাঙৰীয়া',
    dailyRoutineGreeting: 'আজিৰ দিনটো আপোনাৰ বাবে আনন্দদায়ক আৰু সক্ৰিয় হওক',
    todaysRoutine: 'আজিৰ কৰণীয় সূচী আৰু মগজুৰ অনুশীলন',
    markCompleted: 'কৰা হ’ল ✓',
    completedBadge: 'সম্পূৰ্ণ হ’ল',
    listenReminder: 'শুনি লওক 🔊',
    voiceHelpButton: 'সহায় লওক 🎙️',
    emergencyCallButton: 'পৰিয়ালক ফোন কৰক 📞',

    playGameTitle: 'দৈনন্দিন স্মৃতি আৰু মগজুৰ খেলসমূহ',
    game1Title: 'স্মৃতি ৰং (Photo Memory)',
    game1Subtitle: 'পৰিয়ালৰ ফটো আৰু চিনাকি অসমৰ ঐতিহ্য চিনাক্ত কৰক',
    game2Title: 'স্মৃতি মেট্ৰিক্স (Memory Matrix)',
    game2Subtitle: 'পাত লুটিয়াই একে জোৰা মিলাই কাৰ্য্যকৰী স্মৃতি বঢ়াওক',
    game3Title: 'তাল আৰু সঁহাৰি (Taal & Reaction)',
    game3Subtitle: 'ঢোল-পেঁপাৰ ছন্দত স্পৰ্শ কৰি স্নায়ৱিক গতি সক্ৰিয় ৰাখক',
    game4Title: 'ক্ৰম আৰু চানেকি (Pattern & Sequence)',
    game4Subtitle: 'দৈনন্দিন কামৰ ক্ৰম আৰু মুগা কাপোৰৰ বুটা সজাওক',
    game5Title: 'শব্দ সাঁথৰ (Word Scramble)',
    game5Subtitle: 'আখৰ মিলাই শব্দ গঠন কৰক আৰু ভাষাৰ অনুশীলন কৰক',
    game6Title: 'গণিত গোলকধাঁধা (Math Maze)',
    game6Subtitle: 'সহজ গণনা আৰু যুক্তিৰে সিদ্ধান্ত লোৱাৰ ক্ষমতা বজাই ৰাখক',

    tapToStart: 'খেলিবলৈ স্পৰ্শ কৰক',
    level: 'স্তৰ',
    score: 'পইন্ট',
    wellDone: 'বহুত ভাল হৈছে! আপুনি বৰ সুন্দৰকৈ কৰিলে!',
    gentleEncouragement: 'একো নাই, শান্ত হৈ আকৌ চেষ্টা কৰক',
    playAgain: 'আকৌ খেলক',
    nextChallenge: 'পৰৱৰ্তী স্তৰ',
    audioHint: 'ইঙ্গিত শুনক 🔊',
    identifyPhotoPrompt: 'এইখন কাৰ বা কিহৰ ফটো বাৰু?',

    whoOrWhatIsThis: 'আপুনি ইয়াক চিনি পাইছেনে?',
    revealHint: 'ইঙ্গিত স্পষ্ট কৰক',
    familyTag: 'আপোনাৰ পৰিয়াল',
    cultureTag: 'আমাৰ অসমীয়া ঐতিহ্য',

    matrixInstruction: 'কাৰ্ড লুটিয়াই একে ফটোৰ জোৰা মিলাওক',
    matchesFound: 'মিলা জোৰা',
    movesCount: 'চেষ্টা',

    rhythmInstructions: 'ঢোলৰ বৃত্তটো সোঁমাজ পালে ঠিক সময়ত স্পৰ্শ কৰক',
    tapOnBeat: 'ছন্দত স্পৰ্শ কৰক!',
    perfectTiming: 'একেবাৰে নিখুঁত! (Very Good)',
    goodTiming: 'ভাল হৈছে! (Good)',
    missedTiming: 'অলপ দেৰি হ’ল, পুনৰ চেষ্টা কৰক',

    sequencePrompt: 'দৈনন্দিন কামটো সময়ৰ ক্ৰম অনুসৰি সজাওক',
    motifPrompt: 'সঠিক অসমীয়া চানেকিটো বাচি লওক',

    wordPrompt: 'আখৰবোৰ চুই সঠিক শব্দটো সাজক',
    wordClue: 'ইঙ্গিত',
    clearSelection: 'মচি পেলাওক',

    mathPrompt: 'সহজ মগজুৰ অংকটো সমাধান কৰক',
    solveCalculation: 'সঠিক উত্তৰটো কি হ’ব?',

    remindersTitle: 'মনত পেলোৱা আৰু সতৰ্ক ঘণ্টা (Alarms)',
    addReminderBtn: '+ নতুন সময়সূচী',
    reminderTimeLabel: 'নিৰ্ধাৰিত সময়',
    reminderTitleLabel: 'কামৰ নাম',
    reminderNoteLabel: 'নিৰ্দেশনা / টোকা',
    reminderFreqLabel: 'পুনৰাবৃত্তিৰ সময়',
    freqOnce: 'কেৱল এবাৰ',
    freqDaily: 'প্ৰতিদিনে',
    freqWeekdays: 'সোমবাৰৰ পৰা শুক্ৰবাৰ',
    freqWeekly: 'সাপ্তাহিক',
    categoryLabel: 'ভাগ',
    catBrain: 'মগজুৰ খেল',
    catMedicine: 'ঔষধ গ্ৰহণ',
    catWater: 'পানী খোৱা',
    catWalk: 'চোতালত খোজ',
    catRest: 'জিৰণি / টোপনি',
    voiceAlarmLabel: 'কণ্ঠস্বৰেৰে সতৰ্কবাৰ্তা দিয়ক',
    alarmActiveBanner: 'এতিয়া কাম কৰাৰ সময় হ’ল!',
    dismissAlarm: 'কৰা হ’ল (বন্ধ কৰক)',
    snoozeAlarm: '৫ মিনিট পিছত কওক',
    noRemindersScheduled: 'কোনো নতুন সূচী নাই। যোগ কৰিবলৈ বুটাম চুই দিয়ক।',
    testAlarmSound: 'ঘণ্টাৰ শব্দ পৰীক্ষা কৰক 🔔',

    displaySettingsTitle: 'পৰ্দাৰ ৰং আৰু আখৰৰ আকাৰ',
    themeTitle: 'পৰ্দাৰ ৰং (Theme)',
    themeLight: 'উজ্জ্বল বগা (Light)',
    themeDark: 'আন্ধাৰ মোড (Dark)',
    themeComfort: 'চকুৰ আৰামদায়ক (Comfort Sepia)',
    themeForest: 'সেউজীয়া প্ৰকৃতি (Forest)',
    themeAzure: 'নদীৰ নীলা (Ocean)',
    fontScaleTitle: 'আখৰৰ আকাৰ (Font Size)',
    fontScaleNormal: 'সাধাৰণ (100%)',
    fontScaleLarge: 'ডাঙৰ (115%)',
    fontScaleXLarge: 'অতি ডাঙৰ (130%)',
    savePreferences: 'সংৰক্ষণ কৰক',
    close: 'বন্ধ কৰক',

    caregiverDashboardTitle: 'ASHA আৰু পৰিয়ালৰ নিৰীক্ষণ ফলক',
    ashaSupervisor: 'তত্ত্বাৱধায়ক: অনিতা দেৱী (ASHA কৰ্মী, যোৰহাট PHC)',
    csiScoreTitle: 'দৈনিক জ্ঞান স্থিৰতা সূচক (CSI)',
    csiDescription: 'স্মৃতি, মনোযোগ আৰু স্নায়ৱিক সঞ্চালনৰ সংযুক্ত বৈজ্ঞানিক মূল্যায়ন',
    stableStatus: 'জ্ঞান স্থিতি স্থিৰ (MCI নিয়ন্ত্ৰণত)',
    needsAttentionStatus: 'সতৰ্কতা: স্নায়ৱিক গতি অলপ মন্থৰ হৈছে',
    memoryDomain: 'স্মৃতি শক্তি (Memory Recall)',
    executiveDomain: 'দৈনন্দিন সিদ্ধান্ত (Executive Logic)',
    attentionDomain: 'মনোযোগ ও ছন্দ (Attention)',
    motorStabilityDomain: 'হাতৰ কম্পন স্থিৰতা (Motor Stability)',
    sevenDayTrend: 'বিগত ৭ দিনৰ প্ৰগতি চিত্ৰ',
    memoryVaultTitle: 'ব্যক্তিগত স্মৃতি ভাণ্ডাৰ (Memory Vault)',
    addFamilyPhoto: 'নতুন ফটো আৰু শব্দ যোগ কৰক',
    photoTitleLabel: 'ফটোৰ নাম / ব্যক্তিৰ নাম',
    relationLabel: 'সম্পৰ্ক (যেনে: নাতি, জী, নিজা ঘৰ)',
    voicePromptLabel: 'কণ্ঠস্বৰৰ নিৰ্দেশনা',
    saveToVault: 'ভাণ্ডাৰত সংৰক্ষণ কৰক',
    cancel: 'বাতিল কৰক',
    downloadPdfReport: 'PHC চিকিৎসকৰ কাৰ্ড ডাউনল’ড (PDF)',
    syncWithPhcButton: 'স্বাস্থ্য কেন্দ্ৰলৈ তথ্য প্ৰেৰণ (Sync)',
    syncSuccessMessage: 'সকলো তথ্য স্থানীয় PHC উপকেন্দ্ৰলৈ সুৰক্ষিতভাৱে প্ৰেৰণ কৰা হ’ল!',
    pendingSyncCount: 'অফলাইন সংগৃহীত তথ্য প্ৰেৰণৰ বাবে সাজু',
    simulatedHealthPost: 'সংযুক্ত উপকেন্দ্ৰ: চেলেংহাট প্ৰাথমিক স্বাস্থ্য কেন্দ্ৰ (যোৰহাট)',
  },

  bn: {
    appName: 'ব্রেইনঅ্যাক্টিভার',
    appSubtitle: 'প্রবীণদের সক্রিয় জ্ঞান ও স্মৃতি পুনরুজ্জীবন কেন্দ্র',
    offlineBadge: '১০০% অফলাইনে সম্পূর্ণ সচল (ইন্টারনেটহীন)',
    syncedBadge: 'স্বাস্থ্য কেন্দ্রের সাথে সংযুক্ত',
    kioskElderlyMode: 'প্রবীণ সহায়তা মোড',
    caregiverMode: 'তত্ত্বাবধায়ক ও আশা ড্যাশবোর্ড',
    remindersNavBtn: 'অনুস্মারক ও অ্যালার্ম (Reminders)',
    displayNavBtn: 'থিম ও হরফ (Display)',
    pinRequiredTitle: 'তত্ত্বাবধায়ক সুরক্ষা পিন (PIN) লিখুন',
    pinPlaceholder: '৪ সংখ্যার পিন (যেমন: 1234)',
    unlockButton: 'আনলক করুন',
    incorrectPin: 'ভুল পিন! সঠিক পিন দিন (ডিফল্ট: 1234)',
    backToHome: 'হোম পেজে ফিরুন',

    welcomePatient: 'নমস্কার, শ্রী প্রণব বড়ুয়া মহাশয়',
    dailyRoutineGreeting: 'আজকের দিনটি আপনার সুস্থ ও আনন্দময় কাটুক',
    todaysRoutine: 'আজকের রুটিন ও মস্তিষ্কের ব্যায়াম',
    markCompleted: 'সম্পন্ন ✓',
    completedBadge: 'সম্পন্ন হয়েছে',
    listenReminder: 'শুনে নিন 🔊',
    voiceHelpButton: 'সাহায্য নিন 🎙️',
    emergencyCallButton: 'পরিবারকে কল করুন 📞',

    playGameTitle: 'দৈনিক স্মৃতি ও বুদ্ধির খেলাসমূহ',
    game1Title: 'স্মৃতির ছবি (Photo Recall)',
    game1Subtitle: 'পরিবারের প্রিয়জন ও পরিচিত ঐতিহ্য চিনে নিন',
    game2Title: 'স্মৃতি ম্যাট্রিক্স (Memory Matrix)',
    game2Subtitle: 'কার্ড উল্টে জোড়া মিলিয়ে স্মৃতিশক্তি বাড়ান',
    game3Title: 'তাল ও প্রতিক্রিয়া (Taal & Reflex)',
    game3Subtitle: 'ঢোলের ছন্দে স্পর্শ করে স্নায়ুর গতি সক্রিয় রাখুন',
    game4Title: 'ক্রম ও নকশা (Pattern & Sequence)',
    game4Subtitle: 'দৈনন্দিন কাজের সঠিক ক্রম ও নকশা সাজান',
    game5Title: 'শব্দ ধাঁধা (Word Scramble)',
    game5Subtitle: 'বর্ণ মিলিয়ে অর্থপূর্ণ শব্দ তৈরি করুন',
    game6Title: 'গণিত গোলকধাঁধা (Math Maze)',
    game6Subtitle: 'সহজ হিসাব দিয়ে বিশ্লেষণ ক্ষমতা বাড়ান',

    tapToStart: 'খেলতে স্পর্শ করুন',
    level: 'স্তর',
    score: 'পয়েন্ট',
    wellDone: 'চমৎকার! আপনি খুব সুন্দরভাবে পেরেছেন!',
    gentleEncouragement: 'কোনো ব্যাপার নয়, শান্ত হয়ে আবার চেষ্টা করুন',
    playAgain: 'আবার খেলুন',
    nextChallenge: 'পরবর্তী স্তর',
    audioHint: 'ইঙ্গিত শুনুন 🔊',
    identifyPhotoPrompt: 'ছবিতে কাকে বা কী দেখা যাচ্ছে?',

    whoOrWhatIsThis: 'আপনি কি চিনতে পারছেন?',
    revealHint: 'ইঙ্গিত স্পষ্ট করুন',
    familyTag: 'আপনার পরিবার',
    cultureTag: 'প্রিয় ঐতিহ্য',

    matrixInstruction: 'কার্ড উল্টে একই ছবির জোড়াগুলো মেলান',
    matchesFound: 'মেলা জোড়া',
    movesCount: 'চেষ্টা',

    rhythmInstructions: 'ঢোলের বৃত্তটি কেন্দ্রে পৌঁছালে ঠিক সময়ে স্পর্শ করুন',
    tapOnBeat: 'ছন্দে স্পর্শ করুন!',
    perfectTiming: 'একদম নিখুঁত! (Excellent)',
    goodTiming: 'ভালো হয়েছে! (Good)',
    missedTiming: 'দেরি হয়ে গেছে, আবার চেষ্টা করুন',

    sequencePrompt: 'সঠিক সময়ের ক্রমানুসারে সাজান',
    motifPrompt: 'সঠিক ঐতিহ্যবাহী নকশা নির্বাচন করুন',

    wordPrompt: 'অক্ষর স্পর্শ করে সঠিক শব্দ গঠন করুন',
    wordClue: 'ইঙ্গিত',
    clearSelection: 'মুছে ফেলুন',

    mathPrompt: 'সহজ গণিতের সমাধান করুন',
    solveCalculation: 'সঠিক উত্তর কোনটি?',

    remindersTitle: 'অনুস্মারক ও সতর্কবার্তা (Alarms)',
    addReminderBtn: '+ নতুন সময়সূচি',
    reminderTimeLabel: 'নির্ধারিত সময়',
    reminderTitleLabel: 'কাজের নাম',
    reminderNoteLabel: 'নির্দেশনা / নোট',
    reminderFreqLabel: 'পুনরাবৃত্তি',
    freqOnce: 'একবার',
    freqDaily: 'প্রতিদিন',
    freqWeekdays: 'সোম - শুক্র',
    freqWeekly: 'সাপ্তাহিক',
    categoryLabel: 'বিভাগ',
    catBrain: 'মস্তিষ্কের খেলা',
    catMedicine: 'ঔষধ গ্রহণ',
    catWater: 'জল পান',
    catWalk: 'হাঁটাচলা',
    catRest: 'বিশ্রাম / ঘুম',
    voiceAlarmLabel: 'ভয়েস অ্যালার্ম সক্রিয় করুন',
    alarmActiveBanner: 'কাজের সময় হয়েছে!',
    dismissAlarm: 'হয়ে গেছে (বন্ধ করুন)',
    snoozeAlarm: '৫ মিনিট পর মনে করান',
    noRemindersScheduled: 'কোনো অনুস্মারক তৈরি করা নেই। যোগ করতে বোতামে চাপুন।',
    testAlarmSound: 'শব্দ পরীক্ষা করুন 🔔',

    displaySettingsTitle: 'ডিসপ্লে থিম ও ফন্ট সেটিং',
    themeTitle: 'পর্দার থিম (Theme)',
    themeLight: 'উজ্জ্বল সাদা (Light)',
    themeDark: 'কালো ডার্ক (Dark)',
    themeComfort: 'চোখের আরাম (Comfort Sepia)',
    themeForest: 'সবুজ প্রকৃতি (Forest)',
    themeAzure: 'সমুদ্র নীল (Azure)',
    fontScaleTitle: 'হরফের মাপ (Font Size)',
    fontScaleNormal: 'স্বাভাবিক (100%)',
    fontScaleLarge: 'বড় (115%)',
    fontScaleXLarge: 'অতি বড় (130%)',
    savePreferences: 'সংরক্ষণ করুন',
    close: 'বন্ধ করুন',

    caregiverDashboardTitle: 'তত্ত্বাবধায়ক ও আশা ক্লিনিকাল ড্যাশবোর্ড',
    ashaSupervisor: 'দায়িত্বপ্রাপ্ত কর্মী: অনিতা দেবী (আশা কর্মী, পিএইচসি)',
    csiScoreTitle: 'কগনিটিভ স্ট্যাবিলিটি ইনডেক্স (CSI)',
    csiDescription: 'স্মৃতি, মনোযোগ এবং স্নায়বিক সমন্বয়ের বৈজ্ঞানিক পরিমাপ',
    stableStatus: 'জ্ঞান স্থিতিশীল রয়েছে (MCI নিয়ন্ত্রণে)',
    needsAttentionStatus: 'সতর্কতা: প্রতিক্রিয়ার গতিতে সামান্য মন্থরতা দেখা যাচ্ছে',
    memoryDomain: 'স্মৃতিশক্তি (Memory)',
    executiveDomain: 'দৈনন্দিন সিদ্ধান্ত (Executive Logic)',
    attentionDomain: 'মনোযোগ ও ছন্দ (Attention)',
    motorStabilityDomain: 'কম্পনহীন স্থায়িত্ব (Motor Stability)',
    sevenDayTrend: 'বিগত ৭ দিনের মূল্যায়ন',
    memoryVaultTitle: 'পারিবারিক স্মৃতি ভাণ্ডার (Memory Vault)',
    addFamilyPhoto: 'নতুন ছবি ও কণ্ঠ যুক্ত করুন',
    photoTitleLabel: 'ছবির নাম / ব্যক্তির নাম',
    relationLabel: 'সম্পর্ক (যেমন: নাতি, মেয়ে)',
    voicePromptLabel: 'ভয়েস বার্তা',
    saveToVault: 'সংরক্ষণ করুন',
    cancel: 'বাতিল',
    downloadPdfReport: 'স্বাস্থ্য কার্ড ডাউনলোড (PDF)',
    syncWithPhcButton: 'স্বাস্থ্যকেন্দ্রে পাঠান (Sync)',
    syncSuccessMessage: 'সব অফলাইন তথ্য সফলভাবে স্বাস্থ্যকেন্দ্রে আপলোড হয়েছে!',
    pendingSyncCount: 'অফলাইন তথ্য আপলোডের অপেক্ষায়',
    simulatedHealthPost: 'সংযুক্ত কেন্দ্র: তিতাবর প্রাথমিক স্বাস্থ্য কেন্দ্র',
  },

  ta: {
    appName: 'Brainactiver (பிரைன்ஆக்டிவர்)',
    appSubtitle: 'முதியோர்களுக்கான நினைவாற்றல் மற்றும் அறிவாற்றல் பயிற்சி மையம்',
    offlineBadge: '100% ஆஃப்லைனில் இயங்கக்கூடியது (இணையம் தேவையில்லை)',
    syncedBadge: 'சுகாதார மையத்துடன் இணைக்கப்பட்டது',
    kioskElderlyMode: 'முதியோர் பயன்முறை (Kiosk)',
    caregiverMode: 'பராமரிப்பாளர் / ஆஷா மையம்',
    remindersNavBtn: 'நினைவூட்டல்கள் (Reminders)',
    displayNavBtn: 'வண்ணம் & எழுத்து (Display)',
    pinRequiredTitle: 'பாதுகாப்பு PIN எண்ணை உள்ளிடவும்',
    pinPlaceholder: '4 இலக்க PIN (எ.கா: 1234)',
    unlockButton: 'திறக்கவும்',
    incorrectPin: 'தவறான PIN! மீண்டும் முயற்சிக்கவும் (இயல்பு: 1234)',
    backToHome: 'முகப்பிற்கு செல்க',

    welcomePatient: 'வணக்கம், திரு. பிரணாப் பருவா',
    dailyRoutineGreeting: 'இனிய நாளாகவும் சுறுசுறுப்பான நாளாகவும் அமையட்டும்',
    todaysRoutine: 'இன்றைய அட்டவணை மற்றும் மூளைப் பயிற்சி',
    markCompleted: 'முடிந்தது ✓',
    completedBadge: 'முடிக்கப்பட்டது',
    listenReminder: 'கேளுங்கள் 🔊',
    voiceHelpButton: 'குரல் உதவி 🎙️',
    emergencyCallButton: 'குடும்பத்தை அழைக்கவும் 📞',

    playGameTitle: 'தினசரி மூளை மற்றும் நினைவாற்றல் விளையாட்டுகள்',
    game1Title: 'புகைப்பட நினைவூட்டல் (Photo Recall)',
    game1Subtitle: 'குடும்ப உறவினர்கள் மற்றும் பாரம்பரிய இடங்களை அடையாளம் காணுங்கள்',
    game2Title: 'நினைவக கட்டம் (Memory Matrix)',
    game2Subtitle: 'கார்டுகளை திருப்பி பொருத்தி நினைவாற்றலை வலுப்படுத்துங்கள்',
    game3Title: 'தாளம் & எதிர்வினை (Taal & Reflex)',
    game3Subtitle: 'தாளத்திற்கு ஏற்ப தொட்டு நரம்பு வேகத்தை அதிகரிக்கவும்',
    game4Title: 'வரிசை & வடிவமைப்பு (Pattern & Sequence)',
    game4Subtitle: 'தினசரி பழக்கங்களின் சரியான வரிசையை அமைத்து மகிழுங்கள்',
    game5Title: 'சொல் புதிர் (Word Scramble)',
    game5Subtitle: 'எழுத்துக்களை இணைத்து சொற்களை நினைவுபடுத்துங்கள்',
    game6Title: 'கணித புதிர் (Math Maze)',
    game6Subtitle: 'எளிய எண்கணித பயிற்சி மூலம் சிந்தனையை கூர்மைப்படுத்துங்கள்',

    tapToStart: 'விளையாட தொடவும்',
    level: 'நிலை',
    score: 'மதிப்பெண்',
    wellDone: 'மிக நன்று! மிக அருமையாக செய்தீர்கள்!',
    gentleEncouragement: 'பரவாயில்லை, அமைதியாக மீண்டும் முயற்சி செய்யுங்கள்',
    playAgain: 'மீண்டும் விளையாடு',
    nextChallenge: 'அடுத்த சவால்',
    audioHint: 'குறிப்பை கேளுங்கள் 🔊',
    identifyPhotoPrompt: 'படத்தில் இருப்பது யார் அல்லது என்ன?',

    whoOrWhatIsThis: 'உங்களால் அடையாளம் காண முடிகிறதா?',
    revealHint: 'படத்தை தெளிவாக்குங்கள்',
    familyTag: 'குடும்ப உறுப்பினர்',
    cultureTag: 'பாரம்பரியம்',

    matrixInstruction: 'அட்டைகளைத் திருப்பி ஒரே மாதிரியான ஜோடிகளைக் கண்டறியவும்',
    matchesFound: 'கண்டறிந்த ஜோடிகள்',
    movesCount: 'முயற்சிகள்',

    rhythmInstructions: 'தாள வட்டம் சரியாக இணையும் போது திரையைத் தொடவும்',
    tapOnBeat: 'தாளத்தில் தொடுங்கள்!',
    perfectTiming: 'துல்லியமான நேரம்! (Perfect)',
    goodTiming: 'நல்ல நேரம்! (Good)',
    missedTiming: 'சற்று தாமதம், மீண்டும் முயற்சிக்கவும்',

    sequencePrompt: 'சரியான கால வரிசைப்படி அடுக்கவும்',
    motifPrompt: 'பொருந்தும் பாரம்பரிய அமைப்பை தேர்ந்தெடுக்கவும்',

    wordPrompt: 'எழுத்துக்களைத் தொட்டு சரியான சொல்லை உருவாக்கவும்',
    wordClue: 'குறிப்பு',
    clearSelection: 'அழிக்கவும்',

    mathPrompt: 'எளிய மனக்கணக்கைத் தீர்க்கவும்',
    solveCalculation: 'சரியான விடை எது?',

    remindersTitle: 'நினைவூட்டல் மற்றும் எச்சரிக்கை மணி (Alarms)',
    addReminderBtn: '+ புதிய நினைவூட்டல்',
    reminderTimeLabel: 'திட்டமிடப்பட்ட நேரம்',
    reminderTitleLabel: 'செயல் தலைப்பு',
    reminderNoteLabel: 'குறிப்பு',
    reminderFreqLabel: 'மீண்டும் வரும் இடைவெளி',
    freqOnce: 'ஒரு முறை',
    freqDaily: 'தினசரி',
    freqWeekdays: 'திங்கள் - வெள்ளி',
    freqWeekly: 'வாராந்திரம்',
    categoryLabel: 'வகை',
    catBrain: 'மூளைப் பயிற்சி',
    catMedicine: 'மருந்து',
    catWater: 'தண்ணீர் குடித்தல்',
    catWalk: 'நடைப்பயிற்சி',
    catRest: 'ஓய்வு / தூக்கம்',
    voiceAlarmLabel: 'குரல் எச்சரிக்கையை இயக்கு',
    alarmActiveBanner: 'செயல்பாட்டிற்கான நேரம் வந்துவிட்டது!',
    dismissAlarm: 'முடித்தேன் (நிறுத்து)',
    snoozeAlarm: '5 நிமிடம் கழித்து நினைவூட்டு',
    noRemindersScheduled: 'நினைவூட்டல்கள் எதுவும் இல்லை. புதியதை சேர்க்க தொடவும்.',
    testAlarmSound: 'ஒலியை சோதிக்கவும் 🔔',

    displaySettingsTitle: 'தோற்றம் மற்றும் எழுத்து அமைப்புகள்',
    themeTitle: 'வண்ண தீம் (Theme)',
    themeLight: 'வெளிச்சம் (Light)',
    themeDark: 'இருள் (Dark)',
    themeComfort: 'கண்களுக்கு இதமான செபியா (Comfort)',
    themeForest: 'இயற்கை பச்சை (Forest)',
    themeAzure: 'கடல் நீலம் (Azure)',
    fontScaleTitle: 'எழுத்து அளவு (Font Size)',
    fontScaleNormal: 'இயல்பான அளவு (100%)',
    fontScaleLarge: 'பெரியது (115%)',
    fontScaleXLarge: 'மிகப் பெரியது (130%)',
    savePreferences: 'அமைப்புகளைச் சேமிக்கவும்',
    close: 'மூடுக',

    caregiverDashboardTitle: 'பராமரிப்பாளர் மற்றும் ஆஷா மருத்துவ மையம்',
    ashaSupervisor: 'மேற்பார்வையாளர்: அனிதா தேவி (ஆஷா பணியாளர்)',
    csiScoreTitle: 'அறிவாற்றல் நிலைத்தன்மைக் குறியீடு (CSI)',
    csiDescription: 'நினைவாற்றல் மற்றும் நரம்பு இயக்கத்தின் கூட்டு மதிப்பீடு',
    stableStatus: 'அறிவாற்றல் சீராக உள்ளது (MCI கட்டுக்குள் உள்ளது)',
    needsAttentionStatus: 'எச்சரிக்கை: லேசான தாமதம் மற்றும் மந்தநிலை காணப்படுகிறது',
    memoryDomain: 'நினைவாற்றல் (Memory)',
    executiveDomain: 'செயல்முறை தர்க்கம் (Executive Logic)',
    attentionDomain: 'கவனம் மற்றும் தாளம் (Attention)',
    motorStabilityDomain: 'நடுக்கமின்மை நிலைத்தன்மை (Motor Stability)',
    sevenDayTrend: 'கடந்த 7 நாட்களின் முன்னேற்றம்',
    memoryVaultTitle: 'தனிப்பயன் நினைவக பெட்டகம் (Memory Vault)',
    addFamilyPhoto: 'புதிய படம் மற்றும் குரல் குறிப்பைச் சேர்க்கவும்',
    photoTitleLabel: 'படத்தின் பெயர் / நபரின் பெயர்',
    relationLabel: 'உறவுமுறை (எ.கா: பேரன், மகள்)',
    voicePromptLabel: 'குரல் பதிவு',
    saveToVault: 'பெட்டகத்தில் சேமிக்கவும்',
    cancel: 'ரத்துசெய்',
    downloadPdfReport: 'மருத்துவ அறிக்கை பதிவிறக்கு (PDF)',
    syncWithPhcButton: 'சுகாதார மையத்துடன் ஒத்திசைக்கவும் (Sync)',
    syncSuccessMessage: 'அனைத்து தகவல்களும் சுகாதார மையத்திற்கு பதிவேற்றப்பட்டன!',
    pendingSyncCount: 'பதிவேற்றத்திற்காக காத்திருக்கும் ஆஃப்லைன் பதிவுகள்',
    simulatedHealthPost: 'இணைக்கப்பட்ட மையம்: திதாபர் ஆரம்ப சுகாதார மையம்',
  },

  lus: {
    appName: 'Brainactiver',
    appSubtitle: 'Pitar leh Putarte Hriatna leh Thluak Sawizawina',
    offlineBadge: '100% Offline-in a hman theih (Internet ngai lo)',
    syncedBadge: 'Hriselna Hmunpui nen inthlunzawm a ni',
    kioskElderlyMode: 'Pitar/Putar Mode',
    caregiverMode: 'ASHA / Enkawltu Hub',
    remindersNavBtn: 'Hriattirna (Reminders)',
    displayNavBtn: 'Rawng leh Hawrawp (Display)',
    pinRequiredTitle: 'Enkawltu PIN chhu lut rawh',
    pinPlaceholder: 'PIN digit 4 (eg: 1234)',
    unlockButton: 'Hawng rawh',
    incorrectPin: 'PIN a dik lo! Khawngaihin chhu nawn rawh (Default: 1234)',
    backToHome: 'In lamah let leh rawh',

    welcomePatient: 'Chibai, Pu Pranab Baruah',
    dailyRoutineGreeting: 'Vawiin ni chu hlimawm tak leh hahdam takin hmang ang che',
    todaysRoutine: 'Vawiin Tih Tur leh Thluak Sawizawina',
    markCompleted: 'Zo tawh ✓',
    completedBadge: 'Zon fel a ni',
    listenReminder: 'Ngaithla rawh 🔊',
    voiceHelpButton: 'Aw Puihna 🎙️',
    emergencyCallButton: 'Chhungte Biakna 📞',

    playGameTitle: 'Ni Tin Thluak leh Hriatna Games',
    game1Title: 'Thlalak Hriatnawnna (Photo Recall)',
    game1Subtitle: 'Chhungte leh hmun hmingthangte hria la zawng chhuak rawh',
    game2Title: 'Hriatna Matrix (Memory Matrix)',
    game2Subtitle: 'Card keu la, a inang thlang chhuak rawh',
    game3Title: 'Tuk leh Rangna (Taal & Reflex)',
    game3Subtitle: 'Khuang rik rualin hmet la, kut chêt zung zung theihna siam rawh',
    game4Title: 'Indawt Dan leh Puan Ziak (Pattern & Sequence)',
    game4Subtitle: 'Ni tin thiltih indawt dan leh puan cheimawina rem fel rawh',
    game5Title: 'Hawrawp Remkhawm (Word Scramble)',
    game5Subtitle: 'Hawrawpte remkhawm la thu awmze nei siam rawh',
    game6Title: 'Chhiarkawp Puzzle (Math Maze)',
    game6Subtitle: 'Chhiarkawp awlsam hmangin thluak ti chak rawh',

    tapToStart: 'Khel tan rawh',
    level: 'Level',
    score: 'Hmuh zat',
    wellDone: 'I ti tha lutuk e! A ropui hle mai!',
    gentleEncouragement: 'A pawi lo, muangchangin ti nawn leh rawh le',
    playAgain: 'Khel nawn rawh',
    nextChallenge: 'A dawt leh',
    audioHint: 'Puihna ngaithla rawh 🔊',
    identifyPhotoPrompt: 'Hei hi tu nge / eng nge ni le?',

    whoOrWhatIsThis: 'I hria em?',
    revealHint: 'Thlalak ti chiang rawh',
    familyTag: 'Chhungkhat',
    cultureTag: 'Hnam thil hlun',

    matrixInstruction: 'Card keu la, a inang chiah kha zawng chhuak rawh',
    matchesFound: 'Inang hmuh zat',
    movesCount: 'Tih zat',

    rhythmInstructions: 'Khuang bial a lo thlen chiah hian hmet rawh',
    tapOnBeat: 'A hun chiahah hmet rawh!',
    perfectTiming: 'A hun chiah! (Excellent)',
    goodTiming: 'A tha e! (Good)',
    missedTiming: 'I tlai deuh, ti nawn leh rawh',

    sequencePrompt: 'A hun indawt dan tur dik takin rem rawh',
    motifPrompt: 'Puan cheimawina inmil thlang rawh',

    wordPrompt: 'Hawrawp hmet la, thu dik tak siam rawh',
    wordClue: 'Puihna',
    clearSelection: 'Tifai rawh',

    mathPrompt: 'Chhiarkawp hi chawh chhuak rawh',
    solveCalculation: 'Eng nge a chhanna dik?',

    remindersTitle: 'Hriattirna leh Alarm',
    addReminderBtn: '+ Hriattirna Thar',
    reminderTimeLabel: 'Hun bituk',
    reminderTitleLabel: 'Thiltih hming',
    reminderNoteLabel: 'Hriat reng tur',
    reminderFreqLabel: 'Tih nawn dan tur',
    freqOnce: 'Vawi khat chauh',
    freqDaily: 'Ni tin',
    freqWeekdays: 'Thawhtanni - Zirtawpni',
    freqWeekly: 'Kar tin',
    categoryLabel: 'Hmun hrang',
    catBrain: 'Thluak game',
    catMedicine: 'Damdawi eina',
    catWater: 'Tui in',
    catWalk: 'Vakchhuak',
    catRest: 'Chawlhhahdam / Mut',
    voiceAlarmLabel: 'Aw hmanga alarm hriattirna',
    alarmActiveBanner: 'THILTIH A HUN TAWH E!',
    dismissAlarm: 'Ka ti zo tawh (Tih tawpna)',
    snoozeAlarm: 'Minute 5 hnuah min hriattir leh rawh',
    noRemindersScheduled: 'Hriattirna siam a la awm lo. "+ Hriattirna Thar" hmet rawh.',
    testAlarmSound: 'Alarm ri enna 🔔',

    displaySettingsTitle: 'Display & Hawrawp Siamremna',
    themeTitle: 'Theme / Rawng',
    themeLight: 'Eng fiah (Light)',
    themeDark: 'Thim (Dark)',
    themeComfort: 'Mit hahdam (Comfort Sepia)',
    themeForest: 'Hring mawi (Forest)',
    themeAzure: 'Tuifinriat pawl (Azure)',
    fontScaleTitle: 'Hawrawp Len Zawng (Font Size)',
    fontScaleNormal: 'Pangngai (100%)',
    fontScaleLarge: 'Lian (115%)',
    fontScaleXLarge: 'Lian bik (130%)',
    savePreferences: 'Duh dan vawng tha rawh',
    close: 'Khar rawh',

    caregiverDashboardTitle: 'ASHA leh Enkawltu Dashboard',
    ashaSupervisor: 'Enkawltu Lead: Anita Devi (ASHA Worker)',
    csiScoreTitle: 'Cognitive Stability Index (CSI)',
    csiDescription: 'Hriatna, ngaihtuahna leh kut chêt theihna tehkhawmna',
    stableStatus: 'Hriatna a nghet tha (MCI enkawl mek)',
    needsAttentionStatus: 'Fimkhur: Kut chêt a muang deuh',
    memoryDomain: 'Hriatna (Memory)',
    executiveDomain: 'Thutlukna siam (Executive Logic)',
    attentionDomain: 'Rilru pekna (Attention)',
    motorStabilityDomain: 'Kut khurh lohna (Motor Stability)',
    sevenDayTrend: 'Ni 7 chhunga hmasawnna',
    memoryVaultTitle: 'Chhungkua Hriatna Bawm (Memory Vault)',
    addFamilyPhoto: 'Thlalak leh Aw thar dah rawh',
    photoTitleLabel: 'Thlalak hming / Hming',
    relationLabel: 'Inlaichinna (entirnan: Tu, Fanau)',
    voicePromptLabel: 'Aw hriattirna',
    saveToVault: 'Dah tha rawh',
    cancel: 'Sut leh rawh',
    downloadPdfReport: 'Hriselna Card Download rawh (PDF)',
    syncWithPhcButton: 'Health Centre nen Sync rawh',
    syncSuccessMessage: 'Record zawng zawng PHC-ah thawn fel a ni e!',
    pendingSyncCount: 'records thawn loh la awm',
    simulatedHealthPost: 'Health Post: Titabar Primary Health Centre',
  }
};
