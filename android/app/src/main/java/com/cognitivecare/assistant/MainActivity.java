package com.cognitivecare.assistant;

import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    // Your live Vercel website
    private static final String VERCEL_URL =
            "https://cognifit-upip.vercel.app/";

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Get Capacitor WebView
        WebView webView = getBridge().getWebView();

        WebSettings settings = webView.getSettings();

        // JavaScript & Storage
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);

        // Slightly reduce text size on Android phones
        settings.setTextZoom(85);

        // Default font sizes
        settings.setDefaultFontSize(16);
        settings.setDefaultFixedFontSize(13);

        // Disable WebView zoom controls
        settings.setBuiltInZoomControls(false);
        settings.setDisplayZoomControls(false);

        // Proper responsive mobile layout
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(false);

        // Use normal web caching
        // Vercel updates will be fetched normally
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);

        // Load the live Vercel website
        // instead of bundled Capacitor files
        webView.loadUrl(VERCEL_URL);
    }
}