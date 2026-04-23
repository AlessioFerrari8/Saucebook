# Saucebook - Installation and Setup Guide

Welcome! This guide will walk you through how to install and configure the **Saucebook** extension step by step.

## What is Saucebook?

Saucebook is a Chrome extension that improves your voting experience on [Flavortown](https://flavortown.hackclub.com) and lets you sync your votes to Google Drive.

## Before You Start

You'll need:
- Google Chrome browser
- A Google account
- An internet connection

## 5 Simple Steps

### STEP 1: Install the Extension

**Choose one of the two installation methods below:**

#### Method A: Install from .crx File (Recommended - Easiest)

1. **Download the Saucebook.crx file from GitHub:**
   - Go to [GitHub Releases](https://github.com/AlessioFerrari8/Saucebook/releases)
   - Find the latest release
   - Download the `.crx` file
2. **Open Chrome** and go to `chrome://extensions`
3. **Drag and drop** the `.crx` file onto the Chrome extensions page
4. Click **"Add extension"** when prompted
5. **Done!** You'll see the Saucebook icon in the top right of your browser

#### Method B: Install from Folder (For Developers)

If you have the extension folder:

1. **Open Chrome** and go to `chrome://extensions`
2. **Enable** "Developer mode" (toggle in the top right)
3. Click **"Load unpacked"**
4. **Select the extension folder**
5. **Done!** You'll see the Saucebook icon in the top right of your browser

---

### STEP 2: Create a Google Cloud Project (2 minutes)

Saucebook needs a **Google Client ID** to work. Don't worry, it's easy and free!

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **Sign in with your Google account** (if you're not already logged in)
3. In the top left, you'll find **"Select a project"** - click it
4. Click the blue **"NEW PROJECT"** button
5. Give your project a name (e.g., "Saucebook") and click **"CREATE"**
6. **Wait 1-2 minutes** for the project to be created
7. **Perfect!** When it's ready, move to the next step

---

### STEP 3: Enable Google Drive API (1 minute)

1. In the **Google Cloud Console**, click **"APIs & Services"** in the left menu
2. Click **"Library"**
3. In the search bar, type: `Google Drive API`
4. Click on the "Google Drive API" result
5. Click the large blue **"ENABLE"** button
6. **Done!** Go back (click the browser back button)

---

### STEP 4: Create the Client ID (3 minutes)

1. In the left menu, click **"APIs & Services"** → **"Credentials"**
2. Click the **"+ CREATE CREDENTIALS"** button (blue)
3. From the dropdown, select **"OAuth 2.0 Client ID"**

**If you see "OAuth consent screen":**
- Click the **"CONFIGURE CONSENT SCREEN"** button
- Select **"External"** and click **"CREATE"**
- Fill in the form with:
  - **App name**: "Saucebook"
  - **User support email**: Your email
  - **Developer contact info**: Your email
- Click **"SAVE AND CONTINUE"**
- On the "Scopes" screen, click **"SAVE AND CONTINUE"** (don't modify anything)
- Click **"SAVE AND CONTINUE"** again
- Click **"BACK TO DASHBOARD"**

**Now go back to create the Client ID:**

1. Click **"+ CREATE CREDENTIALS"** again → **"OAuth 2.0 Client ID"**
2. For "Application type", select **"Chrome Extension"**
3. **You need your extension's ID:**
   - Open another Chrome tab and type: `chrome://extensions`
   - Enable "Developer mode" (if you haven't already)
   - Copy the **ID** of your Saucebook extension (it's a long string of letters)
4. Go back to the Google Cloud Console and paste the ID in the **"Extension IDs"** field
5. Click **"CREATE"**
6. **VERY IMPORTANT**: Copy the **Client ID** that appears (it's long and ends with `.apps.googleusercontent.com`)

---

### STEP 5: Configure Saucebook with the Client ID (1 minute)

1. **Go back to Chrome** and click the **Saucebook** icon (top right of the search bar)
2. In the popup that appears, click **"Connect Google"**
3. The **"Account & Appearance"** page will open
4. Go to the **"🔧 Google Setup (Required)"** section
5. In the text field, **paste the Client ID** you copied in the previous step
6. Click the blue **"Save"** button
7. You'll see the message: **"Client ID configured"** (in green)

---

### STEP 6: Test Authentication (1 minute)

1. Go to [Flavortown](https://flavortown.hackclub.com)
2. **Open a project voting page**
3. Cast a vote or click the **"Export to Drive"** button (if it exists)
4. **Google will ask you to sign in** - Sign in with your Google account
5. **Authorize** access to Google Drive when prompted
6. **Perfect!** The extension is now ready to use 

---

## Frequently Asked Questions

### "Where do I find the extension ID?"
Go to `chrome://extensions`, enable "Developer mode" in the top right, and you'll see the ID under the Saucebook name.

### "What if I type the wrong Client ID?"
It's okay, you can change it anytime. Go to Saucebook options and update the Client ID.

### "What if I want to use a different Google account?"
Go to Saucebook options, Account section, and click **"Disconnect Google"**. Then sign in again with the new account.

### "I get an error when trying to sync to Drive"
Make sure you completed STEP 5️⃣. If the problem persists, try disconnecting and reconnecting your Google account.

### "Can I use Saucebook on Firefox?"
Yes! Use the Firefox version, but follow steps 2-5 the same way.

### "What's the difference between .crx and folder installation?"
- **.crx file**: Easy one-click installation, recommended for most users
- **Folder**: For developers who want to modify the code or use the latest version

### "Where do I get the .crx file?"
Download it from the [GitHub Releases page](https://github.com/AlessioFerrari8/Saucebook/releases) - it's the easiest way to install Saucebook!

---

## Troubleshooting

### Error: "Client ID not configured"
**Solution:** Go to STEP 5️⃣ and make sure you paste the Client ID correctly.

### Error: "OAuth2 authentication failed"
**Solution:** 
1. Verify that the Client ID is correct
2. Go to [Google Cloud Console](https://console.cloud.google.com) and verify that **Google Drive API is enabled**
3. Try disconnecting and reconnecting your account

### The extension doesn't work on Flavortown
**Solution:**
1. Reload the page (`Ctrl+R` or `Cmd+R`)
2. Make sure you completed STEP 5️⃣
3. Try disabling and re-enabling the extension in `chrome://extensions`

---

## You're All Set! 

Saucebook is now installed and configured. Enjoy the improved Flavortown experience!

**Have questions?** Contact whoever provided you with the extension or check the [GitHub documentation](https://github.com/AlessioFerrari8/Saucebook).
