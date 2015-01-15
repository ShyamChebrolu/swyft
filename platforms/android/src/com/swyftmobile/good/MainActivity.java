package com.swyftmobile.good;

import android.os.Bundle;

import com.good.gd.cordova.core.GDCordovaActivity;

import org.apache.cordova.Config;

public class MainActivity extends GDCordovaActivity
{
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        super.loadUrl(Config.getStartUrl());
    }
}
