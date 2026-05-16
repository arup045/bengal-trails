import React, { useEffect } from 'react';
import { MessageCircle } from 'lucide-react';

export const LiveChatWidget: React.FC = () => {
  useEffect(() => {
    // Crisp Chat Integration
    (window as any).$crisp = [];
    (window as any).CRISP_WEBSITE_ID = 'YOUR_CRISP_WEBSITE_ID'; // Replace with your Crisp ID

    const script = document.createElement('script');
    script.src = 'https://client.crisp.chat/l.js';
    script.async = true;
    document.getElementsByTagName('head')[0].appendChild(script);

    // Alternative: Intercom Integration
    // (window as any).intercomSettings = {
    //   app_id: 'YOUR_INTERCOM_APP_ID',
    //   alignment: 'right',
    //   horizontal_padding: 20,
    //   vertical_padding: 20,
    // };

    // const intercomScript = document.createElement('script');
    // intercomScript.async = true;
    // intercomScript.src = `https://widget.intercom.io/widget/YOUR_INTERCOM_APP_ID`;
    // document.body.appendChild(intercomScript);

    return () => {
      // Cleanup if needed
      const crispScript = document.querySelector('script[src="https://client.crisp.chat/l.js"]');
      if (crispScript) {
        crispScript.remove();
      }
    };
  }, []);

  // Custom chat button (optional - Crisp provides its own)
  return null;

  // Uncomment below if you want a custom trigger button
  /*
  return (
    <button
      onClick={() => {
        if ((window as any).$crisp) {
          (window as any).$crisp.push(['do', 'chat:open']);
        }
      }}
      className="fixed bottom-6 right-6 z-40 w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform"
      title="Live Chat Support"
    >
      <MessageCircle className="w-8 h-8" />
    </button>
  );
  */
};

// Crisp Chat Helper Functions
export const openChatWidget = () => {
  if ((window as any).$crisp) {
    (window as any).$crisp.push(['do', 'chat:open']);
  }
};

export const closeChatWidget = () => {
  if ((window as any).$crisp) {
    (window as any).$crisp.push(['do', 'chat:close']);
  }
};

export const sendChatMessage = (message: string) => {
  if ((window as any).$crisp) {
    (window as any).$crisp.push(['do', 'message:send', ['text', message]]);
  }
};

export const setChatUserData = (email: string, name: string) => {
  if ((window as any).$crisp) {
    (window as any).$crisp.push(['set', 'user:email', [email]]);
    (window as any).$crisp.push(['set', 'user:nickname', [name]]);
  }
};
