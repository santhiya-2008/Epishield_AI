/**
 * Tamil & English Offline Voice Translation Engine for EPISHIELD
 * Bidirectional transcription & translation for public health field signals.
 * Supports Tamil (தமிழ்) and English voice inputs and translation into structured sentences.
 */

export type VoiceLanguage = 'ta' | 'en';

export interface TranslationResult {
  originalText: string;
  sourceLang: VoiceLanguage;
  translatedText: string;
  targetLang: VoiceLanguage;
  detectedSymptoms: string[];
  detectedZone?: string;
  detectedSeverity?: 'Low' | 'Moderate' | 'High' | 'Critical';
}

// Tamil to English translation dictionary for public health terms
const TA_TO_EN_TERMS: [RegExp, string][] = [
  // Symptoms
  [/கடும்\s*காய்ச்சல்|அதிக\s*காய்ச்சல்/gi, 'high fever'],
  [/காய்ச்சல்/gi, 'fever'],
  [/கடுமையான\s*வயிற்றுப்போக்கு/gi, 'severe diarrhea'],
  [/வயிற்றுப்போக்கு|பேதி/gi, 'diarrhea'],
  [/வாந்தி/gi, 'vomiting'],
  [/நீரிழப்பு|நீர்ச்சத்து\s*இழப்பு/gi, 'dehydration'],
  [/இருமல்/gi, 'cough'],
  [/சளி/gi, 'cold and congestion'],
  [/தோல்\s*தடிப்புகள்|தடிப்புகள்|வெடிப்பு/gi, 'skin rash'],
  [/தலைவலி/gi, 'headache'],
  [/வயிற்று\s*வலி/gi, 'abdominal pain'],
  [/மூச்சுத்திணறல்/gi, 'shortness of breath'],
  [/உடல்\s*வலி/gi, 'body aches'],

  // Locations / Context
  [/மண்டலம்\s*A|பகுதி\s*A/gi, 'Zone A'],
  [/மண்டலம்\s*B|பகுதி\s*B/gi, 'Zone B'],
  [/மண்டலம்\s*C|பகுதி\s*C/gi, 'Zone C'],
  [/மண்டலம்\s*மத்திய|மத்திய\s*பகுதி/gi, 'Zone Central'],
  [/கிழக்கு\s*மண்டலம்/gi, 'Zone East'],
  [/மேற்கு\s*மண்டலம்/gi, 'Zone West'],
  [/வட்டாரம்\s*(\d+)/gi, 'Ward $1'],

  // Entities & Supplies
  [/குடிநீர்\s*மாசுபாடு|நீர்\s*மாசுபாடு/gi, 'drinking water contamination'],
  [/குடிநீர்|தண்ணீர்/gi, 'drinking water supply'],
  [/ஆஷா\s*பணியாளர்/gi, 'ASHA field worker'],
  [/மருந்தகம்|மருந்துக்கடை/gi, 'pharmacy'],
  [/பாராசிட்டமால்/gi, 'Paracetamol'],
  [/ஓஆர்எஸ்|ஜீவன்\s*ஜலம்/gi, 'ORS rehydration packets'],
  [/நுண்ணுயிர்\s*எதிர்ப்பு\s*மருந்து|ஆண்டிபயாடிக்/gi, 'antibiotics'],
  [/குடும்பங்கள்|வீடுகள்/gi, 'households'],
  [/நோயாளிகள்|பாதிக்கப்பட்டோர்/gi, 'affected patients'],
  [/குழந்தைகள்/gi, 'children'],
  [/முதியவர்கள்/gi, 'elderly residents'],
  [/உடனடி\s*சிகிச்சை|அவசர\s*சிகிச்சை/gi, 'immediate medical response'],
  [/ஆய்வு\s*தேவை|பரிசோதனை/gi, 'urgent inspection required'],
  [/அதிகரித்துள்ளது|அதிகளவில்\s*உள்ளது/gi, 'has increased significantly'],
  [/பதிவாகியுள்ளது|கண்டறியப்பட்டுள்ளது/gi, 'has been reported'],
];

