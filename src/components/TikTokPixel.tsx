// src/components/TikTokPixel.tsx
'use client';
import Script from 'next/script';
import { useAuth } from '../context/AuthContext';

export default function TikTokPixel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const pixelScript = `
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;
      var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){
        for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);
        return e
      };
      ttq.load=function(e,n){
        var r="https://analytics.tiktok.com/i18n/pixel/events.js";
        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        var i=document.createElement("script");
        i.type="text/javascript",i.async=!0,i.src=r+"?sdkid="+e+"&lib="+t;
        var o=document.getElementsByTagName("script")[0];
        o.parentNode.insertBefore(i,o)
      };
      
      ${isAdmin ? '// Pixel wyłączony dla adminów' : 'ttq.load("CTKK923C77U1GH2B812G");'}
      ${isAdmin ? '// Pixel wyłączony dla adminów' : 'ttq.page();'}
    }(window, document, 'ttq');
  `;

  return (
    <Script id="tiktok-pixel" strategy="afterInteractive">
      {pixelScript}
    </Script>
  );
}
