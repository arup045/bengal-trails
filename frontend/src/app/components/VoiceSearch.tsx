import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { toast } from 'sonner';

interface VoiceSearchProps {
  onResult: (transcript: string) => void;
  language?: string;
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({ onResult, language = 'en-US' }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    // Check if browser supports Web Speech API
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognitionInstance = new SpeechRecognition();
    recognitionInstance.continuous = false;
    recognitionInstance.interimResults = false;
    recognitionInstance.lang = language === 'bn' ? 'bn-BD' : language === 'hi' ? 'hi-IN' : 'en-US';

    recognitionInstance.onstart = () => {
      setIsListening(true);
      toast.info('Listening... Speak now!');
    };

    recognitionInstance.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      toast.success(`Heard: "${transcript}"`);
    };

    recognitionInstance.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      if (event.error === 'no-speech') {
        toast.error('No speech detected. Please try again.');
      } else if (event.error === 'not-allowed') {
        toast.error('Microphone access denied. Please enable it in settings.');
      } else {
        toast.error('Voice recognition error. Please try again.');
      }
    };

    recognitionInstance.onend = () => {
      setIsListening(false);
    };

    setRecognition(recognitionInstance);

    return () => {
      if (recognitionInstance) {
        recognitionInstance.stop();
      }
    };
  }, [language, onResult]);

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <motion.button
      onClick={toggleListening}
      className={`p-3 rounded-full transition-all ${
        isListening
          ? 'bg-red-600 text-white animate-pulse'
          : 'bg-purple-600 text-white hover:bg-purple-700'
      }`}
      whileTap={{ scale: 0.95 }}
      title="Voice Search"
    >
      {isListening ? (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1 }}
        >
          <Mic className="w-6 h-6" />
        </motion.div>
      ) : (
        <Mic className="w-6 h-6" />
      )}
    </motion.button>
  );
};