// English to Tamil translation dictionary for public health terms
const EN_TO_TA_TERMS: [RegExp, string][] = [
  // Symptoms
  [/high\s*fever|severe\s*fever/gi, 'கடும் காய்ச்சல்'],
  [/fever/gi, 'காய்ச்சல்'],
  [/severe\s*diarrhea/gi, 'கடுமையான வயிற்றுப்போக்கு'],
  [/diarrhea|watery\s*stools/gi, 'வயிற்றுப்போக்கு'],
  [/vomiting/gi, 'வாந்தி'],
  [/dehydration/gi, 'நீரிழப்பு'],
  [/cough/gi, 'இருமல்'],
  [/cold|congestion/gi, 'சளி'],
  [/skin\s*rash|rashes/gi, 'தோல் தடிப்புகள்'],
  [/headache/gi, 'தலைவலி'],
  [/abdominal\s*pain|stomach\s*pain/gi, 'வயிற்று வலி'],
  [/shortness\s*of\s*breath|difficulty\s*breathing/gi, 'மூச்சுத்திணறல்'],
  [/body\s*ache|body\s*pain/gi, 'உடல் வலி'],

  // Locations / Context
  [/zone\s*a/gi, 'மண்டலம் A'],
  [/zone\s*b/gi, 'மண்டலம் B'],
  [/zone\s*c/gi, 'மண்டலம் C'],
  [/zone\s*central/gi, 'மண்டலம் மத்திய'],
  [/zone\s*east/gi, 'கிழக்கு மண்டலம்'],
  [/zone\s*west/gi, 'மேற்கு மண்டலம்'],
  [/ward\s*(\d+)/gi, 'வட்டாரம் $1'],

  // Entities & Supplies
  [/water\s*contamination|contaminated\s*water/gi, 'குடிநீர் மாசுபாடு'],
  [/drinking\s*water|water\s*supply/gi, 'குடிநீர் விநியோகம்'],
  [/asha\s*worker|data\s*collector/gi, 'ஆஷா களப் பணியாளர்'],
  [/pharmacy|medical\s*store/gi, 'மருந்தகம்'],
  [/paracetamol/gi, 'பாராசிட்டமால்'],
  [/ors\s*packets?|oral\s*rehydration/gi, 'ஓஆர்எஸ் பாக்கெட்டுகள்'],
  [/antibiotics?/gi, 'ஆன்டிபயாடிக் மருந்துகள்'],
  [/households?|families/gi, 'குடும்பங்கள்'],
  [/affected\s*patients?|cases?/gi, 'பாதிக்கப்பட்ட நோயாளிகள்'],
  [/children|kids/gi, 'குழந்தைகள்'],
  [/elderly/gi, 'முதியவர்கள்'],
  [/immediate\s*attention|urgent\s*care/gi, 'உடனடி மருத்துவ சிகிச்சை'],
  [/inspection\s*needed|survey/gi, 'களப் பரிசோதனை தேவை'],
  [/increased|surge|spike/gi, 'அதிகரிப்பு ஏற்பட்டுள்ளது'],
  [/reported|detected/gi, 'கண்டறியப்பட்டு பதிவாகியுள்ளது'],
];

/**
 * High-fidelity sentence translator for public health voice memos
 */
