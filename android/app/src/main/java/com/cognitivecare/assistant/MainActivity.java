package com.cognitivecare.assistant;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Get Capacitor WebView
        WebView webView = getBridge().getWebView();

        WebSettings settings = webView.getSettings();

        // JavaScript & Storage
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // IMPORTANT:
        // Keep webpage text at normal size on Android phones
        settings.setTextZoom(100);

        // Default font sizes
        settings.setDefaultFontSize(16);
        settings.setDefaultFixedFontSize(13);

        // Disable WebView zoom
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Prevent automatic wide-screen layout scaling
        settings.setUseWideViewPort(false);
        settings.setLoadWithOverviewMode(false);
    }
}
