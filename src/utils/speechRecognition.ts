/**
 * Web Speech Recognition helper for Voice Commands and Dictation
 */

export interface SpeechRecognitionResultEvent {
  transcript: string;
  isFinal: boolean;
}

export class SpeechRecognitionManager {
  private recognition: any = null;
  private isListening = false;
  private onResultCallback: ((result: SpeechRecognitionResultEvent) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private currentLanguage = 'en-IN';

  constructor() {
    const SpeechRecognitionClass = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (SpeechRecognitionClass) {
      try {
        this.recognition = new SpeechRecognitionClass();
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.maxAlternatives = 1;

        this.recognition.onresult = (event: any) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }

          const text = (finalTranscript || interimTranscript).trim();
          if (this.onResultCallback && text) {
            this.onResultCallback({
              transcript: text,
              isFinal: Boolean(finalTranscript)
            });
          }
        };

        this.recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          this.isListening = false;
          if (this.onErrorCallback) {
            this.onErrorCallback(event.error);
          }
        };

        this.recognition.onend = () => {
          this.isListening = false;
          if (this.onEndCallback) {
            this.onEndCallback();
          }
        };
      } catch (err) {
        console.warn('SpeechRecognition initialization error:', err);
      }
    }
  }

  isSupported(): boolean {
    return Boolean(
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition
    );
  }

  start(
    speechCode: string,
    onResult: (result: SpeechRecognitionResultEvent) => void,
    onError?: (error: string) => void,
    onEnd?: () => void
  ): boolean {
    this.currentLanguage = speechCode;
    this.onResultCallback = onResult;
    this.onErrorCallback = onError || null;
    this.onEndCallback = onEnd || null;

    if (!this.recognition) {
      if (onError) onError('Speech recognition not supported in this browser');
      return false;
    }

    try {
      this.recognition.lang = speechCode;
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      // If already started, stop then restart
      if (err.name === 'InvalidStateError') {
        try {
          this.recognition.stop();
          setTimeout(() => {
            try {
              this.recognition.lang = speechCode;
              this.recognition.start();
              this.isListening = true;
            } catch (e) {
              if (onError) onError(String(e));
            }
          }, 200);
          return true;
        } catch (e) {
          if (onError) onError(String(e));
        }
      }
      if (onError) onError(String(err));
      return false;
    }
  }

  stop(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (e) {
        console.warn(e);
      }
    }
    this.isListening = false;
  }

  getListeningState(): boolean {
    return this.isListening;
  }
}

export const speechManager = new SpeechRecognitionManager();