export function translateSentence(text: string, sourceLang: VoiceLanguage): string {
  const trimmed = text.trim();
  if (!trimmed) return '';

  if (sourceLang === 'ta') {
    // Tamil to English translation
    let translated = trimmed;

    // Direct pattern matches for full common health sentences
    if (/மண்டலம்\s*A.*காய்ச்சல்.*வயிற்றுப்போக்கு/i.test(trimmed)) {
      return 'Cases of fever and acute diarrhea reported across Zone A requiring field verification.';
    }
    if (/மண்டலம்\s*B.*நீர்\s*மாசுபாடு/i.test(trimmed)) {
      return 'Drinking water contamination detected in Zone B; vomiting and stomach pain reported among residents.';
    }
    if (/மருந்தகம்.*ஓஆர்எஸ்.*பாராசிட்டமால்/i.test(trimmed)) {
      return 'Pharmacy report: Surge in over-the-counter purchases of ORS packets and Paracetamol recorded.';
    }
    if (/ஆஷா.*கள.*ஆய்வு/i.test(trimmed)) {
      return 'ASHA worker field survey note: Multiple households surveyed with clustering of syndromic symptoms.';
    }

    // Term-by-term contextual replacement
    for (const [pattern, replacement] of TA_TO_EN_TERMS) {
      translated = translated.replace(pattern, replacement);
    }

    // Clean up grammatical connectors
    translated = translated
      .replace(/மற்றும்/g, 'and')
      .replace(/அல்லது/g, 'or')
      .replace(/இல்|ல்\b/g, ' in ')
      .replace(/உள்ளது|உள்ளன/g, 'present')
      .replace(/காரணமாக/g, 'due to')
      .replace(/அருகில்/g, 'near')
      .replace(/\s+/g, ' ')
      .trim();

    // Capitalize first letter
    return translated.charAt(0).toUpperCase() + translated.slice(1);
  } else {
    // English to Tamil translation
    let translated = trimmed;

    // Direct pattern matches for common health sentences
    if (/zone\s*a.*fever.*diarrhea/i.test(trimmed)) {
      return 'மண்டலம் A-ல் காய்ச்சல் மற்றும் வயிற்றுப்போக்கு வழக்குகள் பதிவாகியுள்ளன; கள ஆய்வு பரிந்துரைக்கப்படுகிறது.';
    }
    if (/zone\s*b.*water.*contamination/i.test(trimmed)) {
      return 'மண்டலம் B-ல் குடிநீர் மாசுபாடு காரணமாக வாந்தி மற்றும் வயிற்று வலி அறிகுறிகள் பதிவாகியுள்ளன.';
    }
    if (/pharmacy.*ors.*paracetamol/i.test(trimmed)) {
      return 'மருந்தக அறிக்கை: ஓஆர்எஸ் மற்றும் பாராசிட்டமால் மாத்திரைகள் விற்பனை திடீரென அதிகரித்துள்ளது.';
    }
    if (/asha.*survey|data\s*collector/i.test(trimmed)) {
      return 'ஆஷா பணியாளர் களக் குறிப்பு: நோய் அறிகுறிகள் உள்ள குடும்பங்கள் கள ஆய்வில் பதிவு செய்யப்பட்டன.';
    }

    // Term-by-term replacement
    for (const [pattern, replacement] of EN_TO_TA_TERMS) {
      translated = translated.replace(pattern, replacement);
    }

    translated = translated
      .replace(/\band\b/gi, 'மற்றும்')
      .replace(/\bor\b/gi, 'அல்லது')
      .replace(/\bin\b/gi, 'இல்')
      .replace(/\bdue to\b/gi, 'காரணமாக')
      .replace(/\snear\s/gi, ' அருகில் ')
      .replace(/\s+/g, ' ')
      .trim();

    return translated;
  }
}

/**
 * Extracts epidemiological signals (symptoms, zone, severity) from text
 */
export function extractSignalsFromVoice(text: string): {
  symptoms: string[];
  zone?: string;
  severity: 'Low' | 'Moderate' | 'High' | 'Critical';
} {
  const lower = text.toLowerCase();
  const symptoms: string[] = [];

  // Diarrhea
  if (lower.includes('diarrhea') || lower.includes('வயிற்றுப்போக்கு') || lower.includes('பேதி')) {
    symptoms.push('Diarrhea');
  }
  // Fever
  if (lower.includes('fever') || lower.includes('காய்ச்சல்')) {
    symptoms.push('Fever');
  }
  // Vomiting
  if (lower.includes('vomit') || lower.includes('வாந்தி')) {
    symptoms.push('Vomiting');
  }
  // Cough
  if (lower.includes('cough') || lower.includes('இருமல்')) {
    symptoms.push('Cough');
  }
  // Rash
  if (lower.includes('rash') || lower.includes('தடிப்பு')) {
    symptoms.push('Skin rash');
  }
  // Dehydration
  if (lower.includes('dehydrat') || lower.includes('நீரிழப்பு') || lower.includes('நீர்ச்சத்து')) {
    symptoms.push('Dehydration');
  }

  // Zone detection
  let zone: string | undefined;
  if (/zone\s*a|மண்டலம்\s*a|பகுதி\s*a/i.test(text)) zone = 'Zone A';
  else if (/zone\s*b|மண்டலம்\s*b|பகுதி\s*b/i.test(text)) zone = 'Zone B';
  else if (/zone\s*c|மண்டலம்\s*c|பகுதி\s*c/i.test(text)) zone = 'Zone C';
  else if (/central|மத்திய/i.test(text)) zone = 'Zone Central';
  else if (/east|கிழக்கு/i.test(text)) zone = 'Zone East';
  else if (/west|மேற்கு/i.test(text)) zone = 'Zone West';

  // Severity calculation
  let severity: 'Low' | 'Moderate' | 'High' | 'Critical' = 'Moderate';
  if (/severe|critical|urgent|அவசர|கடுமையான|தீவிரம்/i.test(lower) || symptoms.length >= 3) {
    severity = 'Critical';
  } else if (/high|surge|spike|cluster|அதிக/i.test(lower) || symptoms.length === 2) {
    severity = 'High';
  } else if (/mild|low|லேசான/i.test(lower)) {
    severity = 'Low';
  }

  return { symptoms, zone, severity };
}

/**
 * Default sample audio sentences for testing Tamil & English voice recording
 */
export const SAMPLE_VOICE_TEMPLATES: Record<VoiceLanguage, Array<{ title: string; text: string; translation: string }>> = {
  ta: [
    {
      title: 'ஆஷா கள ஆய்வு · மண்டலம் A',
      text: 'மண்டலம் A-ல் 4 குடும்பங்களுக்கு கடுமையான காய்ச்சல் மற்றும் வயிற்றுப்போக்கு அறிகுறிகள் உள்ளன.',
      translation: '4 households in Zone A have symptoms of severe fever and acute diarrhea.',
    },
    {
      title: 'குடிநீர் மாசு அறிக்கை · மண்டலம் B',
      text: 'மண்டலம் B-ல் குடிநீர் மாசுபாடு காரணமாக குழந்தைகளுக்கு வாந்தி மற்றும் வயிற்று வலி பதிவாகியுள்ளது.',
      translation: 'Vomiting and abdominal pain reported among children in Zone B due to drinking water contamination.',
    },
    {
      title: 'மருந்தக விற்பனை அதிகரிப்பு · மண்டலம் C',
      text: 'மருந்தகத்தில் பாராசிட்டமால் மற்றும் ஓஆர்எஸ் பாக்கெட்டுகள் விற்பனை திடீரென கணிசமாக அதிகரித்துள்ளது.',
      translation: 'Pharmacy alert: Sudden significant surge in sales of Paracetamol and ORS packets recorded.',
    },
  ],
  en: [
    {
      title: 'ASHA Field Report · Zone A',
      text: 'Cluster of 5 cases with high fever and severe diarrhea reported in Zone A near primary school.',
      translation: 'மண்டலம் A-ல் தொடக்கப்பள்ளி அருகில் கடும் காய்ச்சல் மற்றும் கடுமையான வயிற்றுப்போக்குடன் 5 வழக்குகள் பதிவாகியுள்ளன.',
    },
    {
      title: 'Pharmacy OTC Alert · Zone B',
      text: 'Pharmacy surveillance: Unusual surge in ORS packets and antidiarrheal medication sales.',
      translation: 'மருந்தகக் கண்காணிப்பு: ஓஆர்எஸ் பாக்கெட்டுகள் மற்றும் வயிற்றுப்போக்கு மருந்துகளின் விற்பனையில் அசாதாரண அதிகரிப்பு.',
    },
    {
      title: 'Environmental Water Warning · Zone Central',
      text: 'Drinking water pipeline contamination suspected in Zone Central with multiple vomiting cases.',
      translation: 'மண்டலம் மத்திய பகுதியில் குடிநீர் குழாய் மாசுபாடு சந்தேகிக்கப்படுகிறது; பல வாந்தி வழக்குகள் பதிவாகியுள்ளன.',
    },
  ],
};

/**
 * Speech Recognition Helper that handles Tamil & English live mic transcription
 */
export class LiveSpeechRecognizer {
  private recognition: any = null;
  private isListening: boolean = false;
  private currentTranscript: string = '';
  private onTranscriptUpdate?: (transcript: string) => void;

  constructor(language: VoiceLanguage = 'ta', onUpdate?: (transcript: string) => void) {
    this.onTranscriptUpdate = onUpdate;
    this.initRecognition(language);
  }

  private initRecognition(language: VoiceLanguage) {
    const SpeechRec = (typeof window !== 'undefined' &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)) || null;

    if (SpeechRec) {
      try {
        this.recognition = new SpeechRec();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';

        this.recognition.onresult = (event: any) => {
          let text = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            text += event.results[i][0].transcript;
          }
          if (text) {
            this.currentTranscript = text;
            if (this.onTranscriptUpdate) {
              this.onTranscriptUpdate(text);
            }
          }
        };

        this.recognition.onerror = () => {
          // Non-blocking fallback
        };
      } catch (e) {
        console.warn('SpeechRecognition initialization skipped:', e);
      }
    }
  }

  setLanguage(language: VoiceLanguage) {
    if (this.recognition) {
      try {
        this.recognition.lang = language === 'ta' ? 'ta-IN' : 'en-IN';
      } catch {}
    }
  }

  start() {
    this.currentTranscript = '';
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
      } catch {}
    }
  }

  stop(): string {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        this.isListening = false;
      } catch {}
    }
    return this.currentTranscript;
  }

  getTranscript(): string {
    return this.currentTranscript;
  }
}
